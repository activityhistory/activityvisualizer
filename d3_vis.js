function drawD3(){

    //Width and height
    var w = 2000;
    var h = 5000;

    var border_left = 5;
    var border_top = 10;
    var weekday_label_height = 20;
    var date_width = 60;
    var timeline_width = 20;

    var full_height = 600;
    var full_width = 1300;
    var pixel_per_minute = full_height / (60 * 24);

    var image_width = (full_width / 7) - 2 * timeline_width;
    var image_height = 100;

    // only for dayview
    var blob_scaling_factor = 10;
    var blob_width = 50;

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        // .text("a simple tooltip");

    tooltip.append("img")
        .attr("src", "benchmark.png")
        .attr("id", "tooltip_image");

    function durationToRadius(duration){
        return Math.pow(duration, 1/2) / 4.0;
    }

    function durationToHeight(duration){
        return pixel_per_minute * duration;
    }

    function updateAllDayView(){

        reverse_chunk_objects = chunk_objects.reverse()

        // draw activity circles
        svg.selectAll(".activityCircles").remove();

        var circles = svg.selectAll("circle")
            .data(reverse_chunk_objects)
            .enter().append("circle")
            .attr("class", "activityCircles")
            .attr("cx", border_left + date_width)
            .attr("cy", function(d, i) { return image_height * i + border_top + 50; })
            .attr("r", function(d) { return blob_scaling_factor * durationToRadius(d.duration); })


        // label activity circles with duration in minutes
        svg.selectAll(".text_dur").remove();

        var text_dur = svg.selectAll("activityDurationText")
            .data(reverse_chunk_objects)
            .enter().append("text")
            .attr("class", "activityDurationText")
            .text(function(d) { return d.duration + "min"; })
            .attr("x", border_left + date_width - 12)
            .attr("y", function(d, i){ return (image_height * i + border_top) + 54 ; });


        // draw labels of most used apps
        svg.selectAll(".text_labels").remove();

        var text_item = svg.selectAll("text_labels")
            .data(reverse_chunk_objects)
            .enter().append("text")
            .attr("class", "text_labels labelText")
            .text(function(d, i) {
                var app_string = d.items[0].name;
                for (var k = 1; k < d.items.length; k++){
                    if (d.items[k] != -1) app_string = app_string + " and " + d.items[k].name;
                }
                return app_string;
            })
            .attr("x", date_width + border_left + blob_width + image_width + 10)
            .attr("y", function(d, i) { return image_height * i + border_top; });


        // draw activity start-time labels
        svg.selectAll(".text_time").remove();

        var text_date = svg.selectAll("text_time")
            .data(reverse_chunk_objects)
            .enter().append("text")
            .attr("class", "text_time labelText")
            .text(function(d, i) {
                date_string = new Date(d.start_time).toLocaleTimeString()
                split_string = date_string.split(":")
                trimmed_time =  split_string[0] + ":" + split_string[1] + " " + split_string[2].substring(3,5)
                return trimmed_time
            })
            .attr("x", border_left)
            .attr("y", function(d, i) {return image_height * i + border_top;})
            .attr("fill", "#CCC");


        // draw representative image for each activity
        svg.selectAll(".image_class").remove();

        var image_class = svg.selectAll("image_class")
            .data(reverse_chunk_objects)
            .enter().append("svg:image")
            .attr("class", "image_class")
            .attr("x", date_width + border_left + blob_width)
            .attr("y", function(d, i) {
                return image_height * i
            })
            .attr("width", image_width)
            .attr("height", image_height)
            .attr("xlink:href", function(d, i) {
                imgs_in_interval = []
                for (var j = 0; j < screenshot_times.length; j++){
                    if (screenshot_times[j].unix_time >= d.start_time && screenshot_times[j].unix_time <= d.end_time){
                        imgs_in_interval.push(j)
                    }
                }
                if (imgs_in_interval.length > 0){
                    k = parseInt(imgs_in_interval.length/2)
                    return "data/screenshots/" + screenshot_times[imgs_in_interval[k]].filename;
                }
                return "benchmark.png";
            })
            .on("mouseover", function(){
                tooltip.style("visibility", "visible")
                var imgsrc = this.getAttribute("href")
                d3.select("#tooltip_image").attr("src", function(){ return imgsrc})
                var rect = this.getBoundingClientRect();
                tooltip.style("top", (rect.top + document.body.scrollTop)+"px").style("left",(rect.right+10)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    }


    function updateAllWeekView(){

        // get list of hours in the day
        var times = [];
        for (var i=0; i<=24; i=i+3) {
            times.push(i);
        }

        // draw labels for hours
        var time_labels = svg.selectAll(".time_label_class")
            .data(times)
            .enter().append("text")
            .attr('class', 'labelText')
            .text(function(d) {
                var t = d % 12;
                if (t==0){ return 12 } else{ return t } })
            .attr("x", border_left)
            .attr("y", function(d) {
                return  (d * 60 * pixel_per_minute) + border_top + weekday_label_height;
            });


        // draw labels for weekdays
        var weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        var weekday_labels = svg.selectAll(".weekday_label_class")
            .data(weekdays)
            .enter().append("text")
            .text(function(d) { return d; })
            .attr("class", "weekday_label_class labelText")
            .attr("y", border_top)
            .attr("x", function(d, i) {
                return  border_left + date_width + timeline_width + i * (full_width / 7);
            })


        // draw rectangles for click activity
        svg.selectAll(".clicks_class").remove();

        var click_rects = svg.selectAll(".clicks_class")
            .data(minutes_with_clicks)
            .enter().append("rect")
            .attr("class", "clicks_class")
            .attr("x", function(d) {
                var day = new Date(d.minute_start_time-24*60*60*1000).getDay();
                return  border_left + date_width + day * (full_width / 7);
            })
            .attr("y", function(d) {
                return  pixel_per_minute * millisecondsToMinutes((d.minute_start_time-32*60*60*1000) % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
            })
            .attr("height", pixel_per_minute)
            .attr("width", timeline_width)
            .attr("fill", function(d) {
                var color = Math.floor((d.number_of_clicks * 255) / highest_numner_of_clicks_per_minute);
                return "rgb(" + 255 + ", " + (255 - color) + ", " + (255 - color) + ")";
            });



        // draw rectangles for activities
        svg.selectAll(".rect_class").remove();

        var blobs = svg.selectAll(".rect_class")
            .data(chunk_objects)
            .enter().append("rect")
            .attr("class", "rect_class")
            .attr("x", function(d) {
                var day = new Date(d.start_time-24*60*60*1000).getDay();
                return border_left + date_width + timeline_width + day * (full_width / 7);
            })
            .attr("y", function(d) {
                return pixel_per_minute * millisecondsToMinutes((d.start_time-32*60*60*1000) % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
            })
            .attr("height", function(d) {
                return durationToHeight(d.duration);
            })
            .attr("width", timeline_width)
            .attr("fill", function(d) {
                c = Math.min(d.duration/120.0, 1.0)
                return "rgb(" + parseInt(255-c*185) + "," + parseInt(255-125*c) + "," + parseInt(255-c*75) + ")";
            });


        // draw represnetative image for each activity
        svg.selectAll(".image_class").remove();

        var image_class = svg.selectAll("image_class")
            .data(chunk_objects)
            .enter().append("svg:image")
            .attr("class", "image_class")
            .attr("x", function(d) {
                var day = new Date(d.start_time-24*60*60*1000).getDay();
                return border_left + date_width + 2 * timeline_width + day * (full_width / 7);
            })
            .attr("y", function(d, i) {
                return pixel_per_minute * millisecondsToMinutes((d.start_time-32*60*60*1000) % minutesToMilliseconds(60 * 24)) + border_top + weekday_label_height;
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
            })
            .on("mouseover", function(){
                tooltip.style("visibility", "visible")
                var imgsrc = this.getAttribute("href")
                d3.select("#tooltip_image").attr("src", function(){ return imgsrc})
                var rect = this.getBoundingClientRect();
                tooltip.style("top", (rect.top + document.body.scrollTop)+"px").style("left",(rect.right+10)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});;

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

    $("#timeGranularity").slider({max:60},{min:5},{value:20},{step:5},{slide: function( event, ui ) {

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

    $("#numberApps").slider({max:5},{min:1},{value:4},{slide: function( event, ui ) {

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

    $("#appSimilarity").slider({max:1.0},{min:0.0},{value:0.5},{step:0.1},{slide: function( event, ui ) {

        app_similarity_ratio = ui.value;
        generateChunks();
        updateAll();

        document.getElementById('appSimilarityText').innerHTML = 'App Similarity: ' + ui.value;

    }});



    $('#myForm input').on('change', function() {
        deleteEverything();
        updateAll();
    });

    updateAll();

}
