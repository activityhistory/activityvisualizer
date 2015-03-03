function drawD3(){

    //Width and height
    var w = 1500;
    var h_week = 630;
    var h_day = 5000;

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
        .attr("height", h_day);

    var tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip");

    tooltip.append('p')
        .text("Hello")
        .attr("id","tooltip_text");

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

        svg.attr("height", h_day);

        reverse_chunk_objects = chunk_objects.reverse();

        // draw activity circles
        svg.selectAll(".activityCircles").remove();

        var circles = svg.selectAll("circle")
            .data(reverse_chunk_objects)
            .enter().append("circle")
            .attr("class", "activityCircles")
            .attr("cx", border_left + date_width)
            .attr("cy", function(d, i) { return image_height * i + border_top + 50; })
            .attr("r", function(d) { return blob_scaling_factor * durationToRadius(d.duration); });


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
                var date = new Date(d.start_time);
                date_adj = new Date(d.start_time + 16*60*60*1000) ;

                var weekday = [];
                weekday[0] = "Sun";
                weekday[1] = "Mon";
                weekday[2] = "Tue";
                weekday[3] = "Wed";
                weekday[4] = "Thur";
                weekday[5] = "Fri";
                weekday[6] = "Sat";

                var n = weekday[date_adj.getUTCDay()];

                split_string = date.toLocaleTimeString().split(":");
                trimmed_time =  split_string[0] + ":" + split_string[1] + " " + split_string[2].substring(3,5);
                return n + " " + trimmed_time
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
                imgs_in_interval = [];
                for (var j = 0; j < screenshot_times.length; j++){
                    if (screenshot_times[j].unix_time >= d.start_time && screenshot_times[j].unix_time <= d.end_time){
                        imgs_in_interval.push(j)
                    }
                }
                if (imgs_in_interval.length > 0){
                    k = parseInt(imgs_in_interval.length/2);
                    return "data/screenshots/" + screenshot_times[imgs_in_interval[k]].filename;
                }
                return "benchmark.png";
            })
            .on("mouseover", function(){
                tooltip.style("visibility", "visible");
                var imgsrc = this.getAttribute("href");
                d3.select("#tooltip_image").attr("src", function(){ return imgsrc});
                imgsrc = imgsrc.split("/").pop();
                d3.select("#tooltip_text").text( function(){ return imgsrc.substring(2,4) + "/" + imgsrc.substring(4,6) + "/" + imgsrc.substring(0,2) + " - " + imgsrc.substring(7,9) + ":" + imgsrc.substring(9,11) });
                var rect = this.getBoundingClientRect();
                tooltip.style("top", (rect.top + document.body.scrollTop)+"px").style("left",(rect.right+10)+"px");
            })
            .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    }




    function deleteEverything(){

        svg.remove();

        //Create SVG element
        svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h_day);
    }

    function updateAll(){

        if ($('input[name=radio]:checked', '#myForm').val() == "dayview"){
            updateAllDayView();
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "weekview"){
            updateAllWeekView(svg, h_week, border_left, pixel_per_minute, border_top, weekday_label_height, date_width, timeline_width, full_width, image_width);
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
