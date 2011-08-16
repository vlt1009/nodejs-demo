(function() {
/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
	function format(template, json) {
		if (!json)
			return template;
		return template.replace(/\#\{(.+?)\}/g, function() {
			return json[arguments[1]];
		});
	}

	function forEach(arr, callback) {
		if (arr instanceof Array) {
			for (var i = 0; i < arr.length; i++) {
				if (callback(arr[i], i) === false)
					return false;
			}
		} else if (typeof arr == "object") {
			for (var p in arr) {
				if (callback(arr[p], p) === false)
					return false;
			}
		}
	}

	var ChannelCommon = {
		/**
 		* 等待时间
 		*/
		pickWait: 30 * 1000,
		/**
 		* 最大缓存的变化数
 		*/
		maxFireCount: 15,
		/**
		 * 清理用户掉线的时间
		 */
		maxPatrolTime: 45 * 1000,
		/**
		 * 离线的时间
		 */
		offineTime: 75 * 1000,
		format: format,
		forEach: forEach
	};

	/**
 	* nodejs
 	* http://www.nodejs.org/
 	*/
	if (typeof exports != 'undefined') {
		for (var p in ChannelCommon) {
			exports[p] = ChannelCommon[p];
		}
	}
})();
