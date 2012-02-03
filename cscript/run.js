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

console.log('--hello %j--', { name: 'zswang' });