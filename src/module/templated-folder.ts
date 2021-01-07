import { customLog, loadData } from "./helpers";
import { MODULE_ID, Settings } from "./constants";

/**
 * Pseudo-class for use on all templated folder actions
 * Currently we aren't using the extension, but perhaps in the future
 */
export class TemplatedFolder extends Folder {
	/**
	 * Assigns all custom TemplatedFolder properties to the given folder
	 * @param folder Folder that should be treated as a TemplatedFolder after setup
	 */
	static customProperties(folder: TemplatedFolder) {
		let curTemplates = loadData();

		folder.isTemplated = true;

		folder.template = game.journal.get(curTemplates[folder.id]);

		folder.templateSettings = folder.getFlag(MODULE_ID, "settings");

		customLog(`Custom properties set on folder ${folder.id}`);
	}

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
			// Future-proofing a bit here
			flags: { template: template.id },
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
									newEntry.sheet.render(true);
								});
						}
					);
				},
			});
		});
	}

	/**
	 * Given a folder's header, perform all necessary setup to convert it to a templated folder
	 * @param header Standard HTML header for the folder
	 */
	static async convertFolder(header: JQuery<HTMLElement>) {
		let folderID = header.parent()[0].dataset["folderId"];
		if (!folderID) {
			customLog("Error converting folder--ID does not exist", 2);
			return;
		}

		let folder = game.folders.get(folderID);

		customLog(`Converting folder ${folderID}`);

		folder.update({
			sorting: "m",
		});

		let data = {
			name: "Template",
			type: "Journal",
			// Future-proofing a bit here
			flags: { templateFolder: folderID },
			folder: folderID,
			// Data doesn't seem to be working anyway so I'm going to leave it blank, at least for now
			data: {
				sort: -999999,
			},
		};

		let template = await JournalEntry.create(data);

		let templateID = template.id;

		customLog(`Template ${templateID} created for folder ${folderID}`);
		template.sheet.render(true);

		// Current templates object
		let curTemplates = loadData();
		curTemplates[folderID] = templateID;
		await game.settings.set(
			MODULE_ID,
			`${MODULE_ID}.${Settings.templates}`,
			curTemplates
		);

		// Set default options
		let defaultSettings: TemplateSettings = {
			newEntryName: "New Entry",
			// Oberver permissions by default
			newPerms: 2,
		};

		await TemplatedFolder.setOptions(
			<TemplatedFolder>folder,
			defaultSettings
		);
		TemplatedFolder.customProperties(<TemplatedFolder>folder);

		customLog(`Template registered to folder`);
	}

	// TODO: Delete templated folders properly
	delete(
		options: object | undefined = {
			deleteSubfolders: false,
			deleteContents: false,
		}
	) {
		return new Promise<string>(() => {
			return "Custom deleted";
		});
	}

	static async setOptions(
		folder: TemplatedFolder,
		settings: TemplateSettings
	) {
		await folder.setFlag(MODULE_ID, "settings", settings);
		folder.templateSettings = settings;
		customLog(`Folder ${folder.id} settings data updated`);
	}
}

export interface TemplatedFolder extends Folder {
	testFunc?: Function;
	isTemplated: boolean;
	template: JournalEntry;
	templateSettings: TemplateSettings;
}

export interface TemplateSettings {
	newEntryName: string;
	newPerms: number;
}
