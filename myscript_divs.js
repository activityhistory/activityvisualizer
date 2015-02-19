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
        //TODO check if chunk other than the first has 0 apps
        if(prev_top_apps.length == 0){
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
                //console.log(prev_top_apps)

                //update previous = current
                prev_start_time = i;
                prev_end_time = i + time_interval;
                prev_duration = millisecondsToMinutes(prev_end_time - prev_start_time);
                prev_top_apps = current_top_apps;
            }
        }
    }

}

var filtered_events = [];
var activities = [];
var chunk_objects = [];
var minutes_with_clicks = [];
var highest_numner_of_clicks_per_minute = 0;

var earliest_time = Date.parse(windowevent_times[0]);
var latest_time = Date.parse(windowevent_times[windowevent_times.length - 1]);

var past_event = -1;

// CONFIG
var time_interval = minutesToMilliseconds(20); // 60k milliseconds = 1 minute
var number_of_top_elements = 3;
var app_similarity_ratio = 1.0;

window.onload = function() {

    parseScreenshotNames();
    calculateClicksPerMinute();
    generateAbstraction();
    generateChunks();
    //tableCreate();
    drawD3();

};
