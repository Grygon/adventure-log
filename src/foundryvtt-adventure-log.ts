/**
 * Module to allow easy templated folders for GM and Player use
 * Author: Grygon
 * Software License: MIT
 */

// Import TypeScript modules
import { registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { SetupManager } from "./module/setup.js";
import { MODULE_NAME } from "./module/constants.js";

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
	console.log(`${MODULE_NAME} | Initializing foundryvtt-adventure-log`);

	// Assign custom classes and constants here

	// Register custom module settings
	registerSettings();

	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
	// Do anything after initialization but before ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
	// Do anything once the module is ready
});

/* ------------------------------------ */
/* For folder right click				*/
/* ------------------------------------ */
Hooks.on("getJournalDirectoryFolderContext", SetupManager.setMenu);

Hooks.on('renderJournalDirectory', (app: Application, html: JQuery, data: EntityData) => {
	SetupManager.onJournalsRendered(app, html, data);
});