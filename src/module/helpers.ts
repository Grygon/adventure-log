/**
 * General helper methods
 */

import { MODULE_ID, MODULE_NAME, Settings } from "./constants";

// For more consistent error handling
enum ErrorLevels {
	Debug,
	Low,
	Medium,
	High,
	Critical,
}

export function customLog(text: string, level: ErrorLevels = 0) {
	const prefix = `${MODULE_NAME} |`;
	switch (level) {
		case ErrorLevels["Debug"]:
			if (
				game.settings.get(MODULE_ID, `${MODULE_ID}.${Settings.debug}`)
			) {
				console.log(`${prefix} Debug: ${text}`);
			}
			break;
		case ErrorLevels["Low"]:
			console.log(`${prefix} Warning: ${text}`);
			break;
		case ErrorLevels["Medium"]:
			console.warn(`${prefix} Error: ${text}`);
			ui.notifications.warn(`Warning - ${text}`);
			break;
		case ErrorLevels["High"]:
			console.error(`${prefix} Error: ${text}`);
			ui.notifications.error(`Error - ${text}`);
			break;
		case ErrorLevels["Critical"]:
			console.error(`${prefix} Error: ${text}`);
			ui.notifications.error(`Critical Error! - ${text}`);
			throw `${prefix} Error: ${text}`;
			break;
	}
}

export function loadData() {
	return game.settings.get(MODULE_ID, `${MODULE_ID}.${Settings.templates}`);
}

export function unFlatten(data: any): any {
	// https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects

	"use strict";
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
        resultholder: any = {};
    for (var p in data) {
        var cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
}