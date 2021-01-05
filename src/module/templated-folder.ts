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
	static customProperties(folder: Folder) {
		(<TemplatedFolder>folder).isTemplated = true;
		customLog(`Custom properties set on folder ${folder.id}`);
	}

	/**
	 * On templated button click. For template creation
	 * @param event	ClickEvent for the stamp button
	 */
	static buttonClick(event: JQuery.ClickEvent) {
		const button = event.currentTarget;
		const folder = button?.parentElement?.parentElement;

		let folderID = folder?.dataset["folderId"];

		let folderEntity = game.folders.get(folderID);
		let templateID = folderEntity.getFlag(MODULE_ID, "template");

		customLog(`Folder ${folderID} activated with template ${templateID}`);

		let templateEntry = <EntityData<Journal>>(
			(<unknown>game.journal.get(templateID))
		);

		let data = {
			name: "New Entry",
			type: "Journal",
			// Future-proofing a bit here
			flags: { template: templateID },
			folder: folderID,
			// Data doesn't seem to be working anyway so I'm going to leave it blank, at least for now
			data: {},
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
					const fd = new FormDataExtended(form);
					if (!fd["name"]) delete fd["name"];
					data = mergeObject(data, fd.toObject());
					JournalEntry.create(data).then(
						(newEntry: Entity<JournalEntry>) => {
							newEntry
								.update({
									content: templateEntry.data.content,
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
	static convertFolder(header: JQuery<HTMLElement>) {
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

		JournalEntry.create(data).then((template: Entity<JournalEntry>) => {
			// Guess we have to check this again here or TS will complain. Oh well.
			if (!folderID) {
				customLog("Error converting folder--ID does not exist", 2);
				return;
			}

			let templateID = template.id;

			customLog(`Template ${templateID} created for folder ${folderID}`);
			template.sheet.render(true);

			// Current templates object
			let curTemplates = loadData();
			curTemplates[folderID] = templateID;
			game.settings.set(
				MODULE_ID,
				`${MODULE_ID}.${Settings.templates}`,
				curTemplates
			);

			// Going to register this directly on the folder
			folder.setFlag("adventure-log", "template", templateID);

			customLog(`Template registered to folder`);
		});
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
}

export interface TemplatedFolder extends Folder {
	testFunc?: Function;
	isTemplated: boolean;
}
