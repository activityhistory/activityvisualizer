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

	// Define your SQL statement //
	$query = "SELECT * FROM processevent";

	$row0 = array();
	$row1 = array();
	$row2 = array();
	$row3 = array();

	// Iterate through the results and pass into JSON encoder //

	foreach ($dbh->query($query) as $row) {

		array_push($row0, $row[0]);
		array_push($row1, $row[1]);
		array_push($row2, $row[2]);
		array_push($row3, $row[3]);

	}

	echo "var ids = ".json_encode($row0).";\n";
	echo "var times = ".json_encode($row1).";\n";
	echo "var processes = ".json_encode($row2).";\n";
	echo "var event = ".json_encode($row3).";\n";

	?>
	
	var processes_max = 0;
	
	for (var i = 1; i < processes.length; i++) {
		if (processes[i] > processes_max) { processes_max = processes[i];}
	}
		
	var proctimes = [];
	
	for (var j = 0; j <= processes_max; j++) { proctimes[j] = []; }
	
	for (var i = 1; i < times.length; i = i + 1) {
			if (event[i] != "Close"){
				var start_end_time = {"starting_time": 0, "ending_time": 0};
				start_end_time["starting_time"] = Date.parse(times[i-1]);
				start_end_time["ending_time"] = Date.parse(times[i]);
				proctimes[processes[i-1]].push(start_end_time);
			}
	}
	
	
    var data = [];
	
	for (var j = 0; j < 8; j++) {
		data.push({icon: "x.png", times: proctimes[j]});
	}
  var width = 1000;
  function timelineStackedIcons() {
    var chart = d3.timeline()
      .stack() // toggles graph stacking
      .margin({left:70, right:30, top:0, bottom:0})
      ;
    var svg = d3.select("#timeline5").append("svg").attr("width", width)
      .datum(data).call(chart);
  }
  timelineStackedIcons();
}