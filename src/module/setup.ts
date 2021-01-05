import { TemplatedFolder } from "./templated-folder";
import { customLog, loadData } from "./helpers";
import { MODULE_ABBREV, MODULE_ID, Settings } from './constants';

declare var libWrapper: any;

export class SetupManager {


	static overrideFuncs() {
		libWrapper.register(MODULE_ID, 'Folder.prototype.displayed', function() {
			// This will be a little expensive, but oh well
			//@ts-ignore
			let isTemplated = this._id in loadData();

			//@ts-ignore Easier than overriding "this" each time
			return  game.user.isGM || isTemplated || !!this.content.length || this.children.some(c => c.displayed);
		}, 'OVERRIDE');
	}


	static customProperties() {
		let curTemplates = loadData();

		for(var folderID in curTemplates) {
			let folder = game.folders.get(folderID);

			(<TemplatedFolder>folder).isTemplated = true;
			customLog(`Custom properties set on folder ${folderID}`);
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
			customLog("Issue adding right click menu--no menu items exist!",4);
		}
		options.push({
			name: "Create Templated Folder",
			icon: '<i class="fas fa-clipboard-list"></i>',
			condition: (el: HTMLElement[]) => {
				return !$(el[0]).parent().hasClass("templated-folder");
			},
			callback: (header: JQuery<HTMLElement>) => SetupManager.convertFolder(header),
		});
/** 
		customLog("Configuring folder deletion");
		let removeOption = options.find((item) => item.name === 'FOLDER.Remove');
		let deleteOption = options.find((item) => item.name === 'FOLDER.Delete');
		if(!removeOption) {
			customLog("Unable to safely bind folder removal. Please report this",3);
		} else {
			// We're gonna do what's called a pro gamer move
			let cached = removeOption.callback
			
			let callBack = function(header: JQuery<HTMLElement>, isDelete: boolean) {
				const li = header.parent();
				if(li.hasClass("templated-folder")) {
					const folderID = li.data("folderId");

					let folder = game.folders.get(folderID);

					//@ts-ignore
					folder.delete = ((options) => {
						console.log("Foo");

						folder.delete({deleteSubfolders: isDelete, deleteContents: isDelete})
					})
	
					customLog(`Removing templated folder ${folderID}`);

					let newTemplates = game.settings.get(MODULE_ID, `${MODULE_ID}.${Settings.templates}`);
					delete newTemplates[folderID];
					game.settings.set(MODULE_ID, `${MODULE_ID}.${Settings.templates}`, newTemplates)

					customLog(`Templated folder removed, remaining templates: ${Object.keys(newTemplates).toString()}`);
				}
				cached(header);
			}

			removeOption.callback = callBack;
		}*/

	}

	static convertFolder(header: JQuery<HTMLElement>) {
		let folderID = header.parent()[0].dataset["folderId"];
		if(!folderID) {
			customLog("Error converting folder--ID does not exist",2);
			return;
		}

		let folder = game.folders.get(folderID);

		customLog(`Converting folder ${folderID}`);

		let data = {
			name: "Template",
			type: "Journal",
			// Future-proofing a bit here
			flags: {templateFolder: folderID},
			folder: folderID,
			// Data doesn't seem to be working anyway so I'm going to leave it blank, at least for now
			data: {}
		};

		JournalEntry.create(data).then((template: Entity<JournalEntry>) => {
			// Guess we have to check this again here or TS will complain. Oh well.
			if(!folderID) {
				customLog("Error converting folder--ID does not exist",2);
				return;
			}
	
			let templateID = template.id;
	
			customLog(`Template ${templateID} created for folder ${folderID}`);
			template.sheet.render(true);
	
			// Current templates object
			let curTemplates = loadData();
			curTemplates[folderID] = templateID;
			game.settings.set(MODULE_ID, `${MODULE_ID}.${Settings.templates}`, curTemplates)
	
			// Going to register this directly on the folder 
			folder.setFlag("adventure-log","template",templateID)
	
			customLog(`Template registered to folder`)
		})


	}

	/**
	 * Performs all setup actions desired when journals are rendered
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
	static addTemplateButton(
		app: Application,
		html: JQuery,
		data: EntityData
	) {
		// If we can't create entries, exit early
		if(!game.user.can("JOURNAL_CREATE")) {
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
	
			if(templateButton.length === 0) {
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
		})
	}
	
	static setClasses(html: JQuery<HTMLElement>) {
		let curTemplates = loadData();

		for(const folder in curTemplates) {
			let el = $(html).find(`li[data-entity-id="${curTemplates[folder]}"]`);
			if(el.length) {
				el.addClass('journal-template');
			}
		}
	}

	/**
	 * Function to clean up any folders that may no longer exist from our data
	 * GM-only
	 */
	static cleanupData() {
		if(!game.user.isGM) {
			customLog("User is not a GM!")
			return;
		}
		let curTemplates = loadData();

		for(var folderID in curTemplates) {
			if(!game.folders.get(folderID)) {
				delete curTemplates[folderID];
			}
		}

		game.settings.set(MODULE_ID, `${MODULE_ID}.${Settings.templates}`, curTemplates);
	}

	/**
	 * 
	static bindTemplatedFolder(html: JQuery<HTMLElement>) {
		let curTemplates = game.settings.get(MODULE_ID, `${MODULE_ID}.${Settings.templates}`)

		for (var folderID in curTemplates) {
			let folder: TemplatedFolder = game.folders.get(folderID);
			if(!folder) {
				delete curTemplates[folderID];
			} else {
				folder.testFunc = function () {
					customLog("AFASDFASDFASDFASDF");
					debugger;
				}
			}
		}


		game.settings.set(MODULE_ID, `${MODULE_ID}.${Settings.templates}`, curTemplates)

	}
	 */
}

