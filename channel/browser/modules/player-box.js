/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.registerModule("PlayerBox", function(sandbox){
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
						playerTree.updateData(player);
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
					AceEvent.on(tree.parent, function(command, target, e){
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
					}
				}
			});
			
			sandbox.on(events.pickSuccess, pickSuccess);
		}
	};
});