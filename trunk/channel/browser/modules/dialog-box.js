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
	
	var handler = 0;

	function showDialog(data) {
		data._handler = handler++;
		dialogTree.appendChild(data);
		switch (data.type) {
			case "nick":
				var input = lib.g("inputNick");
				input.setSelectionRange(0, input.value.length);
				input.focus();
				break;
		}
	}
	
	function closeDialog(data) {
		dialogTree.removeNode(data);
	}

	return {
		init: function(){
			dialogTree = AceTree.create({
				fieldIdentifier: "_handler",
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
							closeDialog(node.data);
							break;
						case "ok":
							switch(node.data.type) {
								case "nick":
									var nick = lib.g("inputNick").value;
									var error = ChannelCommon.checkNick(nick);
									if (error) {
										showDialog({
											type: "error",
											message: error
										});
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
							closeDialog(node.data);
							break;
					}
				}
			});

			sandbox.on(events.showDialog, showDialog);
		}
	};
});