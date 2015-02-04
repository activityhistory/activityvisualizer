function drawD3(){

	//Width and height
	var w = 700;
	var h = 4000;

	var border_left = 200;
	var border_top = 200;

	function durationToRadius(duration){
		return 20 * Math.pow(duration, 1/4);
	}

	//Create SVG element
	var svg = d3.select("body")
	            .append("svg")
	            .attr("width", w)
	            .attr("height", h);

	svg.selectAll("circle")
	   .data(d3_durations)
	   .enter()
	   .append("circle")
		.attr("cx", border_left)
		.attr("cy", function(d, i) {
			var sum = 0;
			for (var j = 0; j < i; j++){
				sum += 2 * durationToRadius(d3_durations[j]);
			}
	           return border_top + sum + durationToRadius(d);
	   })
		.attr("r", function(d) {
	           return durationToRadius(d);
	   })
	   .attr("fill", function(d) {
	        return "rgb(0, 0, " + (d * 10) + ")";
	   });

	svg.selectAll("text")
	   .data(d3_durations)
	   .enter()
	   .append("text")
	   .text(function(d, i) {
	           return d + "min";
	   })
	   .attr("y", function(d, i) {
			var sum = 0;
			for (var j = 0; j < i; j++){
				sum += 2 * durationToRadius(d3_durations[j]);
			}
	           return border_top + sum + durationToRadius(d);
	   })
	   .attr("x", border_left)
	   .attr("font-family", "sans-serif").attr("font-size", "11px")
	   .attr("fill", "white");

	svg.selectAll("text_labels")
	   .data(d3_durations)
	   .enter()
	   .append("text")
	   .text(function(d, i) {
	           return d3_items[i][0];
	   })
	   .attr("y", function(d, i) {
			var sum = 0;
			for (var j = 0; j < i; j++){
				sum += 2 * durationToRadius(d3_durations[j]);
			}
	           return border_top + sum + durationToRadius(d);
	   })
	   .attr("x", function(d) {
	           return 2 * border_left;
	   })
	   .attr("font-family", "sans-serif").attr("font-size", "11px")
	   .attr("fill", "black");

	$("#windowSize").slider({ max: 100 },{min:1},{value:50},{slide: function( event, ui ) {

			time_interval = ui.value * 60000;
		tableCreate();


            d3.selectAll('circle')
               .attr("cy", function(d, i) {
					var sum = 0;
					for (var j = 0; j < i; j++){
						sum += 2 * durationToRadius(d3_durations[j]);
					}
	           		return border_top + ui.value/50	 * (sum + durationToRadius(d));
	   			})
				.attr("r", function(d) {
	           		return ui.value/50	 * durationToRadius(d);
	   			});


			svg.selectAll("text")
	    .data(d3_durations)
		.text(function(d) {
	           return d + "min";
	   })
	   .attr("y", function(d, i) {
			var sum = 0;
			for (var j = 0; j < i; j++){
				sum += 2 * durationToRadius(d3_durations[j]);
			}
	           return border_top + ui.value/50	 * (sum + durationToRadius(d));
	   });


		svg.selectAll("text_labels")
	   .attr("y", function(d, i) {
			var sum = 0;
			for (var j = 0; j < i; j++){
				sum += 2 * durationToRadius(d3_durations[j]);
			}
	           return border_top + ui.value/50	 * (sum + durationToRadius(d));
	   });


            document.getElementById('sizeText').innerHTML = 'Window Size: ' + ui.value
        }});

}