function updateAllWeekView(svg, h_week, border_left, pixel_per_minute, border_top, weekday_label_height, date_width, timeline_width, full_width, image_width){

    var trimmed_chunk_objects = [];
    now = new Date().getTime();
    last_week = now - 7*24*60*60*1000;


    for(i=0; i<chunk_objects.length; i++){
        if (chunk_objects[i]["start_time"] > last_week){
            trimmed_chunk_objects.push(chunk_objects[i])
        }
    }

    svg.attr("height", h_week);

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
            var day = new Date(d.minute_start_time-24*60*60*1000).getDay(); // TODO find general solution
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
        .data(trimmed_chunk_objects)
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
            c = Math.min(d.duration/120.0, 1.0);
            return "rgb(" + parseInt(255-c*185) + "," + parseInt(255-125*c) + "," + parseInt(255-c*75) + ")";
        });


    // draw represnetative image for each activity
    svg.selectAll(".image_class").remove();

    var image_class = svg.selectAll("image_class")
        .data(trimmed_chunk_objects)
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
            tooltip.style("visibility", "visible");
            var imgsrc = this.getAttribute("href");
            d3.select("#tooltip_image").attr("src", function(){ return imgsrc});
            imgsrc = imgsrc.split("/").pop()
            d3.select("#tooltip_text").text( function(){ return imgsrc.substring(2,4) + "/" + imgsrc.substring(4,6) + "/" + imgsrc.substring(0,2) + " - " + imgsrc.substring(7,9) + ":" + imgsrc.substring(9,11) });
            var rect = this.getBoundingClientRect();
            tooltip.style("top", (rect.top + document.body.scrollTop)+"px").style("left",(rect.right+10)+"px");
        })
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

}