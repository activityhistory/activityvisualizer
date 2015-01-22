window.onload = function() {
	
	<?php
	/*
	* Code to query an SQLite database and return
	* results as JSON.
	*/
	
	// Specify your sqlite database name and path //
	$dir = 'sqlite:/Users/Adam/.selfspy/selfspy.sqlite';

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
	
	
	// ### TODO parse windowids to processnames
	
	
	
	// ### TIMELINE
	// ## generate timeline data
	
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
	
	// ## draw timeline
	
    var data = [];
	
	for (var j = 0; j < processes_max; j++) {
		data.push({label: process_names[j], times: parsed_window_times[j]});
	}
	
	
	
  var width = 1000;
  
  function timelineStackedIcons() {
    var chart = d3.timeline()
      .stack() // toggles graph stacking
      .margin({left:140, right:30, top:0, bottom:0})
      ;
    var svg = d3.select("#timeline5").append("svg").attr("width", width)
      .datum(data).call(chart);
  }
  timelineStackedIcons();
  
  
  
  // ### WORDCLOUD
  
  
 var Wordtimes = {};
 
 var addpair = function (my_key, my_value) {
     Wordtimes[my_key] = my_value;
 }
 var givevalue = function (my_key) {
     return Wordtimes[my_key];
 }

for (var i = 1; i < words.length; i = i + 1) {
		var word_and_time = {"word": " ", "time": 0};
		word_and_time["time"] = Date.parse(word_times[i]) - Date.parse(word_times[i-1]);
		word_and_time["word"] = words[i];
		if (!(word_and_time["word"] in Wordtimes)) {
			addpair(word_and_time["word"], word_and_time["time"]);
		} else {
			Wordtimes[word_and_time["word"]] = givevalue[word_and_time["word"]] + word_and_time["time"];
		}
		
}

var render_array = []
for (var property in Wordtimes) {
    if (Wordtimes.hasOwnProperty(property)) {
        if (!(isNaN(Wordtimes[property])) && Wordtimes[property] >= 1) {
			var word_and_time = {"word": " ", "time": 0};
			word_and_time["time"] = Wordtimes[property];
			word_and_time["word"] = property;
			render_array.push(word_and_time);
		}
    }
}

console.log(render_array);
  
  var fill = d3.scale.category20();

  d3.layout.cloud().size([800, 800])
      .words(render_array.map(function(d) {
        return {text: d["word"], size: Math.pow(d["time"], 1/6) * 10};
      }))
      .padding(5)
      .rotate(0)
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();

  function draw(words) {
    d3.select("body").append("svg")
        .attr("width", 800)
        .attr("height", 800)
      .append("g")
        .attr("transform", "translate(400,400)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }
}