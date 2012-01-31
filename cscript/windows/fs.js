var LocalFS = /^u/.test(typeof exports) ? LocalFS || {} : exports;

void function(exports){
	function readFile(filename/*, [encoding], [callback]*/){
		var callback, err, data;
		for (var i = 1; i < arguments.length; i++){
			if (/^f/.test(typeof arguments[i])){
				callback = arguments[i];
			}
		}
		
		var fso = new ActiveXObject('Scripting.FileSystemObject');
		if (fso.FileExists(filename)){
			var file = fso.GetFile(filename);
			if (file.Size > 0){
				var stream = file.OpenAsTextStream(1, 0);
				try{
					data = stream.ReadAll();
				} catch(ex){
					err = ex.message;
				} finally{
					stream.Close();
				}
			}
		}
		callback && callback(err, data);
	}

	exports.readFile = readFile;
}(LocalFS);