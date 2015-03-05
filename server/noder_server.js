//config

var path_to_data = '/Volumes/SELFSPY/p1/';

// config end

var fs = require('fs');
var http = require('http');
var SQL = require('sql.js');

var files = fs.readdirSync(path_to_data + 'screenshots');

console.log('finished reading filenames');

var filebuffer = fs.readFileSync(path_to_data + 'selfspy.sqlite');

var db = new SQL.Database(filebuffer);

// Prepare an sql statement
var stmt = db.prepare("SELECT created_at FROM click");
var clicks = [];
while (stmt.step()) clicks.push(stmt.get()[0]);


var process_names = [];
var process_ids = [];

stmt = db.prepare("SELECT name FROM process");
while (stmt.step()) process_names.push(stmt.get()[0]);

stmt = db.prepare("SELECT id FROM process");
while (stmt.step()) process_ids.push(stmt.get()[0]);


var window_process_id = [];
var window_browser_url = [];

stmt = db.prepare("SELECT process_id FROM window");
while (stmt.step()) window_process_id.push(stmt.get()[0]);

stmt = db.prepare("SELECT browser_url FROM window");
while (stmt.step()) window_browser_url.push(stmt.get()[0]);



console.log('finished reading db file');

var server = http.createServer(function (req, res) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.writeHead(200);

    var response_object = {
        filenames : files,
        clicks : clicks,
        process_names: process_names,
        process_ids: process_ids,
        window_process_id: window_process_id,
        window_browser_url: window_browser_url
    };

    res.write(JSON.stringify(response_object));
    res.end();
});

server.listen(8001);
