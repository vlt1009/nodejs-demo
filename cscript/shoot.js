/*@cc_on
var console, JSON, process, caches = {};
function require(namespace){
	if (caches[namespace]) return caches[namespace];
	var fso = new ActiveXObject('Scripting.FileSystemObject');
	var filename = namespace;
	var result = {};
	if (/\w+/.test(namespace)){
		filename = 'windows\\' + namespace + '.js';
	}
	if (!fso.FileExists(filename)) return;
	var file = fso.GetFile(filename);
	if (file.Size <= 0) return caches[namespace] = {};
	var stream = file.OpenAsTextStream(1, 0);
	try{
		new Function('exports', 'require', 'console', 'JSON', 'process', stream.ReadAll())(
			result, require, console, JSON, process
		);
	} catch(ex){
	} finally{
		stream.Close();
	}
	return caches[namespace] = result;
}
JSON = require('JSON');
process = require('process');
console = require('console');
@*/

var http = require('http');
var url = require('url');


var options = url.parse('http://www.baidu.com');
options.headers = {
	'Cookie': 'BAIDUID=8C4ACA8BE61093FBCAE8E7BB30F98998:FG=1; USERID=d80c41df2e7835c96dc612c7a4; BDUSS=5iLVIxeWo0YUhhWUdtZmM3U3EwWnJ1WkRYSnZXWlBHMzR2Zk5ZUWRsbU9SMmxQQVFBQUFBJCQAAAAAAAAAAAoqxg2TC48Ic2lnbnNtYXJ0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgaqV3AAAAAOBqpXcAAAAAuWZCAAAAAAAxMC4yMy4yNI66QU-OukFPZ2'
};
http.get(options, function(response){
    var data = '';
    response.on('data', function(d){
        data += d;
    });
    response.on("end", function(){
        console.log(data);
    });
});