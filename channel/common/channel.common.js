var ChannelCommon = ChannelCommon || {};

void function(exports) {

	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */

	/**
	 * 模板处理
	 * @param {String} template 模板字符 #{key}
	 * @param {Object} json 数据
	 */
	function format(template, json) {
		if (!json)
			return template;
		return template.replace(/\#\{(.+?)\}/g, function() {
			return json[arguments[1]];
		});
	}
	/**
	 * 遍历数组或对象
	 * @param {Object|Array} arr
	 * @param {Object} callback 回调
	 * 	@param {Object} item 子项
	 * 	@param {Number|String} key 下标和键值
	 */
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
	
	/**
	 * 公用部分
	 */
	var ChannelCommon = {
		/* Debug Start */
		// 服务器配置参数
		/**
		 * 验证私钥
		 */ 
		passportKey: 20110815,
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
		 * 离线的时间差
		 */
		offineTime: 75 * 1000,
		
		/**
		 * 忙碌的时间差
		 */
		busyTime: 100 * 1000,
		/* Debug End */
		
		// 前后端共用
		/**
		 * 昵称最大长度
		 */
		maxNick: 20,
		/**
		 * 验证昵称是否合法
		 * @param {Object} nick
		 */
		checkNick: function(nick) {
			if (!nick || /^\s+$/.test(nick)) {
				return "昵称不能为空";
			}
			if (nick.length > this.maxNick) {
				return this.format("昵称长度不能超过#{0}", [this.maxNick]);
			}
			if (/@/.test(nick)) {
				return "昵称不能带@";
			}
		},
		format: format,
		forEach: forEach
	};

	forEach(ChannelCommon, function(value, key) {
		exports[key] = value;
	});
	
}(typeof exports == "undefined" ? ChannelCommon : exports);