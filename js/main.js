var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('dbfile');
var savedbElm = document.getElementById('savedb');

// Start the worker in which sql.js will run
var workerPath = "../bower_components/sql.js/js/worker.sql.js";
var worker = new Worker(workerPath);

worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

/*
// Connect to the HTML element we 'print' to
function print(text) {
    outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
*/

function error(e) {
  console.log(e);
}

/* 
function noerror() {
		errorElm.style.height = '0';
}
*/

// Run a command in the database
function execute(commands,prefix,func) {
	// tic();
	worker.onmessage = function(event) {
		var results = event.data.results;
		// toc("Executing SQL");

		// tic();
		outputElm.innerHTML = "";

		for (var i=0; i<results.length; i++) {
			outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
		}


					console.log(JSON.stringify(results[0].values));					
					console.log(JSON.stringify(results[0].values[3]));		
					console.log(JSON.stringify(results[0].values[3][1]));				


		//jsonCreate(results.values);
		//console.log(results[1].values);
		// toc("Displaying results");
	}
	worker.postMessage({action:'exec', sql:commands});
	// outputElm.textContent = "Fetching results...";
}

function exec(commands,callback) {
	worker.onmessage = function(event) {
			var results = event.data.results;
	}
		worker.postMessage({action:'exec', sql:commands});
	callback(results)
}

function jsonify(data) {
	// Returns JSON version of input
	return JSON.stringify(data);
}

function jsonSQL(query) {
	// Returns 
	return jsonify(exec(query));
}


function jsonCreate() {
	// SELECT * from windowevent
	var windowevent_times = JSON.stringify(windowevent_results[0].values[1]); // 0 SELECT created_at FROM windowevent; 
	var windowevent_window_ids = JSON.stringify(windowevent_results[0].values[2]); // 1 SELECT window_ids FROM windowevent; 
	var windowevent_event_type = JSON.stringify(windowevent_results[0].values[3]); // 2 SELECT event_type FROM windowevent; 
	// SELECT * from window
	var window_process_id = JSON.stringify(window_results[0].values[4]); // 3 SELECT process_id FROM window; 
	// SELECT * from process
	var process_names = JSON.stringify(process_results[0].values[2]); // 4 SELECT id FROM process; 
	var process_ids = JSON.stringify(process_results[0].values[0]); // 5 SELECT name FROM process;
}
// Create an HTML table

/*
SELECT * FROM windowevent
var windowevent_times = row[1]
var windowevent_title = row[2]
var windowevent_browser_url = row[3]
SELECT created_at FROM windowevent;
SELECT window_ids FROM windowevent;
SELECT event_type FROM windowevent;

SELECT * FROM window
var window_process_id = row[4]
SELECT process_id FROM window;

SELECT * from process
var process_names = row[2]
var process_ids = row[0]
SELECT id FROM process;
SELECT name FROM process;

SELECT created_at FROM windowevent; SELECT title FROM windowevent; SELECT browser_url FROM windowevent; SELECT process_id FROM window; SELECT id FROM process; SELECT name FROM process;

*/

/*
First we're loading the database.

Then we want to make a database call for each table.

The main dilemma seems to be whether to grab the entire table, and parse out what you need, or design a function that receives a 
SQL query as input and returns a json string containing that retrieval.

Then we want to take the result, and parse out a specific column.

We want to jsonify that column and encode it as a variable.
*/



var tableCreate = function () {
  function valconcat(vals, tagName) {
    if (vals.length === 0) return '';
    var open = '<'+tagName+'>', close='</'+tagName+'>';
    return open + vals.join(close + open) + close;
  }
  return function (columns, values){
    var tbl  = document.createElement('table');
    var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
    var rows = values.map(function(v){ return valconcat(v, 'td'); });
    html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
	  tbl.innerHTML = html;
    return tbl;
  }
}();

// Execute the commands when the button is clicked
function execEditorContents () {
	var commands = "SELECT created_at FROM windowevent; ";
	// noerror()
	//execute (editor.getValue() + ';');
	execute(commands);
}
execBtn.addEventListener("click", execEditorContents, true);

// Performance measurement functions
/* var tictime;
if (!window.performance || !performance.now) {window.performance = {now:Date.now}}
function tic () {tictime = performance.now()}
function toc(msg) {
	var dt = performance.now()-tictime;
	console.log((msg||'toc') + ": " + dt + "ms");
}
*/

// Load a db from a file
dbFileElm.onchange = function() {
	var f = dbFileElm.files[0];
	var r = new FileReader();
	r.onload = function() {
		worker.onmessage = function () {
			// toc("Loading database from file");
			// Show the schema of the loaded database 
			// editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		// tic();
		try {
			worker.postMessage({action:'open',buffer:r.result}, [r.result]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:r.result});
		}
	}
	r.readAsArrayBuffer(f);
}

// Save the db to a file
function savedb () {
	worker.onmessage = function(event) {
		toc("Exporting the database");
		var arraybuff = event.data.buffer;
		var blob = new Blob([arraybuff]);
		var url = window.URL.createObjectURL(blob);
		window.location = url;
	};
	tic();
	worker.postMessage({action:'export'});
}
savedbElm.addEventListener("click", savedb, true);


/*
var dbFileElm = document.getElementById('dbfile');
var outputElm = $('#output');
var errorElm = $('#error');

function error(e) {
  console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

var workerPath = "../bower_components/sql.js/js/worker.sql.js";
var worker = new Worker(workerPath);
worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

// Connect to the HTML element we 'print' to
function print(text) {
    outputElm.innerHTML = text.replace(/\n/g, '<br>');
}

// Run a command in the database
function execute(commands) {
	worker.onmessage = function(event) {
		var results = event.data.results;
		outputElm.innerHTML = "";
		for (var i=0; i<results.length; i++) {
			outputElm.appendChild("<div>"+results[i].columns+"</div><div>"+results[i].values+"/div>");
		}
	};
	worker.postMessage({action:'exec', sql:commands});
	outputElm.textContent = "Fetching results...";
}

// Load a db from a file
dbFileElm.onchange = function() {
	var f = dbFileElm.files[0];
	var r = new FileReader();
	r.onload = function() {
		worker.onmessage = function () {
			// Stuff to do when DB loads
			var SQL = "SELECT `name`, `sql` FROM `sqlite_master` WHERE type='table'";
			execute(SQL);
		};
		try {
			worker.postMessage({action:'open',buffer:r.result}, [r.result]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:r.result});
		}
	};
	r.readAsArrayBuffer(f);
};


//    var res = db.exec("SELECT * FROM processevent");



		/*
alert ("output: "+res);
	$(outputElm).html(res);
};
*/


/* Eventually:
var fs = require('fs');
var SQL = require('sql.js');
var filebuffer = fs.readFileSync('test.sqlite');

// Load the db
var db = new SQL.Database(filebuffer);
*/
