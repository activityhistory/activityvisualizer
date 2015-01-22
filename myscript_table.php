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
	
	var earliest_time = Date.parse(windowevent_times[0]);
	var latest_time = Date.parse(windowevent_times[windowevent_times.length - 1]);
	
	var time_interval = latest_time - earliest_time;
	
	var filtered_events_process_id = [];
	var filtered_events_start_time = [];
	var filtered_events_end_time = [];
	
	// *** simplified activity table START
	
	var past_event = -1
	
	for(var k=0;k<windowevent_window_ids.length;k++){
		if (windowevent_event_type[k] == "Active"){
			if (past_event != -1){
				filtered_events_process_id.push(window_process_id[windowevent_window_ids[past_event]]);
				filtered_events_start_time.push(Date.parse(windowevent_times[past_event]));
				filtered_events_end_time.push(Date.parse(windowevent_times[k]));
			}
			past_event = k;
		} else if (past_event != -1 & windowevent_event_type[k] == "Active" & windowevent_window_ids[past_event] == windowevent_window_ids[k]) {
			filtered_events_process_id.push(window_process_id[windowevent_window_ids[past_event]]);
			filtered_events_start_time.push(Date.parse(windowevent_times[past_event]));
			filtered_events_end_time.push(Date.parse(windowevent_times[k]));
			past_event = -1;
		}
	}
	
	
	// *** simplified activity table END
	
	function tableCreate(){
	var body=document.getElementsByTagName('body')[0];
	var tbl=document.createElement('table');
	//tbl.style.width='100%';
	tbl.setAttribute('border','1');
	var tbdy=document.createElement('tbody');
	
	var time_interval = 100000;
	
	for(var i=earliest_time;i<latest_time;i+=time_interval){
	    var tr=document.createElement('tr');
        var td=document.createElement('td');
		td.appendChild(document.createTextNode(i + " to " + (i+time_interval)));
        tr.appendChild(td);
	    
		var process_with_duration = [];
		for (var j = 0; j <= processes_max; j++) { process_with_duration[j] = 0; }
		
		for(var k=0;k<filtered_events_process_id.length;k++){
		
			if (filtered_events_start_time[k] <= i && filtered_events_end_time[k] >= i+time_interval){
				
				process_with_duration[filtered_events_process_id[k]] += time_interval;
				
			} else if (filtered_events_start_time[k] >= i && filtered_events_start_time[k] <= i+time_interval){
				
				process_with_duration[filtered_events_process_id[k]] += 
					Math.min.apply(null, [filtered_events_start_time[k], i+time_interval]) - filtered_events_start_time[k];
					
			} else if (filtered_events_end_time[k] >= i && filtered_events_end_time[k] <= i+time_interval) {
				
				process_with_duration[filtered_events_process_id[k]] += filtered_events_end_time[k] - i;
			}
		}
		
		var highest_1 = -1;
		var highest_2 = -1;
		var highest_3 = -1;
		
		for (var j = 0; j <= processes_max; j++) {
			console.log(process_with_duration[j]);
			if ((highest_3 == -1 | process_with_duration[j] > process_with_duration[highest_3]) & process_with_duration[j] > 0){
				if (highest_2 == -1 | process_with_duration[j] > process_with_duration[highest_2]){
					if (highest_1 == -1 | process_with_duration[j] > process_with_duration[highest_1]){
						highest_3 = highest_2;
						highest_2 = highest_1;
						highest_1 = j;
					} else {
						console.log(B);
						highest_3 = highest_2;
						highest_2 = j;
					}
				}  else {
					console.log(C);
						highest_3 = j;
					}
			}
		}
		
	    var td=document.createElement('td');
		if (highest_1 != -1){
			td.appendChild(document.createTextNode(process_names[highest_1]));
			tr.appendChild(td);	
		}
		
	    var td=document.createElement('td');
		if (highest_2 != -1){
			td.appendChild(document.createTextNode(process_names[highest_2]));
			tr.appendChild(td);	
		}
		
	    var td=document.createElement('td');
		if (highest_3 != -1){
			td.appendChild(document.createTextNode(process_names[highest_3]));
			tr.appendChild(td);	
		}

			
	    tbdy.appendChild(tr);
	}
	tbl.appendChild(tbdy);
	body.appendChild(tbl)
	}
	
	tableCreate();

}