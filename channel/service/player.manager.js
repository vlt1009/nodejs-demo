var common = require('../common/channel.common.js');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');

void function(){
	/**
	 * 玩家集合
	 */
	var playerDict = {};
	/**
	 * 可更新的字段列表
	 */
	var updateFields = ['nick', 'state', 'weibo'];
	/**
	 * 昵称词典，避免昵称重复
	 */
	var nickDict = {};
	/**
	 * 存储目录
	 */
	var dir = "players";
	/**
	 * 获取用户身份验证码
	 * @param {String} id 用户id
	 * @param {String} visa 密码
	 */
	function getPlayerMask(id, visa){
		return (common.passportKey ^ parseInt(visa, 36) ^ parseInt(id, 36)).toString(36);
	}
	
	function savePlayer(id){
		var player = playerDict[id];
		if (!player) return;
		path.exists(dir, function(exists){
			if (exists) {
				fs.writeFile(common.format("#{0}/#{1}.json", [dir, id]), JSON.stringify(player));
			} else {
				fs.mkdir(dir, 0777, function(){
					fs.writeFile(common.format("#{0}/#{1}.json", [dir, id]), JSON.stringify(player));
				});
			}
		});
	}

	function loadPlayer(id){
		var player = playerDict[id];
		if (player) return player;
		player = new Player(id, true);
		if (player.id == id) return player;
	}

	/**
	 * 用户信息
	 * @param {String} id
	 * @param {Boolean} file 是否从文件中读取
	 */
	function Player(id, file){
		if (file) {
			var filename = common.format("#{0}/#{1}.json", [dir, id]);
			if (path.existsSync(filename)) {
				var player = JSON.parse(fs.readFileSync(filename)) || {};
				if (player.id == id) {
					this.id = id;
					this.visa = player.visa;
					this.mask = player.mask;
					this.nick = player.nick;
					this.state = player.state;
					this.weibo = player.weibo;
					this.createTime = new Date(player.createTime);
					this.accessTime = new Date(player.accessTime);
					this.modifyTime = new Date(player.modifyTime);
					this.passportTime = new Date(player.passportTime);
					this.commandTime = new Date(player.commandTime);
					playerDict[this.id] = this;
					return;
				}
			}
			return;
		}
		this.id = id || (+new Date - new Date('2011/8/16')).toString(36);
		this.visa = parseInt(Math.random() * 99999999).toString(36);
		this.mask = getPlayerMask(this.id, this.visa);
		/**
		 * 昵称
		 */
		this.nick = this.id;
		/**
		 * 在线状态 online-在线 offline-离线 busy-忙碌
		 */
		this.state = "online";
		var now = new Date;
		/**
		 * 创建时间
		 */
		this.createTime = now;
		/**
		 * 访问时间
		 */
		this.accessTime = now;
		/**
		 * 修改时间
		 */
		this.modifyTime = now;
		/**
		 * 验证时间，用来判断是否离线
		 */
		this.passportTime = now;
		/**
		 * 最后发送命令的时间，用来验证是否活跃
		 */
		this.commandTime = now;
		
		playerDict[this.id] = this;
		savePlayer(this.id);
	}
	/**
	 * 更新用户信息
	 * @param {Object} data 更新的数据
	 */
	Player.prototype.update = function(data){
		var self = this;
		var changed = false;
		common.forEach(updateFields, function(field){
			if (field in data){
				if (self[field] != data[field]){
					changed = true;
					self[field] = data[field];
					self.modifyTime = new Date;
				}
			}
		});
		changed && savePlayer(this.id);
	};
	/**
	 * 获取用户信息
	 * @param {String} id 用户id
	 */
	function getPlayer(id){
		var player = playerDict[id];
		if (!player) {
			return loadPlayer(id);
		}
		player.accessTime = new Date;
		return player;
	}
	
	/**
	 * 根据cookie获取用户
	 * @param{Object} req 请求对象
	 * @param{Object} res 应答对象，如果为空，则不会创建不存在的用户
	 */
	function getPassport(req, res){
		var cookie = req.headers['cookie'] || "";
		var m = cookie.match(/\bpassport=([^;]+)/);
		var passport = m && querystring.parse(m[1]);
		var player = passport && getPlayer(passport.id);
		if (!player || player.visa != passport.visa ||
			player.mask != getPlayerMask(passport.id, passport.visa)){
			if (!res) return;
			player = new Player();
			res.setHeader("Set-Cookie", [common.format("passport=id=#{id}&visa=#{visa}&mask=#{mask}; expires=Mon, 31 Dec 2998 16:00:00 GMT; path=/;", player)]);
		} else {
			player.passportTime = new Date;
		}
		return player;
	};
	
	exports.getPassport = getPassport;
	exports.getPlayer = getPlayer;
	
}();