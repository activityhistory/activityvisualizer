var dbFileElm=document.getElementById("dbfile"),SQL=window.SQL;db=new SQL.Database;var workerPath="../bower_components/sql.js/js/worker.sql.js",worker=new Worker(workerPath);dbFileElm.onchange=function(){var e=dbFileElm.files[0],r=new FileReader;r.onload=function(){var e=new Uint8Array(r.result);db=new SQL.Database(e)},r.readAsArrayBuffer(e);var a=db.exec("SELECT * FROM process");$("#dbfile").val(a)};