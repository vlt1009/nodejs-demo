// cscript.exe
void function(){
	var console = {
		log: function(info){
			WScript.StdOut.WriteLine(info);
		}
	};
	
	function download(url, filename){
		console.log([url, " => ", filename, " wait..."]);
		var xmlhttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
		xmlhttp.open("GET", url, false);
		xmlhttp.setRequestHeader("Referer", url); 
		xmlhttp.send();
		var adodbStream = new ActiveXObject("ADODB.Stream");
		adodbStream.Type = 1;
		adodbStream.Open(); 
		adodbStream.Write(xmlhttp.responseBody);;
		adodbStream.SaveToFile(filename, 2); 
		adodbStream.Close(); 
		adodbStream = null;
	}
	
	download(WScript.Arguments(0), WScript.Arguments(1));
}();