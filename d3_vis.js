function drawD3(){

	//Width and height
	var w = 700;
	var h = 4000;

	var border_left = 200;
	var border_top = 200;

	//Create SVG element
	var svg = d3.select("body")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	function durationToRadius(duration){
		var number = 20 * Math.pow(duration, 1/4);
		if (number > 0){
			return number;
		} else {
			console.log("number: " + number);
			console.log("duration: " + duration);
			return 0
		}
	}

	$("#windowSize").slider({ max: 100 },{min:1},{value:50},{slide: function( event, ui ) {

		time_interval = ui.value * 60000;
		d3_durations = [];
		d3_items = [];
		tableCreate();

		svg.selectAll(".text_dur").remove();
		svg.selectAll(".text_labels").remove();

		var blobs = svg.selectAll("circle").data(d3_durations);

		blobs.enter()
			.append("circle");

		blobs.attr("cx", border_left)
			.attr("cy", function(d, i) {
				var sum = 0;
				for (var j = 0; j < i; j++){
					sum += 2 * durationToRadius(d3_durations[j]);
				}
				return border_top + ui.value/50	 * (sum + durationToRadius(d));
			})
			.attr("r", function(d) {
				return ui.value/50	 * durationToRadius(d);
			})
			.attr("fill", function(d) {
				return "rgb(0, 0, " + (d * 10) + ")";
			});

		blobs.exit().remove();

		var text_dur = svg.selectAll("text_dur")
			.data(d3_durations);

		text_dur.enter()
			.append("text")
			.attr("class", "text_dur")
			.attr("y", function(d, i) {
				var sum = 0;
				for (var j = 2; j < i; j++){
					sum += 2 * durationToRadius(d3_durations[j]);
				}
				return border_top + ui.value/50	 * (sum + durationToRadius(d))
			})
			.attr("x", border_left)
			.attr("font-family", "sans-serif").attr("font-size", "11px")
			.attr("fill", "white");

		text_dur.text(function(d) { return d + "min"; });


		document.getElementById('sizeText').innerHTML = 'Scaling Factor: ' + ui.value


		svg.selectAll("text_labels")
			.data(d3_durations)
			.enter()
			.append("text")
			.attr("class", "text_labels")
			.text(function(d, i) {
				return d3_items[i][0];
			})
			.attr("y", function(d, i) {
				var sum = 0;
				for (var j = 2; j < i; j++){
					sum += 2 * durationToRadius(d3_durations[j]);
				}
				return border_top + sum + durationToRadius(d);
			})
			.attr("x", function(d) {
				return 2 * border_left;
			})
			.attr("font-family", "sans-serif").attr("font-size", "11px")
			.attr("fill", "black");
	}});

}