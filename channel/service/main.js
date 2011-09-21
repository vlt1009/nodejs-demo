/**
 * @author 王集鹄(wangjihu，http://weibo.com/zswang)
 */
var http = require('http');
var url = require('url');
var channelManager = require('./channel.manager.js');
var chatPlugin = require('./chat.plugin.js');
var playerPlugin = require('./player.plugin.js');

http.createServer(function(req, res){
	var reqUrl = url.parse(req.url, true);
	var query = reqUrl.query;
	if (/[^\w_$]/.test(query.callback)) { // 错误的callback参数
		res.writeHead(200, {
			'Content-Type': 'text/javascript'
		});
		res.end("/* callback is invalid. */");
		return;
	}
	
	var channelName = query.channel || "home";
	var channel = channelManager.getChannel(channelName, {
		chat: {
			create: chatPlugin.create,
			options: {
				maxCount: 20
			}
		},
		player: {
			create: playerPlugin.create,
			options: {
				maxCount: 1000
			}
		}
	});
	switch (reqUrl.pathname) {
		case "/command":
			channel && channel.command(query, req, res);
			break;
		case "/pick":
			channel && channel.pick(query, req, res);
			break;
	}
	
}).listen(process.argv[2] || "80", process.argv[3] || "127.0.0.1");