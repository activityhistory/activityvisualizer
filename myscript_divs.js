function getActivityNameFromWindowId(){
    var process_id = window_process_id[windowevent_window_ids[past_event]] - 1; // table is off by one
    var name = process_names[process_id];
    if (name == "Google Chrome" || name == "Safari"){
        // get hostname from url
        var getLocation = function(href) {
            var l = document.createElement("a");
            l.href = href;
            return l;
        };
        var l = getLocation(window_browser_url[windowevent_window_ids[past_event]]);
        return l.hostname;
    } else {
        return name;
    }
}


// generating an abstraction of the activities in time
// TODO This algorithms understands periods of inactivity (e.g. nights) as long periods of the last active activity. This is bad.
function generateAbstraction(){
    for (var k = 0; k < windowevent_window_ids.length; k++) {
        var activity_name = getActivityNameFromWindowId(past_event);
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


function pushEvent(activity_name, start_time, end_time){
    var filtered_events_object = {
        description : activity_name,
        start_time : start_time,
        end_time : end_time
    };

    filtered_events.push(filtered_events_object);

}


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


function findNMostUsedActivities(){
    return activities.sort(function (a, b){ return b.duration - a.duration; }).slice(0,number_of_top_elements);
}


function createChunkObjects(interval_start_time, end_time, items, duration){
    var chunkobject = {
        start_time : interval_start_time,
        end_time : end_time,
        duration : duration,
        items : items
    };

    chunk_objects.push(chunkobject);
}

function generateChunks(){

    chunk_objects = [];
    var top = [];

    // slicing time and searching for every interval
    for(var i = earliest_time; i < latest_time; i += time_interval){

        // we only start with a new time_interval, if reset_start_time is set to 1
        if (reset_start_time == 1){
            interval_start_time = i;
            reset_start_time = 0;
        }

        activities = [];

        getDurationsForGivenInterval(i);

        top = findNMostUsedActivities();

        // if anything has changed compared to the last table entry, then it's time for a new one!
        if (isEqArrays(top, old_top) == false){
            // things have changed, so we will start a new interval
            reset_start_time = 1;

            var end_time = Math.min.apply(window, [(old_i + time_interval), latest_time]);
            var duration = (end_time - old_interval_start_time) / 60000; // 60000 milliseconds in a minute
            if (old_i != -1 && duration > 0){
                createChunkObjects(old_interval_start_time, end_time, old_top, duration);
            }
            old_interval_start_time = interval_start_time;
            old_i = i;
            old_top = top;
            old_activities = activities;
        }
    }
    // run it one more time, so the last interval does not get lost
    var final_end_time = Math.min.apply(window, [(i + time_interval), latest_time]);
    var final_duration = (final_end_time - interval_start_time) / 60000; // 60000 milliseconds in a minute
    if (old_i != -1 && final_duration > 0){
        createChunkObjects(interval_start_time, final_end_time, top, final_duration);
    }

}

var filtered_events = [];
var activities = [];
var old_activities = [];
var chunk_objects = [];

var earliest_time = Date.parse(windowevent_times[0]);
var latest_time = Date.parse(windowevent_times[windowevent_times.length - 1]);

var old_top = [];

var past_event = -1;
var reset_start_time = 1;
var interval_start_time = 0;
var old_interval_start_time = -1;
var old_i = -1;

// CONFIG
var time_interval = 10 * 60000; // 60k milliseconds = 1 minute
var number_of_top_elements = 1;

window.onload = function() {

    parseScreenshotNames();
    generateAbstraction();
    //generateChunks();
    //tableCreate();
    drawD3();

};