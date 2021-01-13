import { TemplatedFolder, TemplateSettings } from "./templated-folder";
import { customLog, loadData } from "./helpers";
import { MODULE_ABBREV, MODULE_ID, Settings } from "./constants";
import { TemplFolderConfig } from "./templ-folder-config";

declare var libWrapper: any;

export class SetupManager {
	static async migrate() {
		if (!game.user.isGM) return;

		let curVer = Number(
			game.modules
				.get(MODULE_ID)
				.data.version.split(".")
				.slice(0, 2)
				.join(".")
		);
		let migVer = game.settings.get(
			MODULE_ID,
			`${MODULE_ID}.${Settings.migration}`
		);

		customLog(`Current version is ${curVer}, last migrated on ${migVer}`);

		if (curVer === migVer) return;

		let journals = <Array<JournalEntry>>(<any>game.journal.entries);

		if (migVer === -1) {
			game.settings.set(
				MODULE_ID,
				`${MODULE_ID}.${Settings.migration}`,
				curVer
			);
			return;
		}

		if (migVer <= 0.2) {
			let templates = journals.filter((j) => j.data.flags.templateFolder);
			let normJournals = journals.filter((j) => j.data.flags.template);

			templates.forEach(async function (journal) {
				await journal.setFlag(
					MODULE_ID,
					"templateFolder",
					journal.data.flags.templateFolder
				);
			});
			normJournals.forEach(async function (journal) {
				await journal.setFlag(
					MODULE_ID,
					"template",
					journal.data.flags.template
				);
			});
		}
		
		game.settings.set(
			MODULE_ID,
			`${MODULE_ID}.${Settings.migration}`,
			curVer
		);
	}

	static overrideFuncs() {
		// For Folders
		// Need to put this here because by the time we start registering Templated Folders it's too late
		libWrapper.register(
			MODULE_ID,
			"Folder.prototype.displayed",
			function () {
				//@ts-ignore
				let settings = this.getFlag(MODULE_ID, "settings");

				let alwaysShow = false;

				if (settings) {
					alwaysShow = settings.playerCreation;
				}

				return (
					game.user.isGM ||
					//@ts-ignore Just taking this from the standard function
					!!this.content.length ||
					//@ts-ignore Just taking this from the standard function
					this.children.some((c) => c.displayed) ||
					alwaysShow
				);
			},
			"OVERRIDE"
		);

		// For Templates
		libWrapper.register(
			MODULE_ID,
			"JournalEntry.prototype.visible",
			function () {
				return (
					//@ts-ignore
					this.hasPerm(game.user, "OBSERVER", false) &&
					//@ts-ignore
					!this.getFlag(MODULE_ID, "templateFolder")
				);
			},
			"OVERRIDE"
		);
	}

	static createTemplates() {
		let curTemplates = loadData();

		for (var folderID in curTemplates) {
			let folder = game.folders.get(folderID);

			let template = new TemplatedFolder(folder);
		}
	}

	/**
	 * Sets up right-click menu to add a "Create Templated Folder" option, which performs creation actions on the given folder
	 * @param html 		HTML Given from hook, sidebar HTML
	 * @param options 	Options from hook containing all right-click menu items
	 */
	static setMenu(html: JQuery, options: any[]) {
		customLog("Configuring Right Click Menu");
		if (!options) {
			customLog("Issue adding right click menu--no menu items exist!", 4);
		}

		// For non-templated folders
		options.push({
			name: "Create Templated Folder",
			icon: '<i class="fas fa-clipboard-list"></i>',
			condition: (el: HTMLElement[]) => {
				return !$(el[0]).parent().hasClass("templated-folder");
			},
			callback: (header: JQuery<HTMLElement>) =>
				TemplatedFolder.convertFromButton(header),
		});

		// Edit standard edit to only exist for non-templates
		options.find((obj: any) => {
			return obj.name === "FOLDER.Edit";
		}).condition = (el: HTMLElement[]) => {
			return (
				game.user.isGM &&
				!$(el[0]).parent().hasClass("templated-folder")
			);
		};

		// For templated folders
		options.unshift({
			name: "Edit Templated Folder",
			icon: '<i class="fas fa-edit"></i>',
			condition: (el: HTMLElement[]) => {
				return (
					game.user.isGM &&
					$(el[0]).parent().hasClass("templated-folder")
				);
			},
			callback: (header: JQuery<HTMLElement>) => {
				const li = header.parent()[0];
				let data = li.dataset.folderId;
				if (!li.dataset.folderId) {
					customLog("That folder didn't have data!", 3);
					return;
				}
				const folder = game.folders.get(li.dataset.folderId);
				const options = {
					top: li.offsetTop,
					left:
						window.innerWidth -
						310 -
						<any>FolderConfig.defaultOptions.width,
				};
				new TemplFolderConfig(folder, options).render(true);
			},
		});
	}

