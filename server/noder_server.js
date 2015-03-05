var fs = require('fs');
var http = require('http'); 

var files = fs.readdirSync('/Volumes/SELFSPY/p1/screenshots');

console.log('finished reading filenames');

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
    res.write(files.toString());
    res.end();
});

server.listen(8001);
