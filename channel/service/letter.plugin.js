var common = require('../common/channel.common.js');

void function(){
	/**
	 * 私信集合
	 */
	var playerLetterList = {};
	var currId = 0;
	
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */
	function LetterPlugin(channel, options){
		this.channel = channel;
		options = options || {};
	}
	
	LetterPlugin.prototype.command = function(fields, passport, query){
		if (!fields || !passport || !query) return;
		switch (query.command) {
			case "letter":
				if (!query.text) return;
				currId++;
				var message = {
					id: currId,
					to: query.to,
					from: passport.id,
					nick: passport.nick,
					time: +new Date,
					message: query.text
				};
				var playerLetter = playerLetterList[query.to] = playerLetterList[query.to] || {
					messages: []
				};
				playerLetter.messages.push(message);
				fields.push({
					type: "letterAdd",
					whiteList: [query.to],
					messages: [message]
				});
				while (playerLetter.messages.length > this.maxCount){
					playerLetter.messages.shift();
				}
				break;
		}
	};
	
	LetterPlugin.prototype.all = function(fields, passport, query){
		if (!fields || !passport) return;
	};
	
	/**
	 * 清理已经掉线或离开的用户
	 */
	LetterPlugin.prototype.patrol = function(fields){
	};
	
	exports.create = function(channel, options){
		return new LetterPlugin(channel, options);
	};
}();
