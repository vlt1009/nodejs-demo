/**
 * chat api 配置
 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
 */
AceCore.addConfig("ZhouziApi", {
	/**
	 * pick最大等待时间，单位：毫秒
	 */
	pickMaxWait: 45 * 1000,
	/**
	 * 请求的Host地址
	 */
	apiHost: "http://renrousousuo.com:8084"
});

if (/debug/.test(location)) {
	AceCore.addConfig("ZhouziApi", {
		apiHost: "http://localhost:2014"
	});
}
