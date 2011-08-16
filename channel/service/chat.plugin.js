var common = require('../common/channel.common.js');

(function(){
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */
	function ChatPlugin(channel, options){
		this.channel = channel;
		options = options || {};
		this.maxCount = options.maxCount || 20;
		this.messageList = [];
		this.currId = 0;
	}
	
	ChatPlugin.prototype.command = function(fields, passport, query) {
		if (!fields || !passport || !query)
			return;
		switch (query.command) {
			case "talk":
				if (!query.text) return;
				this.currId++;
				var message = {
					id: this.currId,
					from: passport.id,
					nick: passport.nick,
					time: +new Date,
					message: query.text
				};
				this.messageList.push(message);
				fields.push({
					type: "messageAdd",
					messages: [message]
				});
				while (this.messageList.length > this.maxCount){
					this.messageList.shift();
				}
				break;
		}
	};
	
	ChatPlugin.prototype.all = function(fields, passport, query) {
		fields.push({
			type: "messageAll",
			messages: this.getMessageAll()
		});
	};
	
	ChatPlugin.prototype.getMessageAll = function() {
		var messages = [];
		common.forEach(this.messageList, function(message) {
			messages.push(message);
		});
		return messages;
	};

	exports.create = function(channel, options) {
		return new ChatPlugin(channel, options);
	};
})();
