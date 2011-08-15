/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.registerModule("Manager", function(sandbox){
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
	 * 聊天室api
	 */
	var chatApi = sandbox.getExtension("ChatApi");
	/**
	 * 当前pick序号
	 */
	var seq = 0;
	/**
	 * 发起下一次请求
	 */
	function nextPick() {
		chatApi.pick({
			seq: seq
		}, function (data) {
			if (!data || data.result != "ok") {
				if (data && data.result != "kill") nextPick();
				logger.log("pick error.");
				return;
			}
			if (seq != data.currSeq) return; // 和请求时的序号不一致
			if ('nextSeq' in data) {
				seq = data.nextSeq;
				logger.log("seq change to:" + seq);
			} 
			if ('fields' in data) sandbox.notify(events.pickSuccess, data.fields);
			nextPick();
		});
	}
	
	return {
		init: function() {
			/* Debug Start */
			if (/\bstatic\b/.test(location.hash)) {
				return;
			}
			/* Debug End */
			
			AceTemplate.register(); // 注册所有模板
			chatApi.command({
				command: "enter"
			}, function(data) {
				if (!data || data.result != "ok") {
					logger.log("enter channel error.");
					return;
				}
				nextPick();
			});
		}
	};
});