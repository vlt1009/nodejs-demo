/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addExtension("ChatApi", function (sandbox) {
	var lib = sandbox.getLib();
	var config = sandbox.getConfig();

	/* Debug Start */
	var pickList = [
		{
			channel: "",
			fields: [
				{
					type: "passport",
					info: {
						id: 1,
						nick: "王集鹄"
					}
				},
				{
					type: "channel",
					info: {
						id: 1,
						title: "主频道"
					}
				},
				{
					type: "messageAll",
					plugin: "chat",
					messages: [
						{
							id: 1,
							from: 1,
							nick: "王集鹄",
							time: new Date,
							message: "欢迎交流"
						},
						{
							id: 2,
							from: 3,
							nick: "丫丫",
							time: new Date,
							message: "这是什么东东？"
						}
					]
				},
				{
					type: "letterAll",
					plugin: "letter",
					messages: [
						{
							id: 2,
							from: 3,
							nick: "丫丫",
							time: new Date,
							message: "发的是私信"
						}
					]
				},
				{
					type: "playerAll",
					plugin: "player",
					players: [
						{
							id: 1,
							nick: "王集鹄",
							state: "online"
						},
						{
							id: 2,
							nick: "破皮",
							state: "offline"
						},
						{
							id: 3,
							nick: "丫丫",
							state: "busy"
						},
						{
							id: 4,
							nick: "史纯华",
							state: "online"
						}
					]
				},
				{
					type: "xgameAll",
					plugin: "xgame",
					infos: [
						{
							id: 1,
							title: "今天周一",
							checked: true
						},
						{
							id: 2,
							title: "今天周二",
							checked: false
						}
					]	
				}
				
			]
		},
		{
			channel: "",
			fields: [
				{
					type: "messageAdd",
					plugin: "chat",
					messages: [
						{
							id: 3,
							from: 1,
							nick: "王集鹄",
							time: new Date,
							message: "一个聊天室哈。"
						},
						{
							id: 2,
							from: 3,
							nick: "破皮",
							time: new Date,
							message: "88"
						}
					]
				},
				{
					type: "playerRemove",
					plugin: "player",
					players: [
						{
							id: 2,
							nick: "破皮",
							state: "offline"
						}
					]
				},
				{
					type: "playerAdd",
					plugin: "player",
					players: [
						{
							id: 5,
							nick: "岩石",
							state: "online"
						}
					]
				}
			]
		},
		{
			channel: "",
			fields: [
				{
					type: "playerUpdate",
					plugin: "player",
					players: [
						{
							id: 3,
							nick: "爱地球"
						}
					]
				}
			]
		}
	];
	
	lib.each(pickList, function(item, index) {
		item.result = "ok";
		item.currSeq = index;
		item.nextSeq = index + 1;
	});
	
	return {
		pick: function(details, callback) {
			callback && callback(pickList[details.seq]);
		},
		command: function(details, callback) {
			sandbox.log(details);
			callback && callback({
				result: "ok"
			});
		}
	};
	/* Debug End */
	
	function jsonToQuery(json) {
		var result = [];
		for (var key in json) {
			result.push([encodeURIComponent(key), encodeURIComponent(json[key])].join("="));
		}
		return result.join("&");
	}
	
	return {
		pick: function(details, callback) {
			if (!details || !callback) return;
			var timer = setTimeout(function() {
				timer = 0;
				callback({
					result: "overtime"
				});
				callback = function() {};
			}, config.pickMaxWait);
			var url = [config.apiHost + "/pick", jsonToQuery(details)].join("?");
			sandbox.log(url);
			lib.sio.callByServer(url, function(data) {
				timer && clearTimeout(timer);
				timer = 0;
				callback(data);
			});
		},
		command: function(details, callback) {
			if (!details) return;
			var url = [config.apiHost + "/command", jsonToQuery(details)].join("?");
			sandbox.log(url);
			lib.sio.callByServer(url, function(data) {
				callback && callback(data);
			});
		}
	};
});