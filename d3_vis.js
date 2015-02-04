function drawD3(){

	//Width and height
	var w = 700;
	var h = 4000;

	var dataset = d3_durations;
	var apps = d3_items;

	//Create SVG element
	var svg = d3.select("body")
	            .append("svg")
	            .attr("width", w)
	            .attr("height", h);

	svg.selectAll("circle")
	   .data(dataset)
	   .enter()
	   .append("circle")
		.attr("cx", function(d, i) {
	           return 200;
	   })
		.attr("cy", function(d, i) {
	           return i * (180) + 100;
	   })
		.attr("r", function(d) {
	           return 20 * Math.pow(d, 1/4);
	   })
	   .attr("fill", function(d) {
	        return "rgb(0, 0, " + (d * 10) + ")";
	   });

	svg.selectAll("text")
	   .data(dataset)
	   .enter()
	   .append("text")
	   .text(function(d, i) {
	           return d + "min";
	   })
	   .attr("y", function(d, i) {
	           return i * (180) + 100;
	   })
	   .attr("x", function(d) {
	           return 185;
	   })
	   .attr("font-family", "sans-serif").attr("font-size", "11px")
	   .attr("fill", "white");

	svg.selectAll("text_duration")
	   .data(dataset)
	   .enter()
	   .append("text")
	   .text(function(d, i) {
	           return apps[i][0];
	   })
	   .attr("y", function(d, i) {
	           return i * (180) + 100;
	   })
	   .attr("x", function(d) {
	           return 350;
	   })
	   .attr("font-family", "sans-serif").attr("font-size", "11px")
	   .attr("fill", "black");

	$("#windowSize").slider({ max: 600 },{min:200},{value:300},{slide: function( event, ui ) {
            d3.selectAll('circle')
               .attr("r", function(d) {
	           return ui.value /30 * Math.pow(d, 1/4);
	   });
            document.getElementById('sizeText').innerHTML = 'Window Size: ' + ui.value
        }});

}