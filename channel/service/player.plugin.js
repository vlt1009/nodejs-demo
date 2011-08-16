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
		/**
		 * 清理掉线用户的时间
		 */
		this.patrolTime = new Date;
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
							state: player.status
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
						nick: player.nick,
						state: player.status
					}]
				});
				break;
		}
		this.patrol(fields);
	};
	
	PlayerPlugin.prototype.all = function(fields, passport, query){
		if (!fields || !passport) return;
		fields.push({
			type: "playerAll",
			players: this.getPlayerAll()
		});
		this.patrol(fields);
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
	
	/**
	 * 清理已经掉线或离开的用户 
	 */
	PlayerPlugin.prototype.patrol = function(fields) {
		var now = new Date;
		if (now - this.patrolTime < common.maxPatrolTime) return;
		common.forEach(this.players, function(player) {
			if (player.state != "offine") {
				if (now - player.passportTime > common.offineTime) {
					player.update({
						state: 'offine'
					});
					fields.push({
						type: "playerUpdate",
						players: [{
							id: player.id,
							state: player.status
						}]
					});
				}
			} else {
				if (now - this.patrolTime > 2 * common.maxPatrolTime) {
					fields.push({
						type: "playerRemove",
						players: [{
							id: player.id
						}]
					});
					delete this.players[player.id];
				}
			}
		});
		this.patrolTime = now;
	};

	exports.create = function(channel, options){
		return new PlayerPlugin(channel, options);
	};
})();