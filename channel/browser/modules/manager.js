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
				sandbox.log(data);
				if (!data || data.result == 'overtime' || 
					(data.result != "kill" && data.channel == channel)){
					nextPick();
				}
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
			command: "enter",
            refer: document.referrer
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
		}, checkerror);
	}
	
	function weibo(weibo){
		chatApi.command({
			channel: channel,
			command: "weibo",
			weibo: weibo
		}, checkerror);
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
		}, checkerror);
	}
	
	function checkerror(data){
		data.error && sandbox.fire(events.showDialog, {
			type: "error",
			message: data.error
		});
	}

	//see
	//http://stackoverflow.com/questions/172223/how-do-i-set-cookies-from-outside-domains-inside-iframes-in-safari
	//http://stackoverflow.com/questions/6125741/iframe-cross-domain-cookies-p3p-policy-and-safari-with-error-a-required-anti
	//http://blog.boisgames.com/2011/09/resovle-safari-in-iframe-thirdparty-domain-cookie-issue-for-node/
	function safariPassport(){
		function clearElement(){
			//document.body.removeChild(iframe);
			//document.body.removeChild(form);
		}
		var firstTimeSession = 0;
		function submitSessionForm(){
			if (firstTimeSession) return;
			firstTimeSession = 1;
			form.submit();
			//setTimeout(clearElement, 2000);
		}
		var form = document.createElement('form');
		form.action = chatApi.getApiHost() + '/command';
		form.method = 'POST';
		form.target = name;
		form.enctype = "application/x-www-form-urlencoded";
		document.body.appendChild(form);
		var iframe = document.createElement('iframe');
		var name = '_safariPassportFrame_' + (+new Date).toString(36);
		iframe.name = name;
		iframe.onload = submitSessionForm;
		iframe.src = chatApi.getApiHost() + '/command';
		document.body.appendChild(iframe);
	}
	function hello(){
		chatApi.hello(function(data){
			if (data && data.passport){
				enterChannel();
			} else {
				sandbox.fire(events.showDialog, {
					type: "passport",
					url: chatApi.getApiHost() + '/passport',
					onclose: function(){
						setTimeout(function(){
							hello();
						}, 2000);
					}
				});
			}
		});
	}
	return {
		init: function() {
			/* Debug Start */
			if (/\bstatic\b/.test(location.hash)){
				return;
			}
			/* Debug End */
			sandbox.on(events.nick, nick);
			sandbox.on(events.talk, talk);
			sandbox.on(events.xgame, xgame);
			sandbox.on(events.weibo, weibo);

			AceTemplate.register(); // 注册所有模板
			lib.on(window, "hashchange", function(){
				setChannel(location.hash.replace(/^#/, ''));
			});
			channel = location.hash.replace(/^#/, '');
			if (/safari/i.test(navigator.userAgent)){ // safari不支持jsonp写cookie
				hello();
			} else {
				enterChannel();
			}
		}
	};
});