function parseScreenshotNames(){
    for (var i = 0; i < screenshots.length; i++){
        var object = {
            filename : screenshots[i],
            unix_time : Date.parse(screenshots[i].charAt(2)             //150206-221600413164_1021_601.jpg - > "02.06.2015 22:15:00")//month/day/year
            + screenshots[i].charAt(3)
            + "."
            + screenshots[i].charAt(4)
            + screenshots[i].charAt(5)
            + ".20"
            + screenshots[i].charAt(0)
            + screenshots[i].charAt(1)
            + " "
            + screenshots[i].charAt(7)
            + screenshots[i].charAt(8)
            + ":"
            + screenshots[i].charAt(9)
            + screenshots[i].charAt(10)
            + ":"
            + screenshots[i].charAt(11)
            + screenshots[i].charAt(12))

        };
        screenshot_times.push(object);
    }
}


function getActivityNameFromWindowId(id){
    var process_id = window_process_id[windowevent_window_ids[past_event]] - 1; // table is off by one
    var name = process_names[process_id];
    if (name == "Google Chrome" | name == "Safari"){
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
            windowevent_event_type[k] == "Close" &
            windowevent_window_ids[past_event] == windowevent_window_ids[k]) {
            pushEvent(activity_name, start_time, end_time, k);
            past_event = -1; // TODO in the very end push 2?
        }
    }
}


function pushEvent(activity_name, start_time, end_time, window_id){
    filtered_events_description.push(activity_name);
    filtered_events_start_time.push(start_time);
    filtered_events_end_time.push(end_time);
}


function inArray(array, id) {
    for(var i=0;i<array.length;i++) {
        if (array[i] == id){
            return i;
        }
    }
    return -1;
}


function getDurations(i){
    // looking through all entries in the abstraction
    for(var k = 0; k < filtered_events_description.length; k++){
        var start_time = Math.max.apply(null, [filtered_events_start_time[k], i]);
        var end_time = Math.min.apply(null, [filtered_events_end_time[k], i+time_interval]);
        var duration = end_time - start_time;
        if (duration > 0 && filtered_events_description[k] != "localhost" && filtered_events_description[k] != "NO_URL"){
            pushDuration(k, duration);
        } else if (filtered_events_start_time[k] > i+time_interval){
            break;
        }
    }
}


function pushDuration(k, duration){
    var id = inArray(activity_names, filtered_events_description[k]);
    if (id != -1){
        activity_durations[id] += duration;
    } else {
        activity_durations.push(duration);
        activity_names.push(filtered_events_description[k]);
    }
}


function findTop(){ // TODO order does not matter
    // find the top 3 apps. Self-implemented sorting. I hope there's no bug in it.
    var output = [];

    for (var j = 0; j < number_of_top_elements; j++) {
        var max = Math.max.apply(window, activity_durations);
        if (max > 0){
            var index = activity_durations.indexOf(max);
            output.push(activity_names[index]);
            activity_durations[index] = -1;
        } else {
            output.push(-1);
        }
    }

    return output;
}


function convertUnixTimeToHumanReadable(unix_time){
    var date = new Date(unix_time);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
}


function addTableTextCell(tr, text, classname, height){
    var td=document.createElement('td');
    //td.className = classname;
    //td.setAttribute("style", "height: " + height + "px;");
    td.appendChild(document.createTextNode(text));
    tr.appendChild(td);
}


function inArray2(array, el) {
    for ( var i = array.length; i--; ) {
        if ( array[i] === el ) return true;
    }
    return false;
}


function isEqArrays(arr1, arr2) {
    if ( arr1.length != arr2.length ) {
        return false;
    }
    for ( var i = arr1.length; i--; ) {
        if ( !inArray2( arr2, arr1[i] ) ) {
            return false;
        }
    }
    return true;
}


function addNewRowToTable(tbdy, chunkobject){
    var tr=document.createElement('tr');

    var start_time = convertUnixTimeToHumanReadable(chunkobject.start_time);
    var end_time = convertUnixTimeToHumanReadable(chunkobject.end_time);

    if (chunkobject.duration > 0){

        addTableTextCell(tr, start_time + " to " + end_time, "class_timestamp", 20);
        addTableTextCell(tr, "Minutes: " + chunkobject.duration, "class_duration", 20);

        for(var i = 0; i < number_of_top_elements; i++){
            if (chunkobject.items[i] != -1) {
                addTableTextCell(tr, chunkobject.items[i], "class_elements", chunkobject.duration * 1);
            }
        }

        tbdy.appendChild(tr);
    }
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


function tableCreate(){
    var body=document.getElementsByTagName('body')[0];
    var tbl=document.createElement('table');
    tbl.setAttribute('border','5');
    var tbdy=document.createElement('tbody');


    for (var i = 0; i < chunk_objects.length; i++){
        addNewRowToTable(tbdy, chunk_objects[i]);
    }

    tbl.appendChild(tbdy);
    body.appendChild(tbl)

}

function generateChunks(){

    chunk_objects = [];

    // slicing time and searching for every interval
    for(var i = earliest_time; i < latest_time; i += time_interval){

        // we only start with a new time_interval, if reset_start_time is set to 1
        if (reset_start_time == 1){
            interval_start_time = i;
            reset_start_time = 0;
        }

        activity_durations = [];
        activity_names = [];

        getDurations(i);

        var top = findTop();

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
            old_activity_durations = activity_durations;
            old_activity_names = activity_names;
        }
    }
    // run it one more time, so the last interval does not get lost
    var final_end_time = Math.min.apply(window, [(i + time_interval), latest_time]);
    var final_duration = (final_end_time - interval_start_time) / 60000; // 60000 milliseconds in a minute
    if (old_i != -1 && final_duration > 0){
        createChunkObjects(interval_start_time, final_end_time, top, final_duration);
    }

}

var filtered_events_description = [];
var filtered_events_start_time = [];
var filtered_events_end_time = [];

var activity_durations = [];
var activity_names = [];
var old_activity_durations = [];
var old_activity_names = [];

var chunk_objects = [];
var screenshot_times = [];

var earliest_time = Date.parse(windowevent_times[0]);
var latest_time = Date.parse(windowevent_times[windowevent_times.length - 1]);

var old_top = [];

var past_event = -1;
var reset_start_time = 1;
var interval_start_time = 0;
var old_interval_start_time = -1;
var old_i = -1;

// CONFIG
var time_interval = 120 * 60000; // 60k milliseconds = 1 minute
var number_of_top_elements = 3;

window.onload = function() {

    parseScreenshotNames();
    generateAbstraction();
    //generateChunks();
    //tableCreate();
    drawD3();

}