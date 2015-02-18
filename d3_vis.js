function drawD3(){

    //Width and height
    var w = 2000;
    var h = 5000;

    var border_left = 5;
    var border_top = 10;
    var date_width = 60;
    var timeline_width = 20;

    var full_height = 500;
    var pixel_per_minute = full_height / (60 * 24);

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    function durationToHeight(duration){
        return pixel_per_minute * duration;
    }

    function updateAll(){


        // CLICKS RECTANGLES
        svg.selectAll(".clicks_class").remove();

        var click_rects = svg.selectAll(".clicks_class").data(minutes_with_clicks);

        click_rects.enter()
            .append("rect");

        click_rects.attr("x", function(d) {
                var day = new Date(d.minute_start_time).getDay();
                return  border_left + date_width + timeline_width + day * 3 * timeline_width;
            })
            .attr("class", "clicks_class")
            .attr("y", function(d) {
                return  pixel_per_minute * millisecondsToMinutes(d.minute_start_time % minutesToMilliseconds(60 * 24)) + border_top;
            })
            .attr("height", pixel_per_minute)
            .attr("width", timeline_width)
            .attr("fill", function(d) {
                var color = Math.floor((d.number_of_clicks * 255) / highest_numner_of_clicks_per_minute);

                return "rgb(" + 255 + ", " + (255 - color) + ", " + (255 - color) + ")";
            });



        // TIMELINE RECTANGLES
        svg.selectAll(".rect_class").remove();

        var blobs = svg.selectAll(".rect_class").data(chunk_objects);

        blobs.enter()
            .append("rect");

        blobs.attr("x", function(d) {
                var day = new Date(d.start_time).getDay();
                return  border_left + date_width + day * 3 * timeline_width;
            })
            .attr("class", "rect_class")
            .attr("y", function(d) {
                return  pixel_per_minute * millisecondsToMinutes(d.start_time % minutesToMilliseconds(60 * 24)) + border_top;
            })
            .attr("height", function(d) {
                return durationToHeight(d.duration);
            })
            .attr("width", timeline_width)
            .attr("fill", function(d) {

                return "rgb(0, 0, " + (d.duration * 10) + ")";
            });

        // TEXT DATETIME (e.g. 23:42)
        svg.selectAll(".text_time").remove();

        var text_date = svg.selectAll("text_time")
            .data(chunk_objects);

        text_date.enter()
            .append("text");

        text_date.attr("class", "text_time")
            .text(function(d) {
                var date_string = new Date(d.start_time).toLocaleTimeString();
                if (date_string.length == 11){
                    return date_string.substring(0,5) + date_string.substring(9,11);
                } else {
                    return date_string.substring(0,4) + date_string.substring(8,10);
                }
            })
            .attr("y", function(d) {
                return  pixel_per_minute * millisecondsToMinutes(d.start_time % minutesToMilliseconds(60 * 24)) + border_top;
            })
            .attr("x", border_left)
            //.attr("font-family", "sans-serif").attr("font-size", "11px")
            .attr("fill", "black");

    }

    $("#timeGranularity").slider({max:60},{min:5},{value:30},{step:5},{slide: function( event, ui ) {

        time_interval = minutesToMilliseconds(ui.value);

        generateChunks();
        updateAll();

        document.getElementById('timeGranularityText').innerHTML = 'Time Granularity: ' + ui.value;

    }});

    $("#numberApps").slider({max:7},{min:1},{value:3},{slide: function( event, ui ) {

        number_of_top_elements = ui.value;
        generateChunks();
        updateAll();

        document.getElementById('numberAppsText').innerHTML = 'Number of Apps: ' + ui.value;

    }});

    $("#dateRange").slider({ max: latest_time },{min:earliest_time},{values: [earliest_time, latest_time]},{slide: function( event, ui ) {


        earliest_time = ui.values[0];
        latest_time = ui.values[1];
        generateChunks();
        updateAll();

        document.getElementById('dateRangeText').innerHTML = new Date(ui.values[0]).toLocaleTimeString() + ' to ' + new Date(ui.values[1]).toLocaleTimeString();

    }});

    $("#appSimilarity").slider({max:1.0},{min:0.0},{value:1.0},{step:0.1},{slide: function( event, ui ) {

        app_similarity_ratio = ui.value;
        generateChunks();
        updateAll();

        document.getElementById('appSimilarityText').innerHTML = 'App Similarity: ' + ui.value;

    }});

    updateAll();

}
