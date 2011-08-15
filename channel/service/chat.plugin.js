(function(){
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */
	function ChatPlugin(channel, options){
		this.channel = channel;
		this.options = options || {};
	}
	
	ChatPlugin.prototype.command = function(fields, passport, query) {
		
	};
	
	ChatPlugin.prototype.all = function(fields) {
		
	};

	exports.create = function(channel, options) {
		return new ChatPlugin(channel, options);
	};
})();
