var Access = {
	create: function(params){
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var result = 'ok';
		if (!fso.FileExists(params.accessfile)){
			var adoxcatalog = new ActiveXObject("ADOX.Catalog");
			try {
				adoxcatalog.Create("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + params.accessfile);
			} catch(ex) {
				result = ex.message;
				return;
			}
			adoxcatalog = null;
		} else {
			result = 'exists';
		}
		return {
			result: result
		};
	},
	existsTable: function(params){
		var connection = new ActiveXObject("ADODB.Connection");
		var result = 'ok', exists = false;
		try{
			connection.Open("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + params.accessfile);
			var recordset = connection.OpenSchema(20/*adSchemaTables*/);
			recordset.MoveFirst();
			while (!recordset.EOF){
				if (recordset("TABLE_TYPE") == "TABLE" && recordset("TABLE_NAME") == params.tablename){
					exists = true;
					break;
				}
				recordset.MoveNext();
			}
			recordset.Close();
			recordset = null;
		} catch(ex){
			result = ex.message;
		}
		return {
			"result": result,
			"exists": exists
		};
	},
	execute: function(params){
		var connection = new ActiveXObject("ADODB.Connection");
		var result = 'ok';
		try{
			connection.Open("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + params.accessfile);
			connection.Execute(params.sql);
		} catch(ex){
			result = ex.message;
		}
		return {
			result: result
		};
	},
	query: function(params){
		var connection = new ActiveXObject("ADODB.Connection");
		var result = 'ok', records = [];
		try{
			connection.Open("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + params.accessfile);
			var recordset = new ActiveXObject("ADODB.Recordset");
			recordset.Open(params.sql, connection);
			var fields = [];
			var enumer = new Enumerator(recordset.Fields);
			for (; !enumer.atEnd(); enumer.moveNext()){
				fields.push(enumer.item().name);
			}

			recordset.MoveFirst();
			while (!recordset.EOF) {
				var item = {};
				for (var i = 0; i < fields.length; i++){
					var fieldname = fields[i];
					item[fieldname] = recordset(fieldname).value;
				}
				records.push(item);
				recordset.MoveNext();
			}
			recordset.Close();
			recordset = null;
		} catch(ex){
			result = ex.message;
		}
		return {
			result: result,
			records: records
		};
	}
};

if (/^u/.test(typeof exports)){ // cscript
	void function(){
		//from http://tangram.baidu.com/api.html#baidu.json
		var JSON = {
			stringify: (function () {
				/**
				 * 字符串处理时需要转义的字符表
				 * @private
				 */
				var escapeMap = {
					"\b": '\\b',
					"\t": '\\t',
					"\n": '\\n',
					"\f": '\\f',
					"\r": '\\r',
					'"' : '\\"',
					"\\": '\\\\'
				};
				
				/**
				 * 字符串序列化
				 * @private
				 */
				function encodeString(source) {
					if (/["\\\x00-\x1f]/.test(source)) {
						source = source.replace(
							/["\\\x00-\x1f]/g, 
							function (match) {
								var c = escapeMap[match];
								if (c) {
									return c;
								}
								c = match.charCodeAt();
								return "\\u00" 
										+ Math.floor(c / 16).toString(16) 
										+ (c % 16).toString(16);
							});
					}
					return '"' + source + '"';
				}
				
				/**
				 * 数组序列化
				 * @private
				 */
				function encodeArray(source) {
					var result = ["["], 
						l = source.length,
						preComma, i, item;
						
					for (i = 0; i < l; i++) {
						item = source[i];
						
						switch (typeof item) {
						case "undefined":
						case "function":
						case "unknown":
							break;
						default:
							if(preComma) {
								result.push(',');
							}
							result.push(JSON.stringify(item));
							preComma = 1;
						}
					}
					result.push("]");
					return result.join("");
				}
				
				/**
				 * 处理日期序列化时的补零
				 * @private
				 */
				function pad(source) {
					return source < 10 ? '0' + source : source;
				}
				
				/**
				 * 日期序列化
				 * @private
				 */
				function encodeDate(source){
					return '"' + source.getFullYear() + "-" 
						+ pad(source.getMonth() + 1) + "-" 
						+ pad(source.getDate()) + "T" 
						+ pad(source.getHours()) + ":" 
						+ pad(source.getMinutes()) + ":" 
						+ pad(source.getSeconds()) + '"';
				}
				
				return function (value) {
					switch (typeof value) {
					case 'undefined':
						return 'undefined';
						
					case 'number':
						return isFinite(value) ? String(value) : "null";
						
					case 'string':
						return encodeString(value).replace(/[^\x00-\xff]/g, function(all) {
							return "\\u" + (0x10000 + all.charCodeAt(0)).toString(16).substring(1);
						});
					case 'boolean':
						return String(value);
						
					default:
						if (value === null) {
							return 'null';
						}
						if (value instanceof Array) {
							return encodeArray(value);
						}
						if (value instanceof Date) {
							return encodeDate(value);
						}
						var result = ['{'],
							encode = JSON.stringify,
							preComma,
							item;
							
						for (var key in value) {
							if (Object.prototype.hasOwnProperty.call(value, key)) {
								item = value[key];
								switch (typeof item) {
								case 'undefined':
								case 'unknown':
								case 'function':
									break;
								default:
									if (preComma) {
										result.push(',');
									}
									preComma = 1;
									result.push(encode(key) + ':' + encode(item));
								}
							}
						}
						result.push('}');
						return result.join('');
					}
				};
			})(),
			parse: function (data) {
				return (new Function("return (" + data + ")"))();
			}
		}

		//http://blog.csdn.net/cuixiping/article/details/409468
		function base64Decode(base64){
			var xmldom = new ActiveXObject("MSXML2.DOMDocument");
			var adostream = new ActiveXObject("ADODB.Stream");
			var temp = xmldom.createElement("temp");
			temp.dataType = "bin.base64";
			temp.text = base64;

			adostream.Charset = "utf-8";
			adostream.Type = 1; // 1=adTypeBinary 2=adTypeText
			adostream.Open();
			adostream.Write(temp.nodeTypedValue);
			adostream.Position = 0;
			adostream.Type = 2; // 1=adTypeBinary 2=adTypeText
			var result = adostream.ReadText(-1); // -1=adReadAll
			adostream.Close();
			adostream = null;
			xmldom = null;
			return result;
		}
		WScript.StdOut.Write('<json>');
		var method = Access[WScript.Arguments(0)];
		var result = null;
		if (method){
			result = method(JSON.parse(base64Decode(WScript.Arguments(1))));
		}
		WScript.StdOut.Write(JSON.stringify(result));
		WScript.StdOut.Write('</json>');
	}();
} else { // nodejs
	void function(){
		function json4stdout(stdout){
			if (!stdout) return;
			var result = null;
			
			String(stdout).replace(/<json>([\s\S]+)<\/json>/, function(){
				result = JSON.parse(arguments[1]);
			});
			return result;
		}
		var util = require('util'), exec = require('child_process').exec;
		for (var name in Access){
			exports[name] = (function(funcname){
				return function(params, callback){
					console.log([funcname, params]);
					exec(
						util.format(
							'cscript.exe /e:jscript "%s" %s "%s"', __filename,
							funcname,
							(new Buffer(JSON.stringify(params))).toString('base64')
						),
						function (error, stdout, stderr) {
							if (error != null) {
								console.log('exec error: ' + error);
								return;
							}
							console.log('stdout: ' + stdout);
							callback && callback(json4stdout(stdout));
						}
					);
				}
			})(name);
		}
	}();
}

