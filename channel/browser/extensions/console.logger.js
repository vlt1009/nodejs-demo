/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
application.Core.registerExtension("Logger", function(sandbox){
	var Logger = sandbox.getLogger()._getLogger();
	for (var i = 0, l = Logger.LOG_LEVELS.length; i < l; i++) {
		var level = Logger.LOG_LEVELS[i];
		Logger.prototype[level] = (function(_level, _levelIndex){
			return function(message){
				window.console && console.log(message)
			}
		})(level, i);
	}
	
	return {};
});
