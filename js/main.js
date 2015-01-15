var dbFileElm = document.getElementById('dbfile');
var SQL = window.SQL;
db = new SQL.Database();

var workerPath = "../bower_components/sql.js/js/worker.sql.js";
var worker = new Worker(workerPath);


dbFileElm.onchange = function() {
    var f = dbFileElm.files[0];
    var r = new FileReader();
    r.onload = function() {
        var Uints = new Uint8Array(r.result);
        db = new SQL.Database(Uints);
    };
    r.readAsArrayBuffer(f);

    var res = db.exec("SELECT * FROM process");
	$('#dbfile').val(res);
};

/* Eventually:
var fs = require('fs');
var SQL = require('sql.js');
var filebuffer = fs.readFileSync('test.sqlite');

// Load the db
var db = new SQL.Database(filebuffer);
*/


