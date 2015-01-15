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
	
	// Get words for wordcloud //
	$query_words = "SELECT * FROM window";

	$word_row0 = array();
	$word_times = array();

	// Iterate through the results and pass into JSON encoder //

	foreach ($dbh->query($query_words) as $row) {

		array_push($word_row0, $row[2]);
		array_push($word_times, $row[1]);

	}

	echo "var words = ".json_encode($word_row0).";\n";
	echo "var word_times = ".json_encode($word_times).";\n";

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
	
	for (var j = 0; j < processes_max; j++) {
		data.push({icon: "icons/selfspy.png", times: proctimes[j]});
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