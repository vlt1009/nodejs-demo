var access = require('./access.js');
access.create('demo.db', function(data){
	console.log(data);
});