/**
 * This is the main function facilitating the d3 visualization. The individual views are called here but live in
 * individual files.
 */
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

    //var tooltip = d3.select("body") // TODO tooltips not appearing to work
    //    .append("div")
    //    .attr("id", "tooltip");
    //
    //tooltip.append('p')
    //    .text("Hello")
    //    .attr("id","tooltip_text");
    //
    //tooltip.append("img")
    //        .attr("src", "benchmark.png")
    //        .attr("id", "tooltip_image");

    /**
     * Remove the entire SVG and create a new blank one.
     */
    function deleteEverything(){

        svg.remove();

        //Create SVG element
        svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h_day);
    }

    /**
     * Depening on what view is selected, call the according function to paint it.
     */
    function updateAll(){

        if ($('input[name=radio]:checked', '#myForm').val() == "dayview"){
            updateAllDayView(svg, border_left, border_top, date_width, image_width, h_day, image_height, blob_scaling_factor, blob_width);
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "weekview"){
            updateAllWeekView(svg, h_week, border_left, pixel_per_minute, border_top, weekday_label_height, date_width, timeline_width, full_width, image_width);
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "activity_level"){
            updateAllActivityLevelView(svg, h_week, border_left, pixel_per_minute, border_top, weekday_label_height, date_width, timeline_width, full_width, image_width);
        }
        if ($('input[name=radio]:checked', '#myForm').val() == "small_multiples"){
            window.location.href = "small_multiples.html";
        }

    }

    $("#timeGranularity").slider({max:360},{min:5},{value:20},{step:5},{slide: function( event, ui ) {

        time_interval = minutesToMilliseconds(ui.value);

        generateChunks();
        updateAll();

        document.getElementById('timeGranularityText').innerHTML = 'Time Granularity: ' + ui.value;

    }});

    $("#numberApps").slider({max:5},{min:1},{value:4},{slide: function( event, ui ) {

        number_of_top_elements = ui.value;
        generateChunks();
        updateAll();

        document.getElementById('numberAppsText').innerHTML = 'Number of Apps: ' + ui.value;

    }});

    $("#dateRange").slider({ max: maximum_time },{min:earliest_time},{values: [earliest_time, latest_time]},{slide: function( event, ui ) {

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
