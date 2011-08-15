/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang) 李学健(lixuejian，http://weibo.com/poppyrr)
 * @fileoverview 内核 注册模块、事件管理、类库引用
 * @version 1.0.2
 */
/**
 * 应用程序命名空间
 * @class
 * @static
 */
var application = application || {};
/**
 * 应用程序类命名空间
 * @class
 * @static
 */
application.Classes = application.Classes || {};
/**
 * 内核命名空间
 * @class
 * @static
 */
application.Core = (function(){

	/**
	 * @static {Object} listeners 监听事件集合
	 * @static {Object} config 配置项
	 * @static {Object} loggers 日志记录
	 * @static {Object} eventCaches 事件缓存，在程序没有启动之前缓存notify触发的事件，程序启动之后触发
	 * @static {Object} lib 基础库
	 * @static {Boolean} active 程序是否启动
	 */
	var listeners = {};
	var configs = {};
	var loggers = {};
	var eventCaches = [];
	var lib = window.baidu || window.jQuery;
	var active;
	
	/**
	 * 空函数
	 */
	function emptyFunction(){
	}
	
	/**
	 * 日志类
	 */
	function Logger(id){
		var self = this;
		/**
		 * 输出格式化函数
		 * @param {String} msg 消息体
		 */
		this.format = function(msg){
			return format("(#{0}) #{1}", [self.id, msg]);
		};
		/**
		 * 日志级别
		 */
		this.level = 0;
		this.id = id;
	}
	
	/**
	 * 获取日志类
	 */
	Logger.prototype._getLogger = function(){
		return Logger
	};
	
	/**
	 * 设置日志级别
	 * @param {Integer} level 日志级别
	 */
	Logger.prototype.setLevel = function(level){
		this.level = level;
		return this;
	};
	
	/**
	 * 日志级别 warn警告 fatal失效
	 */
	Logger.LOG_LEVELS = ["debug", "log", "info", "warn", "error", "fatal", "logg"];
	var i = Logger.LOG_LEVELS.length;
	while (i--) {
		Logger.prototype[Logger.LOG_LEVELS[i]] = emptyFunction;
	}
	
	/**
	 * 日志记录
	 */
	var logger = getLogger("Core");
	
	/**
	 * 获取日志管理器
	 * @param {String} id 日志标识
	 */
	function getLogger(id){
		if (!loggers[id]) {
			loggers[id] = new Logger();
		}
		return loggers[id];
	}
	
	/**
	 * 格式化函数
	 * @param {String} template 模板
	 * @param {Object} json 数据项
	 */
	function format(template, json){
		return template.replace(/#\{(.*?)\}/g, function(all, key){
			return json && (key in json) ? json[key] : "";
		});
	}
	
	/**
	 * 获取基类库
	 */
	function getLib(){
		return lib;
	}
	
	/**
	 * 沙盒集合
	 */
	var sandboxs = {
		/**
		 * 模块的沙箱
		 * @param {String} id 模块ID
		 */
		"module": function(id){
			return {
				getLib: getLib,
				getLogger: function(){
					return getLogger(id);
				},
				getConfig: function(_id){
					return getConfig(_id || id);
				},
				getExtension: getExtension,
				on: on,
				un: un,
				notify: notify
			}
		},
		
		/**
		 * 扩展的沙箱
		 * @param {String} id 扩展ID
		 */
		"extension": function(id){
			return {
				getLib: getLib,
				getLogger: function(){
					return getLogger(id);
				},
				getConfig: function(_id){
					return getConfig(_id || id);
				},
				getExtension: getExtension
			}
		}
	};
	
	/**
	 * @static controls 元件集合
	 */
	var controls = {
		"module": {},
		"extension": {}
	};
	
	/**
	 * 注册监听
	 * @param {String|Array} event 事件名
	 * @param {Function} handler 处理方法
	 */
	function on(event, handler){
	
		if (!event) {
			logger.fatal("on(!, ?) 'event' Parameters can't for empty.");
			return;
		}
		
		if (typeof handler != "function") {
			logger.fatal(format("on('#{0}', !) 'handler' Parameters must be function types.", [event]));
			return;
		}
		
		if (event instanceof Array) {
			var i = event.length;
			while (i--) {
				on(event[i], handler);
			}
			return;
		}
		
		listeners[event] = listeners[event] || [];
		listeners[event].unshift(handler); // 向前添加
	}
	
	/**
	 * 注销监听
	 * @param {String|Array} event
	 * @param {Object} handler
	 */
	function un(event, handler){
	
		if (!event) {
			logger.fatal("un(!,?) 'event' Parameters can't for empty.");
			return;
		}
		
		if (typeof handler != "function") {
			logger.fatal(format("un('#{0}', !) 'handler' Parameters must be function types.", [event]));
			return;
		}
		
		if (event instanceof Array) {
			var i = event.length;
			while (i--) {
				un(event[i], handler);
			}
			return;
		}
		
		var listener = listeners[event], i;
		if (!listener) return;
		i = listener.length;
		while (i--) {
			if (listener[i] === handler) {
				listener.splice(i, 1);
			}
		}
	}
	
	/**
	 * 触发事件
	 * @param {String} event 取消事件
	 * @param {Object} data 事件参数
	 */
	function notify(event, data){
	
		if (!active) { // 程序未启动，先做缓存
			eventCaches.push([event, data]);
			return;
		}
		
		var listener = listeners[event], i;
		if (!listener) return;
		
		i = listener.length;
		while (i--) {
			setTimeout((function(handler){ // 这里采用非堵塞方式，跳出堆栈
				return function(){ // 使用闭包，避免嵌套调用使变量改变
					try {
						handler(data, event);
					} catch (ex) {
						logger.error(format("event:#{0} message:#{1}", [event, ex.message]));
					}
				};
			})(listener[i]), 0);
		}
	}
	
	/**
	 * 注册元件（模块|扩展|插件）
	 * @param {String} type 元件类型
	 * @param {String} id 标识
	 * @param {Function} creator 构造器
	 */
	function register(type, id, creator){
	
		if (!id) {
			logger.fatal(format("register('#{0}', !, ?) 'id' Parameters must be exists.", [type]));
			return;
		}
		
		if (typeof creator != 'function') {
			logger.fatal(format("register('#{0}', '#{1}', !) 'creator' Parameters must be function types.", [type, id]));
			return;
		}
		
		if (controls[type][id]) {
			logger.fatal(format("register('#{0}', '#{1}', ?) #{0} '#{1}' was already exists.", [type, id]));
			return;
		}
		
		logger.log(format("Register #{0} '#{1}'.", [type, id]));
		
		return controls[type][id] = {
			creator: creator,
			instance: null
		};
	}
	
	/**
	 * 启动元件
	 * @param {String} type 元件类型
	 * @param {String} id 模块标识
	 */
	function start(type, id){
		var data = controls[type][id];
		if (!data || data.instance) return;
		data.instance = data.creator(sandboxs[type](id));
		if (data.instance.init) data.instance.init();
	}
	
	/**
	 * 停用元件
	 * @param {String} type 元件类型
	 * @param {String} id 模块标识
	 */
	function stop(type, id){
		var data = controls[type][id];
		if (!data || !data.instance) return;
		if (data.instance.destroy) data.instance.destroy();
		data.instance = null;
	}
	
	/**
	 * 启用所有注册的元件
	 */
	function startAll(){
		if (active) {
			logger.fatal('startAll() Program has begun.');
			return;
		}
		var id, item;
		for (id in controls["plugin"]) { // 先启动插件
			start("plugin", id);
		}
		for (id in controls["module"]) { // 启动模块
			start("module", id);
		}
		active = true;
		notify("Core-StartAll", {});
		while (item = eventCaches.shift()) { // 处理缓存的事件
			notify(item[0], item[1]);
		}
		logger.info("Start all modules ... done!");
	}
	
	/**
	 * 获取扩展
	 * @param {String} id 扩展标识
	 */
	function getExtension(id){
		var extension = controls["extension"][id];
		if (extension) {
			return extension.instance;
		}
		logger.fatal(format("getExtension(!) Extension '#{0}' is missing.", [id]));
	}
	
	/**
	 * 获取模块的配置信息
	 * @param {String} id 模块标识
	 */
	function getConfig(id){
		var config = configs[id];
		if (config) {
			return config;
		}
		logger.warn(format("Config '#{0}' not found.", [id]));
	}
	
	/**
	 * 获取日志器
	 * @param {String} id 日志标识
	 */
	function getLogger(id){
		if (!loggers[id]) {
			loggers[id] = new Logger(id);
		}
		return loggers[id];
	}
	
	// 内核启动
	lib.on(window, 'load', function(){
		startAll();
	});
	
	return {
		/**
		 * 注册模块
		 * @param {String} id 模块标识
		 * @param {Function} creator 构造器
		 */
		registerModule: function(id, creator){
			register("module", id, creator);
			if (active) start("module", id);
		},
		
		/**
		 * 注册扩展
		 * @param {String} id 扩展标识
		 * @param {Function} creator 构造器
		 */
		registerExtension: function(id, creator){
			register("extension", id, creator);
			start("extension", id); // 扩展立即启动
		},
		
		/**
		 * 注册配置文件
		 * @param {String} id 配置文件标识，如果为空表示根级修改
		 * @param {Object} config 配置项
		 */
		addConfig: function(id, config){
			config = config || {};
			var c, p;
			if (id) {
				if (configs[id]) { // 配置项已经存在
					logger.warn(format("Config '#{0}' was already exists.", [id]));
				}
				c = configs[id] = configs[id] || {};
				for (p in config) {
					c[p] = config[p];
				}
			} else {
				for (p in config) {
					configs[p] = config[p];
				}
			}
		}
	};
})();
