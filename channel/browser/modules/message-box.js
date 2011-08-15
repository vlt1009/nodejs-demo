/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.registerModule("MessageBox", function(sandbox){
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
					break;
				case "messageAdd":
					messageTree.appendChilds(item.messages);
					break;
			}
		});
	}
	
	/**
	 * 格式化事件
	 * @param {Date} time
	 */
	function formatTime(time) {
		var timeStr = lib.date.format(time, "HH:mm:ss");
		var dateStr = lib.date.format(time, "yyyy:MM:dd");
		return lib.date.format(new Date, "yyyy:MM:dd") == dateStr ? timeStr :
			[dateStr, timeStr].join(" ");
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
						ifSelf: ifSelf
					});
				},
				oncommand: function(command, node, e){
					switch (command) {
					}
				}
			});
			
			sandbox.on(events.pickSuccess, pickSuccess);
		}
	};
});