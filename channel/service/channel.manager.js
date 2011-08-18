var common = require('../common/channel.common.js');
var playerManager = require('./player.manager.js');

(function(){
	/**
	 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
	 * 频道管理器
	 */
	/**
	 * 频道集合
	 */
	var channelDict = {};
	
	/**
	 * 频道实例
	 * @param{String} id 频道id
	 * @param{Array Of Object} plugins 插件列表
	 */
	function Channel(id){
		/**
		 * 频道id
		 */
		this.id = id;
		this.title = id;
		/**
		 * pick缓存
		 */
		this.pickDict = {};
		this.pickKey = 0;
		this.seqFields = [];
		this.currSeq = 1;
		this.minSeq = 0;
		this.plugins = {};
		var now = new Date;
		this.createTime = now;
		this.accessTime = now;
		this.modifyTime = now;
		/**
		 * 清理过期数据
		 */
		this.patrolTime = new Date;
	}
	/**
	 * 执行回调
	 * @param{Object} res 应答对象
	 * @param{String} callback 回调函数名
	 */
	Channel.prototype.callback = function(res, callback, json){
		res.writeHead(200, {
			'Content-Type': 'text/javascript'
		});
		res.end([callback, "(", JSON.stringify(json), ");"].join(""));
	};
	/**
	 * 执行命令请求
	 * @param{Object} query 请求参数
	 * @param{Object} req 请求对象
	 * @param{Object} res 应答对象
	 */
	Channel.prototype.command = function(query, req, res){
		var passport = playerManager.getPassport(req, res);
		var fields = [];
		var error;
		common.forEach(this.plugins, function(plugin){
			if (error) return;
			error = plugin.command && plugin.command(fields, passport, query);
		});
		this.callback(res, query.callback, {
			result: "ok",
			error: error
		});
		this.fire(fields);
	};
	/**
	 * 触发pick返回
	 * @param{Array Of Object} 变化列表
	 */
	Channel.prototype.fire = function(fields){
		if (!fields || !fields.length) return;
		this.seqFields.push({
			startSeq: this.currSeq,
			fields: fields
		});
		while (this.seqFields.length > common.maxFireCount) {
			this.minSeq = this.seqFields.shift().startSeq;
		}
		this.currSeq++;
		for (var key in this.pickDict) {
			var pickItem = this.pickDict[key];
			if (!pickItem) continue;
			clearTimeout(pickItem.timer);
			var data = {
				result: "ok",
				currSeq: pickItem.query.seq,
				nextSeq: this.currSeq,
				fields: []
			};
			var res = pickItem.res;
			var query = pickItem.query;
			common.forEach(this.seqFields, function(item){
				if (data.currSeq > item.startSeq) return;
				item.fields.forEach(function(field){
					data.fields.push(field);
				});
			});
			this.callback(res, query.callback, data);
		}
		this.pickDict = {};
	};
	/**
	 * 处理用户pick请求
	 * @param {Object} query
	 * @param {Object} req
	 * @param {Object} res
	 */
	Channel.prototype.pick = function(query, req, res){
		var passport = playerManager.getPassport(req, res);
		if (query.seq <= this.minSeq) { // 首次访问或完整数据
			var fields = [
				{
					type: "passport",
					info: {
						id: passport.id,
						nick: passport.nick
					}
				},
				{
					type: "channel",
					info: {
						id: this.id,
						title: this.title
					}
				}
			];
			common.forEach(this.plugins, function(plugin){
				plugin.all && plugin.all(fields, passport, query);
			});
			this.callback(res, query.callback, {
				result: "ok",
				currSeq: query.seq,
				nextSeq: this.currSeq,
				fields: fields
			});
			return;
		}
		var key = this.pickKey++;
		var self = this;
		this.pickDict[key] = {
			passport: passport,
			query: query,
			key: key,
			req: req,
			res: res,
			timer: setTimeout(function(){
				self.pickDict[key] = null;
				self.callback(res, query.callback, {
					result: "overtime"
				});
			}, common.pickWait)
		};
		
		var fields = [];
		this.patrol(fields); // 处理过期数据
		if (fields.length) {
			this.fire(fields);
		}
	};
	/**
	 * 处理过期数据
	 * @param {Array of Object} fields 返回动作列表
	 * @param {Object} passport pick 触发者
	 */
	Channel.prototype.patrol = function(fields) {
		var now = new Date;
		if (now - this.patrolTime < common.maxPatrolTime) return;
		common.forEach(this.plugins, function(plugin){
			plugin.patrol && plugin.patrol(fields);
		});
		this.patrolTime = now;
	};
	
	/**
	 * 获取频道实例
	 * @param {String} id 频道id
	 * @param {Object} pluginInfos 插件信息
	 */
	function getChannel(id, pluginInfos){
		id = id || "home";
		var channel = channelDict[id];
		if (!channel) {
			channelDict[id] = channel = new Channel(id);

			var plugins = {};
			for (var key in pluginInfos) {
				var pluginInfo = pluginInfos[key];
				plugins[key] = pluginInfo.create(pluginInfo.options, channel);
			}
			channel.plugins = plugins;
		}
		return channel;
	};
	
	exports.getChannel = getChannel;
})();
