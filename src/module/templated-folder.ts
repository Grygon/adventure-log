import { customLog } from "./helpers";

// For all templated folder actions
export function buttonClick(event: JQuery.ClickEvent) {
	const button = event.currentTarget;
	const folder = button?.parentElement?.parentElement;

	let folderID = folder?.dataset["folder-id"];

	customLog(`Folder ${folderID} activated`);

}

export function convert(header: any[]) {
	let folderEl = $(header[0].parentNode);
	let id = folderEl.data("folder-id");
	let a = game.folders.get(id);

	customLog(`New Templated Folder ${id} created`);

	a.setFlag("world","adventure-log_template",1)

	folderEl.addClass("templated-folder");

}
