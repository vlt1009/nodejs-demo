/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addExtension("ZhouziApi", function (sandbox) {
	var lib = sandbox.getLib();
	var config = sandbox.getConfig();

	/* Debug Start */
	if (/\bdebug\b/.test(location.hash)){
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
						plugin: "zhouzi",
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
						type: "zhouziAll",
						plugin: "zhouzi",
						map: {
							"4,4": 1
						},
						colCount: 9,
						rowCount: 9
					}
					
				]
			},
			{
				channel: "",
				fields: [
					{
						type: "messageAdd",
						plugin: "zhouzi",
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
					},
					{
						type: "xgameUpdate",
						plugin: "xgame",
						votes: [
							{
								id: 1,
								count: 151
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
			hello: function(callback){
				callback({
					result: "ok",
					passport: {
						id: 1
					}
				});
			},
			getApiHost: function(){
				return '';
			},
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
	}
	/* Debug End */
	
	function jsonToQuery(json) {
		var result = [];
		for (var key in json) {
			result.push([encodeURIComponent(key), encodeURIComponent(json[key])].join("="));
		}
		return result.join("&");
	}

	function queryToJson(query) {
		var result = {};
		String(query).replace(/([^?&#]+)=([^?&#]*)/g, function(all, name, value) {
			result[name] = value;
		});
		return result;
	}
	var query = queryToJson(document.location.search);
	var apiHost = query.api ? 'http://' + query.api : config.apiHost;

	return {
		getApiHost: function(){
			return apiHost;
		},
		hello: function(callback){
			if (!callback) return;
			var timer = setTimeout(function() {
				timer = 0;
				callback({
					result: "overtime"
				});
				callback = function() {};
			}, config.pickMaxWait);
			var url = apiHost + "/hello";
			sandbox.log(url);
			lib.sio.callByServer(url, function(data) {
				timer && clearTimeout(timer);
				timer = 0;
				callback(data);
			});
		},
		pick: function(details, callback) {
			if (!details || !callback) return;
			var timer = setTimeout(function() {
				timer = 0;
				callback({
					result: "overtime"
				});
				callback = function() {};
			}, config.pickMaxWait);
			var url = [apiHost + "/pick", jsonToQuery(details)].join("?");
			sandbox.log(url);
			lib.sio.callByServer(url, function(data) {
				timer && clearTimeout(timer);
				timer = 0;
				callback(data);
			});
		},
		command: function(details, callback) {
			if (!details) return;
			var url = [apiHost + "/command", jsonToQuery(details)].join("?");
			sandbox.log(url);
			lib.sio.callByServer(url, function(data) {
				callback && callback(data);
			});
		}
	};
});