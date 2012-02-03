/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
AceCore.addModule("Manager", function(sandbox){
	/**
	 * 事件集合
	 */
	var events = sandbox.getConfig("Events");
	/**
	 * 类库
	 */
	var lib = sandbox.getLib();
	/**
	 * 聊天室api
	 */
	var chatApi = sandbox.getExtension("ChatApi");
	/*
	 * 进入的频道
	 */
	var channel;
	/**
	 * 当前pick序号
	 */
	var seq = 0;
	/**
	 * 发起下一次请求
	 */
	function nextPick() {
		chatApi.pick({
			channel: channel,
			seq: seq
		}, function (data) {
			if (!data || data.result != "ok") {
				if (data && data.result != "kill" && data.channel == channel) nextPick();
				sandbox.log("pick error.");
				return;
			}
			// 所属频道或请求序号不一致
			if (data.channel == channel && seq == data.currSeq) {
				if ('nextSeq' in data) {
					seq = data.nextSeq;
					sandbox.log("seq change to:" + seq);
				}
				if ('fields' in data) sandbox.fire(events.pickSuccess, data.fields);
				setTimeout(function() {
					nextPick();
				}, 100);
			}
		});
	}
	
	function setChannel(value) {
		if (value == channel) return;
		chatApi.command({
			channel: channel,
			desc: value,
			command: "goto"
		});
		channel = value;
		enterChannel();
	}
	
	function enterChannel() {
		chatApi.command({
			channel: channel,
			command: "enter"
		}, function(data) {
			data = data || {};
			if (data.result != "ok") {
				sandbox.fire(events.showDialog, {
					type: "error",
					message: data.error || "enter channel error."
				});
				return;
			}
			seq = 0;
				setTimeout(function() {
					nextPick();
				}, 0);
		});
	}
	
	function nick(nick) {
		chatApi.command({
			channel: channel,
			command: "nick",
			nick: nick
		});
	}
	
	function talk(text) {
		chatApi.command({
			channel: channel,
			command: "talk",
			text: text
		}, function(data) {
			if (!data || data.result != "ok") return;
			data.error && sandbox.fire(events.showDialog, {
				type: "error",
				message: data.error
			});
			lib.g('editor').value = "";
		});
	}
	
	function xgame(id) {
		chatApi.command({
			channel: channel,
			command: "vote",
			id: id
		}, function(data) {
			data.error && sandbox.fire(events.showDialog, {
				type: "error",
				message: data.error
			});
		});
	}
	
	return {
		init: function() {
			/* Debug Start */
			if (/\bstatic\b/.test(location.hash)) {
				return;
			}
			/* Debug End */
			sandbox.on(events.nick, nick);
			sandbox.on(events.talk, talk);
			sandbox.on(events.xgame, xgame);

			AceTemplate.register(); // 注册所有模板
			lib.on(window, "hashchange", function() {
				setChannel(location.hash.replace(/^#/, ''));
			});
			channel = location.hash.replace(/^#/, '');
			enterChannel();
		}
	};
});