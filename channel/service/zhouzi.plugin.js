var common = require('../common/channel.common.js');

void function(){
	
	var offsets = [[0, +1], [0, -1], [+1, 0], [-1, 0]];
	
	/**
	 * 投票插件
	 * @author 王集鹄(wangjihu,http://weibo.com/zswang)
	 */
	function ZhouziPlugin(channel, options){
		this.channel = channel;
		var self = this;
		this.channel.addEventListener('player-remove', function(player){
			if (self.player1 == player.id) self.player1 = 0;
			if (self.player2 == player.id) self.player2 = 0;
		});
		options = options || {};
		
		this.colCount = 9;
		this.rowCount = 9;
		this.zhouzi = { x: 4, y: 4};
		this.replay();
	}
	
	ZhouziPlugin.prototype.replay = function(){
		this.step = 0;
		this.zhouzi = { x: 4, y: 4};
		this.map = {};
		for (var y = 0; y < this.rowCount; y++){
			for (var x = 0; x < this.colCount; x++){
				this.map[[x, y]] = 0;
			}
		}
		this.map[[this.zhouzi.x, this.zhouzi.y]] = 1;
		this.setHint(this.zhouzi, 2);
		this.currPlayer = this.player1;
	};
	
	ZhouziPlugin.prototype.updateMap = function(path, value, records){
		this.map[path] = value;
		if (records){
			records[path] = value;
		}
	};

	ZhouziPlugin.prototype.setHint = function(pos, value, records){
		for (var i = 0; i < offsets.length; i++){
			var offset = offsets[i];
			var path = [+pos.x + offset[0], +pos.y + offset[1]];
			if (this.map[path] === 0 || this.map[path] === 2){
				this.updateMap(path, value, records);
			}
		}
	};
	
	ZhouziPlugin.prototype.command = function(fields, passport, query) {
		if (!fields || !passport || !query)
			return;
		switch (query.command) {
			case "role": // 身份
				if (this.player1 == passport.id) return; // 已经有身份
				if (this.player2 == passport.id) return;
				switch (query.player){
					case 'player1':
						if (this.player1) return;
						this.player1 = passport.id;
						break;
					case 'player2':
						if (this.player2) return;
						this.player2 = passport.id;
						break;
				}
				this.currPlayer = this.step % 2 ?  this.player2 : this.player1;
				fields.push({
					type: "zhouziRole",
					player1: this.player1,
					player2: this.player2,
					currPlayer: this.currPlayer
				});
				break;
			case "move": // 移动
				if (this.currPlayer != passport.id) return;
				if (this.currPlayer != this.player1) return;
				if (this.map[[query.x, query.y]] !== 2) return;
				var from = { x: this.zhouzi.x, y: this.zhouzi.y };
				var to = { x: query.x, y: query.y };
				var updates = {};
				this.updateMap([from.x, from.y], 0, updates);
				this.setHint(from, 0, updates);
				this.setHint(to, 2, updates);
				this.zhouzi.x = to.x;
				this.zhouzi.y = to.y;
				this.updateMap([to.x, to.y], 1, updates);
				this.step++;
				this.currPlayer = this.step % 2 ?  this.player2 : this.player1;
				fields.push({
					type: "zhouziMove",
					currPlayer: this.currPlayer,
					from: from,
					to: to,
					step: this.step,
					updates: updates
				});
				if (to.x == 0 || 
					to.y == 0 || 
					to.x == this.colCount - 1 ||
					to.y == this.rowCount - 1
				){
					this.replay();
					fields.push({
						type: "zhouziAll",
						map: this.map,
						step: this.step,
						currPlayer: this.currPlayer,
						player1: this.player1,
						player2: this.player2,
						colCount: this.colCount,
						rowCount: this.rowCount
					});
				}
				break;
			case "plug":
				if (this.currPlayer != passport.id) return;
				if (this.currPlayer != this.player2) return;
				if (!(/^(0|2)$/.test(this.map[[query.x, query.y]]))) return;
				var updates = {};
				this.updateMap([query.x, query.y], 3, updates);
				this.step++;
				this.currPlayer = this.step % 2 ?  this.player2 : this.player1;
				fields.push({
					type: "zhouziPlug",
					currPlayer: this.currPlayer,
					step: this.step,
					x: query.x,
					y: query.y,
					updates: updates
				});
				break;
		}
	};
	ZhouziPlugin.prototype.all = function(fields, passport, query) {
		fields.push({
			type: "zhouziAll",
			map: this.map,
			step: this.step,
			currPlayer: this.currPlayer,
			player1: this.player1,
			player2: this.player2,
			colCount: this.colCount,
			rowCount: this.rowCount
		});
	};
	
	exports.create = function(channel, options) {
		return new ZhouziPlugin(channel, options);
	};
}();