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

    // only for dayview
    var blob_scaling_factor = 10;
    var blob_width = 50;

    function durationToRadius(duration){
        return 2 * Math.pow(duration, 1/6);
    }

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);


    function durationToHeight(duration){
        return pixel_per_minute * duration;
    }


    function updateAllDayView(){

        // BLOBS
        svg.selectAll(".blob_class").remove();

        var blobs = svg.selectAll("circle").data(chunk_objects);

        blobs.enter()
            .append("circle");

        blobs.attr("cx", border_left + date_width)
            .attr("class", "blob_class")
            .attr("cy", function(d, i) {
                return image_height * i + border_top + 50;
            })
            .attr("r", function(d) {
                return blob_scaling_factor * durationToRadius(d.duration);
            })
            .attr("fill", function(d) { return "steelblue"
                //return "rgb(0, 0, " + (d.duration * 10) + ")";
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
                return (image_height * i + border_top) + 54 ;
            })
            .attr("x", border_left + date_width - 12)
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
                var app_string = d.items[0].name;
                for (var k = 1; k < d.items.length; k++){
                    if (d.items[k] != -1) app_string = app_string + " and " + d.items[k].name;
                }
                return app_string;
            })
            .attr("y", function(d, i) {
                return image_height * i + border_top;
            })
            .attr("x", date_width + border_left + blob_width + image_width)
        //.attr("font-family", "sans-serif").attr("font-size", "11px")
        //.attr("fill", "black");


        // TEXT DATETIME (e.g. 23:42)
        svg.selectAll(".text_time").remove();

        var text_date = svg.selectAll("text_time")
            .data(chunk_objects);

        text_date.enter()
            .append("text");

        text_date.attr("class", "text_time")
            .text(function(d, i) {
                return new Date(d.start_time).toLocaleTimeString().substring(0,5) + new Date(d.start_time).toLocaleTimeString().substring(9,11) //+ " to " + new Date(d.end_time).toLocaleTimeString();
            })
            .attr("y", function(d, i) {
                return image_height * i + border_top;
            })
            .attr("x", border_left)
            //.attr("font-family", "sans-serif").attr("font-size", "11px")
            .attr("fill", "black");


        // IMAGE
        svg.selectAll(".image_class").remove();

        var image_class = svg.selectAll("image_class")
            .data(chunk_objects);

        image_class.enter()
            .append("svg:image");

        image_class.attr("class", "image_class")
            .attr("y", function(d, i) {
                return image_height * i
            })
            .attr("x", date_width + border_left + blob_width)
            .attr("width", image_width)
            .attr("height", image_height)
            .attr("xlink:href", function(d, i) {
                for (var j = 0; j < screenshot_times.length; j++){
                    if (screenshot_times[j].unix_time >= d.start_time && screenshot_times[j].unix_time <= d.end_time){
                        return "data/screenshots/" + screenshot_times[j].filename;
                    }
                }
                return "benchmark.png";
            });


    }


    function updateAllWeekView(){


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

    function deleteEverything(){

        svg.remove();

        //Create SVG element
            svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    }

    function updateAll(){

        if ($('input[name=radio]:checked', '#myForm').val() == "dayview"){
            updateAllDayView();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "weekview"){
            updateAllWeekView();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "small_multiples"){
            window.location.href = "small_multiples.html";
        }

    }

    $("#timeGranularity").slider({max:60},{min:5},{value:30},{step:5},{slide: function( event, ui ) {

        time_interval = minutesToMilliseconds(ui.value);

        generateChunks();
        if ($('input[name=radio]:checked', '#myForm').val() == "dayview"){
            updateAllDayView();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "weekview"){
            updateAllWeekView();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "small_multiples"){
            updateAllSmallMultiplesView();
        }

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
        if ($('input[name=radio]:checked', '#myForm').val() == "dayview"){
            deleteEverything();
            updateAll();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "weekview"){
            deleteEverything();
            updateAll();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "small_multiples"){
            deleteEverything();
            updateAll();
        }
    });



    updateAll();

}
