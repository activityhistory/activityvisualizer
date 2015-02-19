var screenshot_times = [];

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


function convertUnixTimeToHumanReadable(unix_time){
    var date = new Date(unix_time);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(minutes.length-2) + ':' + seconds.substr(seconds.length-2);
}



function inArray(array, id) { //TODO probably don't need two inArray functions
    for(var i=0;i<array.length;i++) {
        if (array[i].name == id){
            return i;
        }
    }
    return -1;
}


function inArray2(array, el) { //TODO not very nice
    for ( var i = array.length; i--; ) {
        if ( array[i].name === el ) return true;
    }
    return false;
}


function isSimilarArrays(arr1, arr2) { //TODO not very nice
    //if ( arr1.length != arr2.length ) {
    //    return false;
    //}
    var number_of_different_elements = 0;
    var number_of_same_elements = 0;
    for ( var i = arr1.length; i--; ) {
        if ( !inArray2( arr2, arr1[i].name ) ) {
            number_of_different_elements++;
        } else {
            number_of_same_elements++;
        }
    }
    return number_of_same_elements / (number_of_same_elements + number_of_different_elements) >= app_similarity_ratio;

}


function getEqualItems(a, b){

    var t;
    if (b.length > a.length) {
        t = b;
        b = a;
        a = t;
    } // indexOf to loop over shorter
    return a.filter(function (e) {
        for (var i = 0; i < b.length; i++){
            if (b[i].name === e.name) {
                return true;
            }
        }
        return false;
    });

}


function millisecondsToMinutes(x){
    return x / 60000
}


function minutesToMilliseconds(x){
    return x * 60000
}