import { TemplatedFolder } from "./templated-folder";
import { customLog, loadData } from "./helpers";
import { MODULE_ABBREV, MODULE_ID, Settings } from "./constants";

declare var libWrapper: any;

export class SetupManager {
	static overrideFuncs() {
		libWrapper.register(
			MODULE_ID,
			"Folder.prototype.displayed",
			function () {
				//@ts-ignore
				let isTemplated = !!this.getFlag(MODULE_ID, "template");

				return (
					game.user.isGM ||
					isTemplated ||
					//@ts-ignore Just taking this from the standard function
					!!this.content.length ||
					//@ts-ignore Just taking this from the standard function
					this.children.some((c) => c.displayed)
				);
			},
			"OVERRIDE"
		);
	}

	static customProperties() {
		let curTemplates = loadData();

		for (var folderID in curTemplates) {
			let folder = game.folders.get(folderID);

			TemplatedFolder.customProperties(folder);
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
		options.push({
			name: "Create Templated Folder",
			icon: '<i class="fas fa-clipboard-list"></i>',
			condition: (el: HTMLElement[]) => {
				return !$(el[0]).parent().hasClass("templated-folder");
			},
			callback: (header: JQuery<HTMLElement>) =>
				TemplatedFolder.convertFolder(header),
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
			folder = $(html).find(`li[data-folder-id="${folderIDs[i]}"]`);
			folder.addClass("templated-folder");

			let templateButton = folder
				.find("a.create-folder")
				.after(templateButtonHtml);

			if (templateButton.length === 0) {
				templateButton = folder
					.find("header")
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
