

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
        width: 360
      });
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    get id() {
      return this.object.id ? `folder-edit-${this.object.id}` : "folder-create";
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    get title() {
      if ( this.object._id ) return `${game.i18n.localize("FOLDER.Update")}: ${this.object.name}`;
      return game.i18n.localize("FOLDER.Create");
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    async getData(options: any) {
      return {
        folder: this.object.data,
        sortingModes: {"a": "FOLDER.SortAlphabetical", "m": "FOLDER.SortManual"},
        submitText: game.i18n.localize(this.object._id ? "FOLDER.Update" : "FOLDER.Create")
      }
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    async _updateObject(event: Event, formData: any) {
      if ( !formData.parent ) formData.parent = null;
      if ( !this.object._id ) return Folder.create(mergeObject(this.object.data, formData));
      return this.object.update(formData);
    }
  }