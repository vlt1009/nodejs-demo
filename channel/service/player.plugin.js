(function() {
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 */
	function PlayerPlugin(channel, options) {
		this.channel = channel;
		this.options = options || {};
		this.players = {};
	}

	PlayerPlugin.prototype.command = function(fields, passport, query) {
		if (!fields || !passport || !query)
			return;
		switch (query.command) {
			case "enter":
				var player = this.getPlayer(passport.id);
				if (!player) {
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
		}
	};
	
	PlayerPlugin.prototype.all = function(fields) {
		fields.push({
			type: "playerAll",
			players: this.getPlayerAll()
		});
	};
	
	PlayerPlugin.prototype.getPlayer = function(id) {
		return this.players[id];
	};
	
	PlayerPlugin.prototype.getPlayerAll = function() {
		var players = [];
		for (var key in this.players) {
			var player = this.players[key];
			players.push({
				id: player.id,
				nick: player.nick,
				state: "online"
			});
		}
		return players;
	};
	
	exports.create = function(channel, options) {
		return new PlayerPlugin(channel, options);
	};
})();
