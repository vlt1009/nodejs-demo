var common = require('../common/channel.common.js');
var querystring = require('querystring');

(function() {
	/**
 	* 玩家集合
 	*/
	var playerDict = {};
	/**
 	* 可更新的字段列表
 	*/
	var updateFields = ['nick'];
	/**
 	* 获取用户身份验证码
 	* @param {String} id 用户id
 	* @param {String} visa 密码
 	*/
	function getPlayerMask(id, visa) {
		return (20110815 ^ parseInt(visa, 36) ^ parseInt(id, 36)).toString(36);
	}

	function Player(id) {
		this.id = id || (+new Date).toString(36);
		this.visa = parseInt(Math.random() * 99999999).toString(36);
		this.mask = getPlayerMask(this.id, this.visa);
		this.nick = "player " + this.id;
		var now = new Date;
		this.createTime = now;
		this.accessTime = now;
		this.modifyTime = now;
		playerDict[this.id] = this;
	}

	Player.prototype.update = function(data) {
		var self = this;
		common.forEach(updateFields, function(field) {
			if (field in data) {
				self[field] = data[field];
				self.modifyTime = new Date;
			}
		});
	};
	
	function getPlayer(id) {
		var player = playerDict[id];
		if (!player)
			return;
		player.accessTime = new Date;
		return player;
	}

	/**
	 * 根据cookie获取用户
	 * @param{Object} req 请求对象
	 * @param{Object} res 应答对象，如果为空，则不会创建不存在的用户
	 */
	function getPassport(req, res) {
		var cookie = req.headers['cookie'] || "";
		var m = cookie.match(/\bpassport=([^;]+)/);
		var passport = m && querystring.parse(m[1]);
		var player = passport && getPlayer(passport.id);
		if (!player || player.visa != passport.visa ||
			player.mask != getPlayerMask(passport.id, passport.visa)
		) {
			if (!res) return;  
			player = new Player();
			res.setHeader("Set-Cookie", [common.format("passport=id=#{id}&visa=#{visa}&mask=#{mask}; expires=Mon, 31 Dec 2998 16:00:00 GMT; path=/;", player)]);
		}
		return player;
	};

	exports.getPassport = getPassport;
	exports.getPlayer = getPlayer;

})();
