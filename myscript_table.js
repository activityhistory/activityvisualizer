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


function findTop3(){ // TODO order does not matter
	// find the top 3 apps. Self-implemented sorting. I hope there's no bug in it.
	var highest_1 = -1;
	var highest_2 = -1;
	var highest_3 = -1;
	
	for (var j = 0; j <= activity_durations.length; j++) {
		if ((highest_3 == -1 | activity_durations[j] > activity_durations[highest_3]) 
				& activity_durations[j] > 0){
			if (highest_2 == -1 
				| activity_durations[j] > activity_durations[highest_2]){
				if (highest_1 == -1 
					| activity_durations[j] > activity_durations[highest_1]){
					highest_3 = highest_2;
					highest_2 = highest_1;
					highest_1 = j;
				} else {
					highest_3 = highest_2;
					highest_2 = j;
				}
			}  else {
					highest_3 = j;
			}
		}
	}
	return [highest_1, highest_2, highest_3]
}


function convertUnixTimeToHumanReadable(unix_time){
	var date = new Date(unix_time);
	var hours = date.getHours();
	var minutes = "0" + date.getMinutes();
	var seconds = "0" + date.getSeconds();
	return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
}


function addTableTextCell(tr, text){
	var td=document.createElement('td');
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
  if ( arr1.length !== arr2.length ) {
    return false;
  }
  for ( var i = arr1.length; i--; ) {
    if ( !inArray2( arr2, arr1[i] ) ) {
      return false;
    }
  }
  return true;
}


function addNewRowToTable(tbdy, interval_start_time, i, time_interval, items){
	var tr=document.createElement('tr');

	var start_time = convertUnixTimeToHumanReadable(interval_start_time);
	var end_time = convertUnixTimeToHumanReadable(i + time_interval);
	var duration = ((i + time_interval) - interval_start_time) / 60000; // 60000 milliseconds in a minute

	addTableTextCell(tr, start_time + " to " + end_time);
	addTableTextCell(tr, "Minutes: " + duration);

	if (items[0] != -1) {
		addTableTextCell(tr, old_activity_names[items[0]]);
	}
	if (items[1] != -1) {
		addTableTextCell(tr, old_activity_names[items[1]]);
	}
	if (items[2] != -1) {
		addTableTextCell(tr, old_activity_names[items[2]]);
	} // TODO do smarter

	tbdy.appendChild(tr);
}


function tableCreate(){
	var body=document.getElementsByTagName('body')[0];
	var tbl=document.createElement('table');
	//tbl.style.width='100%';
	tbl.setAttribute('border','5');
	var tbdy=document.createElement('tbody');
	
	// slicing time and searching for every interval
	for(var i = earliest_time; i < latest_time; i  += time_interval){
    	
		// we only start with a new time_interval, if reset_start_time is set to 1
		if (reset_start_time == 1){
			interval_start_time = i;
			reset_start_time = 0;
		}
		
		activity_durations = [];
		activity_names = [];
		
		getDurations(i);
		
		var top3 = findTop3();
		// if anything has changed compared to the last table entry, then it's time for a new one!
		if (isEqArrays(old_top3, top3) == false){
			// things have changed, so we will start a new interval
			reset_start_time = 1;
			
			if (old_i != -1){
				addNewRowToTable(tbdy, old_interval_start_time, old_i, time_interval, old_top3);
			}
			old_interval_start_time = interval_start_time;
			old_i = i;
			old_top3 = top3;
			old_activity_durations = activity_durations;
			old_activity_names = activity_names;
		}
	}
	// run it one more time, so the last interval does not get lost
	addNewRowToTable(tbdy, interval_start_time, i, time_interval, top3);
	
	tbl.appendChild(tbdy);
	body.appendChild(tbl)
}


var filtered_events_description = [];
var filtered_events_start_time = [];
var filtered_events_end_time = [];

var activity_durations = [];
var activity_names = [];
var old_activity_durations = [];
var old_activity_names = [];

var earliest_time = Date.parse(windowevent_times[0]);
var latest_time = Date.parse(windowevent_times[windowevent_times.length - 1]);

var old_top3 = [];

var past_event = -1;
var reset_start_time = 1;
var interval_start_time = 0;
var old_interval_start_time = -1;
var old_i = -1;
var time_interval = 5 * 60000; // 60k milliseconds = 1 minute

window.onload = function() {
	
	generateAbstraction();
	tableCreate();

}