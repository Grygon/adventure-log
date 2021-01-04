import { MODULE_ID, Settings } from "./constants";

export const registerSettings = function () {
	// Register any custom module settings here

	// Whether to enable debugging
	game.settings.register(MODULE_ID, `${MODULE_ID}.${Settings.debug}`, {
		name: "Enable Debug Mode",
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
	});
	
	// All templated folders and their corresponding templates
	// This seems to be the best way to store data like this
	// Stored in format {folderID: templateID}
	game.settings.register(MODULE_ID, `${MODULE_ID}.${Settings.templates}`, {
		name: "All Templates",
		scope: "world",
		config: false,
		type: Object,
		default: {},
	});
};
