function drawD3(){

	//Width and height
	var w = 1400;
	var h = 4000;

	var border_left = 0;
	var border_top = 0;
	var date_width = 250;
	var blob_width = 150;

	//Create SVG element
	var svg = d3.select("body")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	function durationToRadius(duration){
		var number = 20 * Math.pow(duration, 1/3);
		if (number > 0){
			return number;
		} else {
			console.log("number: " + number);
			console.log("duration: " + duration);
			return 0
		}
	}

	function updateAll(ui){

		// TEXT BLOBS

		svg.selectAll(".blob_class").remove();

		var blobs = svg.selectAll("circle").data(chunk_objects);

		blobs.enter()
			.append("circle");

		blobs.attr("cx", border_left + date_width)
			.attr("class", "blob_class")
			.attr("cy", function(d, i) {
				var sum = 0;
				for (var j = 0; j < i; j++){
					sum += 2 * durationToRadius(chunk_objects[j].duration);
				}
				return border_top + ui.value/2	 * (sum + durationToRadius(d.duration));
			})
			.attr("r", function(d) {
				return ui.value/2	 * durationToRadius(d.duration);
			})
			.attr("fill", function(d) {
				return "rgb(0, 0, " + (d.duration * 10) + ")";
			});

		// TEXT DURATION (e.g. 20min)

		svg.selectAll(".text_dur").remove();

		var text_dur = svg.selectAll("text_dur")
			.data(chunk_objects);

		text_dur.enter()
			.append("text");

		text_dur.text(function(d) { return d.duration + "min"; })
			.attr("class", "text_dur")
			.attr("y", function(d, i){
				var sum = 0;
				for (var j = 0; j < i; j++){
					sum += 2 * durationToRadius(chunk_objects[j].duration);
				}
				return border_top + ui.value/2	 * (sum + durationToRadius(d.duration));
			})
			.attr("x", border_left + date_width)
			.attr("font-family", "sans-serif").attr("font-size", "11px")
			.attr("fill", "white");


		// TEXT LABELS (e.g. Apps)

		svg.selectAll(".text_labels").remove();

		var text_item = svg.selectAll("text_labels")
			.data(chunk_objects);

		text_item.enter()
			.append("text");

		text_item.attr("class", "text_labels")
			.text(function(d, i) {
				var app_string = d.items[0];
				for (var j = number_of_top_elements; j > 0; j--){
					if (d.items.length = j){
						for (var k = 1; k < j; k++){
							if (d.items[k] != -1) app_string = app_string + " and " + d.items[k];
						}
						break;
					}

				}
				return app_string;
			})
			.attr("y", function(d, i) {
				var sum = 0;
				for (var j = 0; j < i; j++){
					sum += 2 * durationToRadius(chunk_objects[j].duration);
				}
				return border_top + ui.value/2	 * (sum + durationToRadius(d.duration));
			})
			.attr("x", date_width + border_left + blob_width)
			.attr("font-family", "sans-serif").attr("font-size", "11px")
			.attr("fill", "black");


		// TEXT DATETIME (e.g. 23:42)

		svg.selectAll(".text_time").remove();

		var text_item = svg.selectAll("text_time")
			.data(chunk_objects);

		text_item.enter()
			.append("text");

		text_item.attr("class", "text_time")
			.text(function(d, i) {
				return new Date(d.start_time).toLocaleTimeString() + " to " + new Date(d.end_time).toLocaleTimeString();
			})
			.attr("y", function(d, i) {
				var sum = 0;
				for (var j = 0; j < i; j++){
					sum += 2 * durationToRadius(chunk_objects[j].duration);
				}
				return border_top + ui.value/2	 * (sum + durationToRadius(d.duration));
			})
			.attr("x", border_left)
			.attr("font-family", "sans-serif").attr("font-size", "11px")
			.attr("fill", "black");


	}

	$("#timeGranularity").slider({ max: 4 },{min:1},{value:2},{slide: function( event, ui ) {

		time_interval = ui.value * 10 * 60000;
		generateChunks();
		updateAll(ui);

		document.getElementById('timeGranularityText').innerHTML = 'Time Granularity: ' + ui.value + "0";

	}});

	$("#numberApps").slider({ max: 5 },{min:1},{value:3},{slide: function( event, ui ) {

		number_of_top_elements = ui.value;
		generateChunks();
		updateAll(ui);
		document.getElementById('numberAppsText').innerHTML = 'Number of Apps: ' + ui.value;

	}});

}