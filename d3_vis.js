function drawD3(){

    //Width and height
    var w = 2000;
    var h = 5000;

    var border_left = 5;
    var border_top = 10;
    var weekday_label_height = 20;
    var date_width = 60;
    var timeline_width = 20;

    var full_height = 500;
    var full_width = 1300;
    var pixel_per_minute = full_height / (60 * 24);

    var image_width = (full_width / 7) - 2 * timeline_width;
    var image_height = 100;

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var times = [];
    for (var i = 0; i < minutesToMilliseconds(60 * 24); i += minutesToMilliseconds(60)) {
        times.push(i);
    }

    var time_labels = svg.selectAll(".time_label_class").data(times);

    time_labels.enter()
        .append("text");

    time_labels.attr("class", "time_label_class")
        .text(function(d) {
            return new Date(d).getHours();
        })
        .attr("y", function(d) {
            return  pixel_per_minute * millisecondsToMinutes(d % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
        })
        .attr("x", border_left)
        //.attr("font-family", "sans-serif").attr("font-size", "11px")
        .attr("fill", "black");

    var weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    var weekday_labels = svg.selectAll(".weekday_label_class").data(weekdays);

    weekday_labels.enter()
        .append("text");

    weekday_labels.attr("class", "weekday_label_class")
        .text(function(d) {
            return d;
        })
        .attr("y", border_top)
        .attr("x", function(d, i) {
            return  border_left + date_width + timeline_width + i * (full_width / 7);
        })
        //.attr("font-family", "sans-serif").attr("font-size", "11px")
        .attr("fill", "black");



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
            return  border_left + date_width + day * (full_width / 7);
        })
            .attr("class", "clicks_class")
            .attr("y", function(d) {
                return  pixel_per_minute * millisecondsToMinutes(d.minute_start_time % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
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
            return border_left + date_width + timeline_width + day * (full_width / 7);
        })
            .attr("class", "rect_class")
            .attr("y", function(d) {
                return pixel_per_minute * millisecondsToMinutes(d.start_time % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
            })
            .attr("height", function(d) {
                return durationToHeight(d.duration);
            })
            .attr("width", timeline_width)
            .attr("fill", function(d) {

                return "rgb(0, 0, " + (d.duration * 10) + ")";
            });



        // IMAGE
        svg.selectAll(".image_class").remove();

        var image_class = svg.selectAll("image_class")
            .data(chunk_objects);

        image_class.enter()
            .append("svg:image");

        image_class.attr("class", "image_class")
            .attr("y", function(d, i) {
                return pixel_per_minute * millisecondsToMinutes(d.start_time % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
            })
            .attr("x", function(d) {
                var day = new Date(d.start_time).getDay();
                return border_left + date_width + 2 * timeline_width + day * (full_width / 7);
            })
            .attr("width", image_width)
            .attr("height", function(d) {
                return durationToHeight(d.duration);
            })
            .attr("xlink:href", function(d, i) {
                for (var j = 0; j < screenshot_times.length; j++){
                    if (screenshot_times[j].unix_time >= d.start_time && screenshot_times[j].unix_time <= d.end_time){
                        return "data/screenshots/" + screenshot_times[j].filename;
                    }
                }
                return "benchmark.png";
            });

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


    $('#myForm input').on('change', function() {
        alert($('input[name=radio]:checked', '#myForm').val());
    });



    updateAll();

}
