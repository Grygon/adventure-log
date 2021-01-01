/**
 * Module to allow easy templated folders for GM and Player use
 * Author: Grygon
 * Software License: MIT
 */

// Import TypeScript modules
import { registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { SetupManager } from "./module/setup.js";

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
	console.log("Adventure Log | Initializing foundryvtt-adventure-log");

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
