var LocalConsole = /^u/.test(typeof exports) ? LocalConsole || {} : exports;

void function(exports){
	var util = require('util');
	
	function log(info){
		WScript.StdOut.WriteLine(util.format.apply(this, arguments));
	}

	exports.log = log;
}(LocalConsole);
