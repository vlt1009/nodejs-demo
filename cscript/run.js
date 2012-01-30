/*@cc_on
@if(1)
	var console;
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
			new Function('exports', 'require', 'console', stream.ReadAll())(
				result, require, console
			);
		} catch(ex){
		} finally{
			stream.Close();
		}
		return result;
	}
	console = require('console');
@end@*/

console.log('--run.js--');
var fs = require('fs');
fs.readFile('run.js', function(err, data){
	if (err) throw err;
	console.log(String(data));
});