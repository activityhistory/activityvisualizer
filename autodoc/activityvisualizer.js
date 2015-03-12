// config browser side

var screenshot_path = 'data/screenshots/'; // To get the image from a server, this needs to be changed to the http address
// a few extra lines in the node server should be sufficient to make it serve the jpg files

var metadata_server = 'http://localhost:8002/';

// the following are the default values for the parameters that can be manipulated by the UI sliders

var time_interval = minutesToMilliseconds(20); // 60k milliseconds = 1 minute
var number_of_top_elements = 3;
var app_similarity_ratio = 0.5;

// config end

// initialize global variables

var click_times = [];
var process_names = [];
var process_ids = [];
var window_process_id = [];
var window_browser_url = [];
var windowevent_times = [];
var windowevent_window_ids = [];
var windowevent_event_type = [];
var screenshots = [];

var filtered_events = [];
var activities = [];
var chunk_objects = [];
var minutes_with_clicks = [];
var highest_numner_of_clicks_per_minute = 0;

var milliseconds_in_full_day = 24 * 60 * 60 * 1000;

var past_event = -1;

var earliest_time = 0;
var latest_time = 0;
var maximum_time = 0;

/**
 * Takes an ID of an Window Event and returns the name of the application the event belongs to. If this is either
 * Chrome or Safari, it will return the URL of the tab in focus.
 * @param id
 * @returns {*}
 */
function getActivityNameFromWindowId(id){
    var process_id = window_process_id[windowevent_window_ids[id]] - 1; // table is off by one
    var name = process_names[process_id];
    if (name == "Google Chrome" || name == "Safari"){
        // get hostname from url
        var getLocation = function(href) {
            var l = document.createElement("a");
            l.href = href;
            return l;
        };
        var l = getLocation(window_browser_url[windowevent_window_ids[id]]);
        return l.hostname;
    } else {
        return name;
    }
}

/**
 * This creates an array that counts how many clicks there have been in each Minute of the time interval at hand.
 */
function calculateClicksPerMinute(){
    for (var i = earliest_time; i < latest_time; i += minutesToMilliseconds(1)){
        var minute_click_object = {
            minute_start_time : i,
            number_of_clicks : 0
        };
        minutes_with_clicks.push(minute_click_object);
    }

    for (var k = 0; k < click_times.length; k++) {
        var time = Date.parse(click_times[k]);
        for (var j = 0; j < minutes_with_clicks.length; j++){
            if (time < minutes_with_clicks[j].minute_start_time){
                minutes_with_clicks[j].number_of_clicks++;
                break;
            }
        }
    }

    $.each(minutes_with_clicks, function(key, element) {

        if (element.number_of_clicks > highest_numner_of_clicks_per_minute) highest_numner_of_clicks_per_minute = element.number_of_clicks;

    });
}


// generating an abstraction of the activities in time
// TODO This algorithms understands periods of inactivity (e.g. nights) as long periods of the last active activity. This is bad.
/**
 * Looks at all the window events and creates a new datastructure that contains explicitly what was the application
 * in focus from when to when.
 */
function generateAbstraction(){
    for (var k = 0; k < windowevent_window_ids.length; k++) {
        var activity_name = getActivityNameFromWindowId(k);
        var start_time = Date.parse(windowevent_times[past_event]);
        var end_time = Date.parse(windowevent_times[k]);
        // 1 : We find an 'Active' Event
        if (windowevent_event_type[k] == "Active") {
            // 1.a : and we had an active event before
            if (past_event != -1) {
                pushEvent(activity_name, start_time, end_time, k);
            }
            past_event = k;
            // 2 : We have a 'Close' Event and before that an 'Active' Event with the same process id
        } else if (past_event != -1 &
            windowevent_event_type[k] == "Close" &&
            windowevent_window_ids[past_event] == windowevent_window_ids[k]) {
            pushEvent(activity_name, start_time, end_time, k);
            past_event = -1;
        }
    }
}

/**
 * This creates the actual objects and adds to the data structure that gets created by generateAbstraction().
 * @param activity_name
 * @param start_time
 * @param end_time
 */
function pushEvent(activity_name, start_time, end_time){
    var filtered_events_object = {
        description : activity_name,
        start_time : start_time,
        end_time : end_time
    };

    filtered_events.push(filtered_events_object);

}

/**
 * Looks at chunks of time and sums up the durations for each application or URLs.
 * @param i
 */
function getDurationsForGivenInterval(i){
    // looking through all entries in the abstraction
    for(var k = 0; k < filtered_events.length; k++){
        var start_time = Math.max.apply(null, [filtered_events[k].start_time, i]);
        var end_time = Math.min.apply(null, [filtered_events[k].end_time, i+time_interval]);
        var duration = end_time - start_time;
        if (duration > 0 && filtered_events[k].description != "localhost" && filtered_events[k].description != "NO_URL"){ //TODO maybe not the best place to filter
            pushDuration(k, duration);
        } else if (filtered_events[k].start_time > i+time_interval){
            break;
        }
    }
}

/**
 * Creates the actual object and adds to datastructure created by getDurationsForGivenInterval().
 * @param k
 * @param duration
 */
