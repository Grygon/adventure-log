import { customLog, loadData } from "./helpers";
import { MODULE_ID, Settings } from "./constants";
import { TemplFolderConfig } from "./templ-folder-config";

/**
 * An instance of a folder with template information set.
 */
export class TemplatedFolder extends Folder {
	/**
	 * On templated button click. For template creation
	 * @param event	ClickEvent for the stamp button
	 */
	static buttonClick(event: JQuery.ClickEvent) {
		const button = event.currentTarget;
		const folderEL = button?.parentElement?.parentElement;

		let folderID = folderEL?.dataset["folderId"];

		let folder = <TemplatedFolder>game.folders.get(folderID);

		customLog(
			`Folder ${folder.id} activated with template ${folder.template.id}`
		);

		let template = folder.template;

		let data = {
			name: folder.templateSettings.newEntryName,
			type: "Journal",
			folder: folderID,
			// Data doesn't seem to be working anyway so I'm going to leave it blank, at least for now
			data: {},
			permission: { default: Number(folder.templateSettings.newPerms) },
		};

		let title = "New Templated Entry";

		// Render the entity creation form
		renderTemplate(`templates/sidebar/entity-create.html`, {
			//@ts-ignore
			name: data.name || game.i18n.format("ENTITY.New"),
			folder: data.folder,
			type: data.type,
		}).then((html: HTMLElement) => {
			// Render the confirmation dialog window
			//@ts-ignore
			return Dialog.prompt({
				title: title,
				content: html,
				label: title,
				callback: (html: JQuery<HTMLElement>) => {
					const form = html[0].querySelector("form");
					//@ts-ignore
					const fd = new FormDataExtended(form).toObject();
					if (!fd["name"]) delete fd["name"];
					data = mergeObject(data, fd);
					JournalEntry.create(data).then(
						(newEntry: Entity<JournalEntry>) => {
							newEntry
								.update({
									content: (<any>template.data).content,
								})
								.then((arg: any) => {
									// Future-proofing a bit here
									newEntry.setFlag(
										MODULE_ID,
										"template",
										template.id
									);
									newEntry.sheet.render(true);
								});
						}
					);
				},
			});
		});
	}

	static async convertFromButton(header: JQuery<HTMLElement>) {
		let folderID = header.parent()[0].dataset["folderId"];
		if (!folderID) {
			customLog("Error converting folder--ID does not exist", 2);
			return;
		}

		let folder = game.folders.get(folderID);

		this.convertFolder(folder);
	}

	/**
	 * Given a folder's header, perform all necessary setup to convert it to a templated folder
	 * @param header Standard HTML header for the folder
	 */
	static async convertFolder(folder: Folder) {
		customLog(`Converting folder ${folder.id}`);

		folder.update({
			sorting: "m",
		});

		let data = {
			name: "Template",
			type: "Journal",
			folder: folder.id,
			// Data doesn't seem to be working anyway so I'm going to leave it blank, at least for now
			data: {
				sort: -999999,
			},
		};

		let template = await JournalEntry.create(data);

		let templateID = template.id;

		customLog(`Template ${templateID} created for folder ${folder.id}`);
		// Future-proofing a bit here
		await template.setFlag(MODULE_ID, "templateFolder", folder.id);
		template.sheet.render(true);

		// Current templates object
		let curTemplates = loadData();
		curTemplates[folder.id] = templateID;
		await game.settings.set(
			MODULE_ID,
			`${MODULE_ID}.${Settings.templates}`,
			curTemplates
		);

		let tFolder = new TemplatedFolder(folder);

		await tFolder.setOptions(defaultSettings);

		customLog(`Template registered to folder`);

		return tFolder;
	}

	/**
	 * Create a new Folder in this SidebarDirectory
	 * @param {MouseEvent} event    The originating button click event
	 * @private
	 */
	static _onCreateTemplatedFolder(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		const button = event.currentTarget;
		if (!button || !(button instanceof HTMLButtonElement)) {
			customLog("Button doesn't exist, how did you get here?", 3);
			return;
		}
		const parent = button.dataset.parentFolder;
		const data = {
			parent: parent ? parent : null,
			type: "JournalEntry",
		};
		const options = {
			top: button.offsetTop,
			left:
				window.innerWidth -
				310 -
				Number(FolderConfig.defaultOptions.width),
		};

		TemplatedFolder.createDialog(data, options);
	}

	constructor(folder: Folder) {
		super(folder.data, {});

		// Pull in data
		Object.assign(this, folder);

		let curTemplates = loadData();

		this.template = game.journal.get(curTemplates[folder.id]);

		// Temp migration code, can move to proper place in 0.3
		if(!this.templateSettings) {
			this.setOptions(defaultSettings);
		}

		game.folders.set(this.id, this);
	}

	isTemplated = true;

	template: JournalEntry;

	get templateSettings() {
		return <TemplateSettings>this.getFlag(MODULE_ID, "settings");
	}

	async setOptions(settings: TemplateSettings) {
		let curSettings = {};
		if(this.templateSettings) {
			curSettings = this.templateSettings;
		}
		await this.setFlag(MODULE_ID, "settings", mergeObject(curSettings,settings));
		customLog(`Folder ${this.id} settings data updated`);
	}

	/**
	 * Create a new Templated Folder w/ dialog to set options
	 * @param {object} data       Initial data with which to populate the creation form
	 * @param {object} options    Initial positioning and sizing options for the dialog form
	 * @return {FolderConfig}     An active FolderConfig instance for creating the new Folder entity
	 */
	static async createDialog(data: object = {}, options: object = {}) {
		const folder = new Folder(
			<EntityData>mergeObject({ sorting: "m", name: "New Templated Folder" }, data),
			{}
		);

		//@ts-ignore
		let config = new TemplFolderConfig(folder, mergeObject({ creating: true }, options));

		await config.render(true);

		return config;
	}
}

// Set default options
export let defaultSettings: TemplateSettings = {
	newEntryName: "New Entry",
	// Oberver permissions by default
	newPerms: 2,
	playerCreation: true,
};

export interface TemplatedFolder extends Folder {
	testFunc?: Function;
	isTemplated: boolean;
	template: JournalEntry;
	templateSettings: TemplateSettings;
}

export interface TemplateSettings {
	newEntryName: string;
	newPerms: number;
	playerCreation: boolean;
}
