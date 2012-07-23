/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addModule("MessageBox", function(sandbox){
	/**
	 * 事件集合
	 */
	var events = sandbox.getConfig("Events");
	/**
	 * 类库
	 */
	var lib = sandbox.getLib();
	/**
	 * 消息列表
	 */
	var messageTree;
	/**
	 * 登录信息
	 */
	var passportInfo = {};
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
				case "messageAll":
					messageTree.loadChilds(item.messages);
					scrollBottom();
					break;
				case "messageAdd":
					messageTree.appendChilds(item.messages);
					scrollBottom();
					break;
			}
		});
	}
	/**
	 * 滚动到底部
	 */
	function scrollBottom() {
		var parent = messageTree.parent.parentNode;
		parent.scrollTop = parent.scrollHeight;
	}
	
	/**
	 * 格式化时间
	 * @param {Date} time
	 */
	function formatTime(time) {
		time = new Date(time);
		var timeStr = lib.date.format(time, "HH:mm:ss");
		var dateStr = lib.date.format(time, "yyyy-MM-dd");
		return lib.date.format(new Date, "yyyy-MM-dd") == dateStr ? timeStr :
			[dateStr, timeStr].join(" ");
	}

	/**
	 * 处理多行文本
	 * @param {String} text 文本
	 */
	function mutiline(text) {
		return lib.encodeHTML(text).replace(/\n/g, "<br/>");
	}
	
	return {
		init: function() {
			messageTree = AceTree.create({
				parent: lib.g("messageListTemplate").parentNode,
				oninit: function(tree){
					tree.eventHandler = AceEvent.on(tree.parent, function(command, element, e){
						var node = tree.node4target(element);
						node && tree.oncommand(command, node, e);
					});
				},
				onreader: function(node){
					return AceTemplate.format('messageListTemplate', node.data, {
						node: node,
						formatTime: formatTime,
						mutiline: mutiline
					});
				},
				oncommand: function(command, node, e){
					switch (command) {
						case "letter":
							sandbox.fire(events.letterDialog, {
								nick: node.data.nick,
								to: node.data.from
							});
							break;
					}
				},
				statusClasses: /^(focus|hover|select|expand|self)$/,
				oncreated: function(node) {
					node.setStatus("self", node.data.from == passportInfo.id, true);
				}
			});
			
			sandbox.on(events.pickSuccess, pickSuccess);
		}
	};
});