export const registerSettings = function() {
	// Register any custom module settings here
	game.settings.register("adventure-log", "adventure-log.debug", {
		name: "Enable Debug Mode",
		scope: "client",
		config: true,
		type: Boolean,
		default: false,
	});
}
