var access = require('./access.js');
access.create('demo.mdb', function(data){
	console.log(data);
});