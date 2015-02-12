function addTableTextCell(tr, text){
    var td=document.createElement('td');
    td.appendChild(document.createTextNode(text));
    tr.appendChild(td);
}


function addNewRowToTable(tbdy, chunkobject){
    var tr=document.createElement('tr');

    var start_time = convertUnixTimeToHumanReadable(chunkobject.start_time);
    var end_time = convertUnixTimeToHumanReadable(chunkobject.end_time);

    if (chunkobject.duration > 0){

        addTableTextCell(tr, start_time + " to " + end_time, "class_timestamp", 20);
        addTableTextCell(tr, "Minutes: " + chunkobject.duration, "class_duration", 20);

        for(var i = 0; i < chunkobject.items.length; i++){
                addTableTextCell(tr, chunkobject.items[i].name, "class_elements", chunkobject.duration);
        }

        tbdy.appendChild(tr);
    }
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