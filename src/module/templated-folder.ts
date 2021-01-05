import { customLog } from "./helpers";
import { MODULE_ID } from './constants';

export class TemplatedFolder extends Folder {
	// For all templated folder actions

	/**
	 * On templated button click. For template creation
	 * @param event 
	 */
	static buttonClick(event: JQuery.ClickEvent) {
		const button = event.currentTarget;
		const folder = button?.parentElement?.parentElement;

		let folderID = folder?.dataset["folderId"];

		let folderEntity = game.folders.get(folderID);
		let templateID = folderEntity.getFlag(MODULE_ID,"template");

		customLog(`Folder ${folderID} activated with template ${templateID}`);

		let templateEntry = <EntityData<Journal>><unknown>game.journal.get(templateID);

		let data = {
			name: "New Entry",
			type: "Journal",
			// Future-proofing a bit here
			flags: {template: templateID},
			folder: folderID,
			// Data doesn't seem to be working anyway so I'm going to leave it blank, at least for now
			data: {}
		};

		let title = "New Templated Entry"

		// Render the entity creation form
		renderTemplate(`templates/sidebar/entity-create.html`, {
			//@ts-ignore
			name: data.name || game.i18n.format("ENTITY.New"),
			folder: data.folder,
			type: data.type,
		}).then((html:HTMLElement) => {
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
					data = mergeObject(fd.toObject(), data);
					JournalEntry.create(data).then((newEntry: Entity<JournalEntry>) => {
						newEntry.update({
							content: templateEntry.data.content
						}).then((arg: any) => {
							newEntry.sheet.render(true);
							
						});
					})
				}
			});
		})
	



	}

	static convert(header: any[]) {
		let folderEl = $(header[0].parentNode);
		let id = folderEl.data("folder-id");
		let a = game.folders.get(id);

		customLog(`New Templated Folder ${id} created`);


		folderEl.addClass("templated-folder");

	}

	delete(options: object | undefined = {deleteSubfolders: false, deleteContents: false}) {
		return new Promise<string>(() => {return "Custom deleted"});	
	}
}

export interface TemplatedFolder extends Folder {
	testFunc?: Function;
	isTemplated: boolean;
}