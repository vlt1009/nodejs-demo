/*@cc_on
var console, JSON, process;
function require(namespace){
	var fso = new ActiveXObject('Scripting.FileSystemObject');
	var filename = namespace;
	var result = {};
	if (/\w+/.test(namespace)){
		filename = 'windows\\' + namespace + '.js';
	}
	if (!fso.FileExists(filename)) return;
	var file = fso.GetFile(filename);
	if (file.Size <= 0) return;
	var stream = file.OpenAsTextStream(1, 0);
	try{
		new Function('exports', 'require', 'console', 'JSON', 'process', stream.ReadAll())(
			result, require, console, JSON, process
		);
	} catch(ex){
	} finally{
		stream.Close();
	}
	return result;
}
JSON = require('JSON');
process = require('process');
console = require('console');
@*/

console.log('--hello %j--', { name: 'zswang'});