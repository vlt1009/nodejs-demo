var common = require('../common/channel.common.js');

(function(){
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */
	function PlayerPlugin(channel, options){
		this.channel = channel;
		options = options || {};
		/**
		 * 最大人数
		 */
		this.maxCount = options.maxCount || 300;
		this.playerCount = 0;
		this.players = {};
	}
	
	PlayerPlugin.prototype.command = function(fields, passport, query){
		if (!fields || !passport || !query) return;
		switch (query.command) {
			case "enter":
				if (this.playerCount >= this.maxCount) return;
				var player = this.getPlayer(passport.id);
				if (!player) {
					this.playerCount++;
					this.players[passport.id] = player = passport;
					fields.push({
						type: "playerAdd",
						players: [{
							id: player.id,
							nick: player.nick,
							state: "online"
						}]
					});
				}
				break;
			case "nick":
				if (/^\s*$/.test(query.nick)) return;
				var player = this.getPlayer(passport.id);
				if (!player) return;
				player.update({
					nick: query.nick
				});
				fields.push({
					type: "playerUpdate",
					players: [{
						id: player.id,
						nick: player.nick
					}]
				});
				break;
		}
	};
	
	PlayerPlugin.prototype.all = function(fields, passport, query){
		fields.push({
			type: "playerAll",
			players: this.getPlayerAll()
		});
	};
	
	PlayerPlugin.prototype.getPlayer = function(id){
		return this.players[id];
	};
	
	PlayerPlugin.prototype.getPlayerAll = function(){
		var players = [];
		common.forEach(this.players, function(player){
			players.push({
				id: player.id,
				nick: player.nick,
				state: "online"
			});
		});
		return players;
	};
	
	exports.create = function(channel, options){
		return new PlayerPlugin(channel, options);
	};
})();
