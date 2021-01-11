import { TemplatedFolder } from "./templated-folder";
import { MODULE_ID } from "./constants";
import { unFlatten, customLog } from "./helpers";

/**
 * Edit a folder, configuring its name and appearance
 * @extends {FormApplication}
 */
export class TemplFolderConfig extends FormApplication {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["sheet", "folder-edit"],
			template: "modules/adventure-log/templates/templ-folder-edit.html",
			width: 360,
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get id() {
		return this.object.id
			? `folder-edit-${this.object.id}`
			: "folder-create";
	}

	/* -------------------------------------------- */

	/** @override */
	get title() {
		if (this.object._id)
			return `${game.i18n.localize("FOLDER.Update")}: ${
				this.object.name
			}`;
		return game.i18n.localize("FOLDER.Create");
	}

	/* -------------------------------------------- */

	/** @override */
	async getData(options: any) {
		customLog(`Editing configuration for folder ${this.object.id}`);
		return {
			folder: this.object.data,
			templFolder: this.object.templateSettings,
			sortingModes: {
				a: "FOLDER.SortAlphabetical",
				m: "FOLDER.SortManual",
			},
			submitText: game.i18n.localize(
				this.object._id ? "FOLDER.Update" : "FOLDER.Create"
			),
			editing: !(this.options.creating),
		};
	}

	/* -------------------------------------------- */

	/** @override */
	async _updateObject(event: Event, formData: any) {
		customLog(`Settings for folder ${this.object.id} updated`);
		if (!formData.parent) formData.parent = null;
		let folder: Folder;
		let created = false;
		if (this.options.creating){
			folder = await Folder.create(mergeObject(this.object.data, formData))
		} else {
			this.storeCustom(formData);
		}
		this.object.update(formData);
		if(this.options.creating) {
			debugger;
			//@ts-ignore Clunky but w/e
			this.object = await TemplatedFolder.convertFolder(folder);
			this.storeCustom(formData);
		}

	}

	storeCustom(formData: any) {
		let unFlattened = unFlatten(formData);

		this.object.setOptions(unFlattened.templFolder);
	}

	
	/** @override */
	activateListeners(html: JQuery) {
		super.activateListeners(html);

		// Set button to open template
		html.find(".edit-template").on("click", (event) => {
			this.submit({});
			(<TemplatedFolder>this.object).template.sheet.render(true);
		});
	}
}

export interface TemplFolderConfig extends FormApplication {
	object: TemplatedFolder;
}
