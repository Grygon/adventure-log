import { TemplatedFolder } from "./templated-folder";
import { customLog } from "./helpers";
import { MODULE_ABBREV } from "./constants";
import { template } from "handlebars";

export class SetupManager {
	static setMenu(html: JQuery, options: any[]) {
		customLog("Rendering Right Click Menu");
		if (!options) {
			options = [];
		}
		options.push({
			name: "Create Templated Folder",
			icon: '<i class="fas fa-clipboard-list"></i>',
			condition: (el: HTMLElement[]) => {
				return !$(el[0]).hasClass("templated-folder");
			},
			callback: (header: any) => customLog("Temp"),
		});
	}
}

export function addButton(html: JQuery) {
	const actionButtons = html.find(".action-buttons");

	const newFolderHtml = `<button class="new-templated-folder">
			<i class="fas fa-book-reader"></i> New Templated Folder)}
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
		//@ts-ignore
		let folder = Folder.createDialog();

		console.log(folder);
	});
}

export function onJournalsRendered(
	app: Application,
	html: JQuery,
	data: EntityData
) {
	addTemplateButton(app, html, data);
}

function addTemplateButton(
	app: Application,
	html: JQuery,
	data: EntityData
) {
	// If we can't create entries, exit early
	if(!game.user.can("JOURNAL_CREATE")) return;

	// Temporary hardcoded list to get basic functionality working
	let folderIDs = ["nVNPn5GJztsPzDBI"];

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