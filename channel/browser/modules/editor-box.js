/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addModule("EditorBox", function(sandbox){
	/**
	 * 事件集合
	 */
	var events = sandbox.getConfig("Events");
	/**
	 * 类库
	 */
	var lib = sandbox.getLib();
	/**
	 * 聊天室api
	 */
	var chatApi = sandbox.getExtension("ChatApi");

	return {
		init: function(){
			var eventHandler = AceEvent.on("editorTools", function(command, element, e){
				switch (command) {
					case "send":
						var text = lib.g("editor").value;
						if (!text) return;
						chatApi.command({
							command: "talk",
							text: text
						}, function(data) {
							if (!data || data.result != "ok") return;
							lib.g('editor').value = "";
						});
						break;
					case "focus":
						lib.g('editor').focus();
						break;
				}
			});
			
			lib.on('editor', 'keydown', function(e){
				switch (e.which || e.keyCode || e.charCode) {
					case 13:
						if (!(lib.g("ctrlEnter").checked ^ e.ctrlKey)) {
							lib.event.stop(e);
							AceEvent.fire(eventHandler, "send");
						}
						break;
				}
			});
		}
	};
});
