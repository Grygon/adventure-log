/**
 * Module to allow easy templated folders for GM and Player use
 * Author: Grygon
 * Software License: MIT
 */

// Import TypeScript modules
import { registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { MODULE_NAME } from "./module/constants.js";
import { SetupManager } from "./module/setup";
import { customLog } from "./module/helpers";

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
	console.log(`${MODULE_NAME} | Initializing foundryvtt-adventure-log`);

	// Assign custom classes and constants here
	if (!game.modules.get("lib-wrapper")?.active && game.user.isGM)
		customLog(
			"Module Adventure Log requires the 'libWrapper' module. Please install and activate it.",
			4
		);

	// Register custom module settings
	registerSettings();

	// Preload Handlebars templates
	await preloadTemplates();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
	// Do anything after initialization but before ready
	SetupManager.overrideFuncs();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
	// Do anything once the module is ready

	// Clean up our stored data, removing folders that no longer exist
	SetupManager.cleanupData();
	SetupManager.customProperties();
});

/* ------------------------------------ */
/* For folder right click				*/
/* ------------------------------------ */
Hooks.on("getJournalDirectoryFolderContext", SetupManager.setMenu);

Hooks.on(
	"renderJournalDirectory",
	(app: Application, html: JQuery, data: EntityData) => {
		SetupManager.onJournalsRendered(app, html, data);
	}
);
