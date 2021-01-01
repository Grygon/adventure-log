import { TemplatedFolder } from "./templated-folder";
import { customLog } from "./helpers";

export class SetupManager {
	static setMenu(html: JQuery, options: any[]) {
		customLog("Rendering Right Click Menu");
		if (!options) {
			options = [];
		}
		options.push({
			name: "Create Templated Folder",
			icon: '<i class="fas fa-clipboard-list"></i>',
			condition: game.user.isGM,
			callback: (header: any) => new TemplatedFolder(header),
		});
	}
}
