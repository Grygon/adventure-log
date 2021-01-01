export const preloadTemplates = async function() {
	const templatePaths: Array<string> = [
		// Add paths to "modules/foundryvtt-adventure-log/templates"
	];

	return loadTemplates(templatePaths);
}
