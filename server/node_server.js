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
var clicks = db.exec("SELECT created_at FROM click ORDER BY id ASC")[0]['values'];

var process_names = db.exec("SELECT name FROM process ORDER BY id ASC")[0]['values'];
var process_ids = db.exec("SELECT id FROM process ORDER BY id ASC")[0]['values'];

var window_process_id = db.exec("SELECT process_id FROM window ORDER BY id ASC")[0]['values'];
var window_browser_url = db.exec("SELECT browser_url FROM window ORDER BY id ASC")[0]['values'];


var windowevent_times = db.exec("SELECT created_at FROM windowevent ORDER BY id ASC")[0]['values'];
var windowevent_window_ids = db.exec("SELECT window_id FROM windowevent ORDER BY id ASC")[0]['values'];
var windowevent_event_type = db.exec("SELECT event_type FROM windowevent ORDER BY id ASC")[0]['values'];



console.log('finished reading db file');

var server = http.createServer(function (req, res) {

    console.log('http request received.');

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'null');

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
        window_browser_url: window_browser_url,
        windowevent_times: windowevent_times,
        windowevent_window_ids: windowevent_window_ids,
        windowevent_event_type: windowevent_event_type
    };

    res.write(JSON.stringify(response_object));
    res.end();
});

server.listen(8002);