	/**
	 * Performs all setup actions desired when journals are rendered
	 * @param app 	Page Application
	 * @param html 	Page HTML
	 * @param data 	Page data
	 */
	static onJournalsRendered(
		app: Application,
		html: JQuery,
		data: EntityData
	) {
		SetupManager.addTemplateButton(app, html, data);
		SetupManager.setClasses(html);
		//SetupManager.bindTemplatedFolder(html);
	}

	/**
	 * Adds a button to folder to create entry from template
	 * @param app 	Application from hook
	 * @param html 	HTML from hook. Expected to be sidebar html
	 * @param data 	Given data, unclear what context it is
	 */
	static addTemplateButton(app: Application, html: JQuery, data: EntityData) {
		// If we can't create entries, exit early
		if (!game.user.can("JOURNAL_CREATE")) {
			customLog("User can't create journals");
			return;
		}

		let curTemplates = loadData();
		let folderIDs = Object.keys(curTemplates);

		const templateButtonHtml = `
			<a class="template-button">
				<i class="fas fa-fw fa-stamp"></i> 
			</a>`;

		let folders = [];
		let folder: JQuery;
		for (let i = 0; i < folderIDs.length; i++) {
			let folderObj = <TemplatedFolder | Folder>(
				game.folders.get(folderIDs[i])
			);
			if (!(folderObj instanceof TemplatedFolder)) continue;
			if (!folderObj.templateSettings.playerCreation && !game.user.isGM)
				continue;

			folder = $(html).find(`li[data-folder-id="${folderIDs[i]}"]`);
			folder.addClass("templated-folder");

			let templateButton = folder
				.children("header")
				.find("a.create-folder")
				.after(templateButtonHtml);

			if (templateButton.length === 0) {
				templateButton = folder
					.children("header")
					.append(templateButtonHtml);
			}

			// Not actually sure if I'll need this, but let's keep it for now.
			folders.push(folder);

			customLog(`Folder ${folderIDs[i]} registered as templated folder`);
		}

		$("a.template-button").on("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			TemplatedFolder.buttonClick(event);
		});
	}

	/**
	 * Adds a button to top of the sidebar to create a new tFolder
	 * @param html Page HTML to add to
	 */
	static addNewFolderButton(html: JQuery) {
		const actionButtons = html.find(".action-buttons");

		const newFolderHtml = `<button class="new-templated-folder">
				<i class="fas fa-book-reader"></i> New Templated Folder
			</button>`;

		actionButtons.append(newFolderHtml);

		const button = html.find("button.new-templated-folder");

		button.on("click", (event) => {
			event.preventDefault();
			event.stopPropagation();
			const button = event.currentTarget;
			const parent = button.dataset.parentFolder;
			const data = {
				parent: parent ? parent : null,
				type: "JournalEntry",
			};
			let folder = TemplatedFolder._onCreateTemplatedFolder(<MouseEvent><any>event);

			console.log(folder);
		});
	}

	/**
	 * Assigns CSS classes to all templated folders
	 * @param html HTML to search for templates in
	 */
	static setClasses(html: JQuery<HTMLElement>) {
		let curTemplates = loadData();

		for (const folder in curTemplates) {
			let el = $(html).find(
				`li[data-entity-id="${curTemplates[folder]}"]`
			);
			if (el.length) {
				el.addClass("journal-template");
			}
		}
	}

	/**
	 * Function to clean up any folders that may no longer exist from our data
	 * GM-only
	 */
	static cleanupData() {
		if (!game.user.isGM) {
			customLog("User is not a GM!");
			return;
		}
		let curTemplates = loadData();

		for (var folderID in curTemplates) {
			if (!game.folders.get(folderID)) {
				delete curTemplates[folderID];
			}
		}

		game.settings.set(
			MODULE_ID,
			`${MODULE_ID}.${Settings.templates}`,
			curTemplates
		);
	}
}
