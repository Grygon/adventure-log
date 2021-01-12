export const preloadTemplates = async function () {
	const templatePaths: Array<string> = [
		// Add paths to "modules/adventure-log/templates"
  	  "modules/adventure-log/templates/templ-folder-edit.html"
	];

	return loadTemplates(templatePaths);
};
