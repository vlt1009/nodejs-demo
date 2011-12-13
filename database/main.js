var access = require('./access.js');
var util = require('util');

var accessfile = 'demo.mdb';
access.create({ accessfile: accessfile }, function(data){
	console.log(data);
});
access.existsTable({ accessfile: accessfile, tablename: 'demo' }, function(data){
	if (data.result == 'ok' && !data.exists){
		access.execute({
			accessfile: 'demo.mdb',
			sql: "CREATE TABLE demo(id Counter Primary key, data Text(100))"
		});
	}
});
access.execute({
	accessfile: 'demo.mdb',
	sql: util.format("INSERT INTO demo(data) VALUES('zswang 路过！%s')", +new Date)
}, function(data){
	console.log(data);
});
access.query({
	accessfile: 'demo.mdb',
	sql: "SELECT * FROM demo"
}, function(data){
	console.log(data);
});