/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addModule("ZhouziBox", function(sandbox){
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
	var zhouziTree;
	/**
	 * 登录信息
	 */
	var passportInfo = {};
	
	var rowCount = 9;
	
	var colCount = 9;
	
	var currPlayer;
	var player1;
	var player2;
	function updatePlayer(){
		lib.removeClass('zhouziBox', 'player1');
		lib.removeClass('zhouziBox', 'player2');
		if (currPlayer == passportInfo.id){
			if (currPlayer == player1){
				lib.addClass('zhouziBox', 'player1');
			}
			if (currPlayer == player2){
				lib.addClass('zhouziBox', 'player2');
			}
		}
	}
	function zhouziMove(item){
		for(var path in item.updates){
			zhouziTree.updateData({
				id: path,
				value: item.updates[path]
			});
		}
		currPlayer = item.currPlayer;
		updatePlayer();
	}
	
	function zhouziPlug(item){
		for(var path in item.updates){
			zhouziTree.updateData({
				id: path,
				value: item.updates[path]
			});
		}
		currPlayer = item.currPlayer;
		updatePlayer();
	}
	
	function zhouziRole(item){
		currPlayer = item.currPlayer;
		player1 = item.player1;
		player2 = item.player2;
		updatePlayer();
	}

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
				case "zhouziMove":
					zhouziMove(item);
					break;
				case "zhouziPlug":
					zhouziPlug(item);
					break;
				case "zhouziRole":
					zhouziRole(item);
					break;
				case "zhouziAll":
					rowCount = item.rowCount,
					colCount = item.colCount;
					var items = [];
					for (var y = 0; y < item.rowCount; y++){
						for (var x = 0; x < item.colCount; x++){
							items.push({
								id: [x, y],
								x: x,
								y: y,
								value: item.map[[x, y]]
							});
						}
					}
					zhouziTree.loadChilds(items);
					currPlayer = item.currPlayer;
					player1 = item.player1;
					player2 = item.player2;
					updatePlayer();
					break;
			}
		});
	}
	
	return {
		init: function() {
			zhouziTree = AceTree.create({
				parent: lib.g("zhouziListTemplate").parentNode,
				/*
				onsort: function(a, b){
					return (a.data.commandTime || 0) - (b.data.commandTime || 0);
				},
				*/
				oninit: function(tree){
					tree.eventHandler = AceEvent.on(tree.parent, function(command, target, e){
						var node = tree.node4target(target);
						node && tree.oncommand(command, node, e);
					});
				},
				onreader: function(node){
					return AceTemplate.format('zhouziListTemplate', node.data, {
						rowCount: rowCount,
						colCount: colCount
					});
				},
				oncommand: function(command, node, e){
					switch (command) {
						case "move":
							console.log([
								currPlayer, passportInfo.id, 
								player1, player2
							]);
							if (currPlayer == passportInfo.id){
								if (currPlayer == player1){
									sandbox.fire(events.move, {
										x: node.data.x,
										y: node.data.y
									});
								}
								if (currPlayer == player2){
									sandbox.fire(events.plug, {
										x: node.data.x,
										y: node.data.y
									});
								}
							}
							break;
					}
				},
				statusClasses: /^(focus|hover|select|expand|self)$/,
				oncreated: function(node) {
					node.setStatus("self", node.data.id == passportInfo.id, true);
				}
			});
			sandbox.on(events.pickSuccess, pickSuccess);
			
			AceEvent.on('roleTools', function(command){
				switch(command){
					case 'player1':
					case 'player2':
						sandbox.fire(events.role, command);
						break;
				}
			});
		}
	};
});