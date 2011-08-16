/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.registerModule("DialogBox", function(sandbox){
	/**
	 * 事件集合
	 */
	var events = sandbox.getConfig("Events");
	/**
	 * 类库
	 */
	var lib = sandbox.getLib();
	/**
	 * 日志分析器
	 */
	var logger = sandbox.getLogger();
	/**
	 * 聊天室api
	 */
	var chatApi = sandbox.getExtension("ChatApi");

	function showDialog(data) {
		lib.show('masks');
		logger.info(data);
		dialogTree.loadChilds([data]);
	}
	
	function closeDialog() {
		dialogTree.removeAll();
		lib.hide('masks');
	}

	return {
		init: function(){
			dialogTree = AceTree.create({
				parent: lib.g("dialogTemplate").parentNode,
				oninit: function(tree){
					tree.eventHandler = AceEvent.on(tree.parent, function(command, element, e){
						var node = tree.node4target(element);
						node && tree.oncommand(command, node, e);
					});
				},
				onreader: function(node){
					return AceTemplate.format('dialogTemplate', node.data);
				},
				oncommand: function(command, node, e){
					switch (command) {
						case "cancel":
							closeDialog();
							break;
						case "ok":
							switch(node.data.type) {
								case "nick":
									var nick = lib.g("inputNick").value;
									if (/^\s*$/.test(nick)) {
										alert("nick is invalid.");
										return;
									}
									if (nick != node.data.nick) {
										chatApi.command({
											command: "nick",
											nick: nick
										});
									}
									break;
							}
							closeDialog();
							break;
					}
				}
			});

			sandbox.on(events.showDialog, showDialog);
		}
	};
});