function pushDuration(k, duration){
    var id = inArray(activities, filtered_events[k].description);
    if (id != -1){
        activities[id].duration += duration;
    } else {
        var activity_object = {
            duration : duration,
            name : filtered_events[k].description
        };
        activities.push(activity_object);
    }
}

/**
 * Sorts the durations of activities in given time and returns the most used apps.
 * @returns {Array.<T>}
 */
function findNMostUsedActivities(){
    return activities.sort(function (a, b){ return b.duration - a.duration; }).slice(0,number_of_top_elements);
}

/**
 * Creates the objects that are used by d3 for visualisation.
 * @param interval_start_time
 * @param end_time
 * @param items
 * @param duration
 */
function createChunkObjects(interval_start_time, end_time, items, duration){
    var chunkobject = {
        start_time : interval_start_time,
        end_time : end_time,
        duration : duration,
        items : items
    };
    chunk_objects.push(chunkobject);
}

/**
 * This contains the main logic. It slices the time up and analyzes the individual slices. The results
 * are so-called chunk-objects for every slice.
 */
function generateChunks(){
    chunk_objects = [];

    var prev_top_apps = [];
    var prev_start_time = 0;
    var prev_end_time = 0;
    var prev_duration = 0;
    var first_similar = 1;

    for(var i = earliest_time; i < latest_time; i+= time_interval){

        activities = [];
        getDurationsForGivenInterval(i);
        var current_top_apps = findNMostUsedActivities();

        // if the first chunk
        if(i == earliest_time){
            prev_top_apps = current_top_apps;
            prev_start_time = i;
            prev_end_time = i + time_interval;
            prev_duration = millisecondsToMinutes(prev_end_time - prev_start_time);
        }

        // if the last chunk
        else if( i + time_interval >= latest_time ){
            if(isSimilarArrays(prev_top_apps, current_top_apps)){
                // update previous
                prev_end_time = latest_time;
                prev_duration = millisecondsToMinutes(latest_time - prev_start_time);

                //write previous
                createChunkObjects(prev_start_time, prev_end_time, prev_top_apps, prev_duration);
            }
            else{
                //write previous
                createChunkObjects(prev_start_time, prev_end_time, prev_top_apps, prev_duration);

                //write current
                createChunkObjects(i, latest_time, current_top_apps, millisecondsToMinutes(latest_time - i));
            }
        }

        // if any intermediate chunk
        else{
            if(isSimilarArrays(prev_top_apps, current_top_apps) && first_similar == 1){
                first_similar = 0;
                //update previous
                prev_end_time = i + time_interval;
                prev_duration = millisecondsToMinutes(prev_end_time - prev_start_time);
                prev_top_apps = getEqualItems(prev_top_apps, current_top_apps);
            }
            else if (isSimilarArrays(prev_top_apps, current_top_apps) && first_similar == 0){
                first_similar = 0;
                //update previous
                prev_end_time = i + time_interval;
                prev_duration = millisecondsToMinutes(prev_end_time - prev_start_time);
            }
            else{
                first_similar = 1;
                //write previous
                createChunkObjects(prev_start_time, prev_end_time, prev_top_apps, prev_duration);

                //update previous = current
                prev_start_time = i;
                prev_end_time = i + time_interval;
                prev_duration = millisecondsToMinutes(prev_end_time - prev_start_time);
                prev_top_apps = current_top_apps;
            }
        }
    }

}

/**
 * Facilitates the communication with the server. Here all the metadata es queried at startup and than analyzed
 * browser-side.
 */
function queryMetadataFromServer(){

    function httpGet(theUrl)
    {
        var xmlHttp = null;

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false );
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    var servers_resonse = httpGet(metadata_server);
    var servers_response_object = JSON.parse(servers_resonse);

    click_times = servers_response_object['clicks'];
    process_names = servers_response_object['process_names'];
    process_ids = servers_response_object['process_ids'];
    window_process_id = servers_response_object['window_process_id'];
    window_browser_url = servers_response_object['window_browser_url'];
    windowevent_times = servers_response_object['windowevent_times'];
    windowevent_window_ids = servers_response_object['windowevent_window_ids'];
    windowevent_event_type = servers_response_object['windowevent_event_type'];

    screenshots = servers_response_object['filenames'];

    earliest_time = Date.parse(windowevent_times[0]);
    latest_time = Date.parse(windowevent_times[windowevent_times.length - 1]);
    maximum_time = latest_time;

    if (latest_time - earliest_time > milliseconds_in_full_day){
        latest_time = earliest_time + milliseconds_in_full_day;
    }

}

/**
 * Main function that calls all other functions.
 */
window.onload = function() {

    document.getElementById('dateRangeText').innerHTML = new Date(earliest_time).toLocaleTimeString() + ' to ' + new Date(latest_time).toLocaleTimeString();

    queryMetadataFromServer();
    parseScreenshotNames();
    calculateClicksPerMinute();
    generateAbstraction();
    generateChunks();
    //tableCreate(); // Outputs data as a table instead of a d3 visualisation. For debugging purposes.
    drawD3();

};
