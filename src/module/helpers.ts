/**
 * General helper methods
 */

// For more consistent error handling
enum ErrorLevels {
	Debug,
	Low,
	Medium,
	High,
	Critical,
}

export function customLog(text: string, level: ErrorLevels = 0) {
	const prefix = `Adventure Log |`;
	switch (level) {
		case ErrorLevels["Debug"]:
			if (game.settings.get("adventure-log", "adventure-log.debug")) {
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
			break;
	}
}
