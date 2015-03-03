function durationToRadius(duration){
        return Math.pow(duration, 1/2) / 4.0;
    }

function updateAllDayView(svg, border_left, border_top, date_width, image_width, h_day, image_height, blob_scaling_factor, blob_width){

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