/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.registerModule("LetterBox", function(sandbox){
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
	function letterDialog(data) {
		sandbox.notify(events.showDialog, {
			type: "letter",
			nick: data.nick,
			to: data.id,
			oncommand: function(command, data) {
				if (command != "ok") return;
				var letter = lib.g("inputLetter").value;
				var error = ChannelCommon.checkLetter(letter);
				if (error) {
					sandbox.notify(events.showDialog, {
						type: "error",
						message: error
					});
					return true;
				}
				chatApi.command({
					command: "letter",
					to: data.to,
					letter: letter
				});

			},
			onshow: function(data) {
				var input = lib.g("inputLetter");
				input.setSelectionRange(0, input.value.length);
				input.focus();
			}
		});
	}
	
	return {
		init: function() {
			sandbox.on(events.letterDialog, letterDialog);
			sandbox.on(events.pickSuccess, pickSuccess);
		}
	};
});