/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addModule("PlayerBox", function(sandbox){
	/**
	 * 事件集合
	 */
	var events = sandbox.getConfig("Events");
	/**
	 * 类库
	 */
	var lib = sandbox.getLib();
	/**
	 * 用户列表
	 */
	var playerTree;
	/**
	 * 登录信息
	 */
	var passportInfo = {};
	/**
	 * 聊天室api
	 */
	var chatApi = sandbox.getExtension("ChatApi");
	/**
	 * 获取房间当前状态成功
	 * @param {Object} data
	 */
	function pickSuccess(data) {
		lib.each(data, function(item) {
			switch(item.type) {
				case "passport":
					passportInfo = item.info;
					break;
				case "playerAll":
					playerTree.loadChilds(item.players);
					break;
				case "playerAdd":
					playerTree.appendChilds(item.players);
					break;
				case "playerUpdate":
					lib.each(item.players, function(player) {
						var node = playerTree.updateData(player);
						if (passportInfo.id == player.id) {
							passportInfo.nick = node.data.nick;
						}
					});
					break;
				case "playerRemove":
					lib.each(item.players, function(player) {
						playerTree.removeNode(player);
					});
					break;
			}
		});
	}
	/**
	 * 是否是自己的账号
	 * @param {String} id
	 */
	function ifSelf(id) {
		return id == passportInfo.id ? "self" : "";
	}
	
	return {
		init: function() {
			playerTree = AceTree.create({
				parent: lib.g("playerListTemplate").parentNode,
				oninit: function(tree){
					tree.eventHandler = AceEvent.on(tree.parent, function(command, target, e){
						var node = tree.node4target(target);
						node && tree.oncommand(command, node, e);
					});
				},
				onreader: function(node){
					return AceTemplate.format('playerListTemplate', node.data, {
						node: node,
						ifSelf: ifSelf
					});
				},
				oncommand: function(command, node, e){
					switch (command) {
						case "focus":
							node.focus();
							sandbox.fire(events.playerFocus, {
								info: node.data
							});
							break;
						case "letter":
							sandbox.fire(events.letterDialog, {
								nick: node.data.nick,
								to: node.data.id
							});
							break;
					}
				}
			});
			
			sandbox.on(events.pickSuccess, pickSuccess);
			AceEvent.on('playerTools', function(command) {
				switch (command) {
					case "nick":
						sandbox.fire(events.showDialog, {
							type: "nick",
							maxNick: ChannelCommon.maxNick,
							nick: passportInfo.nick,
							oncommand: function(command, data) {
								if (command != "ok") return;
								var nick = lib.g("inputNick").value;
								var error = ChannelCommon.checkNick(nick);
								if (error) {
									sandbox.fire(events.showDialog, {
										type: "error",
										message: error
									});
									return true;
								}
								if (nick != data.nick) {
									chatApi.command({
										command: "nick",
										nick: nick
									});
								}
							},
							onshow: function(data) {
								var input = lib.g("inputNick");
								input.setSelectionRange(0, input.value.length);
								input.focus();
							}
						});
						break;
					case "viewLetter":
						sandbox.fire(events.viewLetter);
						break;
				}
			});
		}
	};
});