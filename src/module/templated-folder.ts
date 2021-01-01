import { customLog } from "./helpers";

// Manager for a folder's templates
export class TemplatedFolder {
	id: string;

	constructor(header: any[]) {
		let folderEl = $(header[0].parentNode)
		this.id = folderEl.data("folder-id");
		
		customLog(`New Templated Folder ${this.id} created`);

		folderEl.addClass('templated-folder');

		JournalEntry.create({
			name: "Template",
			content: "Foo",
			folder: this.id,
			permission: {default: 3}
		})

	}

}
