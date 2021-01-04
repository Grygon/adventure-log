import { customLog } from "./helpers";

export class TemplatedFolder {
	// For all templated folder actions
	static buttonClick(event: JQuery.ClickEvent) {
		const button = event.currentTarget;
		const folder = button?.parentElement?.parentElement;

		let folderID = folder?.dataset["folderId"];

		let folderEntity = game.folders.get(folderID);
		let templateID = folderEntity.getFlag("adventure-log","template");

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

		JournalEntry.create(data).then((newEntry: Entity<JournalEntry>) => {
			newEntry.update({
				content: templateEntry.data.content
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
}