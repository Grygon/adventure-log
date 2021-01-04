import { MODULE_ID, Settings } from "./constants";

export const registerSettings = function () {
	// Register any custom module settings here
	game.settings.register(MODULE_ID, `${MODULE_ID}.${Settings.debug}`, {
		name: "Enable Debug Mode",
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
	});
};
