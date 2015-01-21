window.onload = function() {
	
	<?php
	/*
	* Code to query an SQLite database and return
	* results as JSON.
	*/
	
	// Specify your sqlite database name and path //
	$dir = 'sqlite:/Users/jonas/.selfspy/selfspy.sqlite';

	// Instantiate PDO connection object and failure msg //
	$dbh = new PDO($dir) or die("cannot open database");


	// ## PARSE WINDOWEVENT - Get words for wordcloud

	// Define your SQL statement //
	$query = "SELECT * FROM windowevent";
	
	$windowevent_times = array();
	$windowevent_window_ids = array();
	$windowevent_event_type = array();

	// Iterate through the results and pass into JSON encoder //

	foreach ($dbh->query($query) as $row) {

		array_push($windowevent_times, $row[1]);
		array_push($windowevent_window_ids, $row[2]);
		array_push($windowevent_event_type, $row[3]);

	}

	echo "var windowevent_times = ".json_encode($windowevent_times).";\n";
	echo "var windowevent_window_ids = ".json_encode($windowevent_window_ids).";\n";
	echo "var windowevent_event_type = ".json_encode($windowevent_event_type).";\n";
	
	
	// ## PARSE WINDOW - Get words for wordcloud
	$query_words = "SELECT * FROM window";

	$window_ids = array();
	$window_process_id = array();

	// Iterate through the results and pass into JSON encoder //

	foreach ($dbh->query($query_words) as $row) {

		array_push($window_ids, $row[0]);
		array_push($window_process_id, $row[4]);

	}

	echo "var window_ids = ".json_encode($window_ids).";\n";
	echo "var window_process_id = ".json_encode($window_process_id).";\n";
	
	
	// ## PARSE PROCESS - Get processes for labels //
	$query = "SELECT * FROM process";

	$process_names = array();
	$process_ids = array();

	// Iterate through the results and pass into JSON encoder //

	foreach ($dbh->query($query) as $row) {

		array_push($process_names, $row[2]);
		array_push($process_ids, $row[0]);

	}

	echo "var process_names = ".json_encode($process_names).";\n";
	echo "var process_ids = ".json_encode($process_ids).";\n";

	?>
	
	
	// ### TABLE
	// ## generate table data
	
	var processes_max = 0;
	
	for (var i = 1; i < process_ids.length; i++) {
		if (process_ids[i] > process_ids) { processes_max = process_ids[i];}
	}
		
	var parsed_window_times = [];
	
	for (var j = 0; j <= processes_max; j++) { parsed_window_times[j] = []; }
	
	console.log(parsed_window_times);
	
	not_include_counter = 0;
	for (var i = 1; i < windowevent_times.length; i = i + 1) {
		process_name = process_names[window_process_id[windowevent_window_ids[i-1]]];
		if (process_name == "Dock"){
			not_include_counter++;
		}
		else if (windowevent_event_type[i] != "Close"){
			var start_end_time = {"starting_time": 0, "ending_time": 0};
			start_end_time["starting_time"] = Date.parse(windowevent_times[i-1-not_include_counter]);
			start_end_time["ending_time"] = Date.parse(windowevent_times[i]);
			parsed_window_times[window_process_id[windowevent_window_ids[i-1]]].push(start_end_time);
			not_include_counter = 0;
		}
	}
	
	function tableCreate(){
	var body=document.getElementsByTagName('body')[0];
	var tbl=document.createElement('table');
	tbl.style.width='100%';
	tbl.setAttribute('border','1');
	var tbdy=document.createElement('tbody');
	for(var i=0;i<parsed_window_times.length;i++){
	    var tr=document.createElement('tr');
        var td=document.createElement('td');
		td.appendChild(document.createTextNode(process_names[i]))
        tr.appendChild(td)
	    for(var j=0;j<parsed_window_times[i].length;j++){
	        var td=document.createElement('td');
			td.appendChild(document.createTextNode(JSON.stringify(parsed_window_times[i][j],null,4)));
	        tr.appendChild(td)
	    }
	    tbdy.appendChild(tr);
	}
	tbl.appendChild(tbdy);
	body.appendChild(tbl)
	}
	
	tableCreate();

}