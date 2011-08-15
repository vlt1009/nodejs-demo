/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.addConfig("ChatApi", {
	/**
	 * pick最大等待时间，单位：毫秒
	 */
	pickMaxWait: 45 * 1000,
	/**
	 * 请的url路径
	 */
	pickUrl: "http://localhost:2012/pick",
	/**
	 * 发送命令的路径
	 */
	commandUrl: "http://localhost:2012/command"
});