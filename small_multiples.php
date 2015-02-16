<?php

// Adam Rule
// 2.11.2014
// Code copied from http://stackoverflow.com/questions/13595113

    //The directory that holds the images
    $dir = "data/screenshots";

    //This array will hold all the image addresses
    $result = array();

    //Get all the files in the specified directory
    $files = scandir($dir);

    //Add files to result array
    foreach($files as $file) {
        switch(ltrim(strstr($file, '.'), '.')) {
            case "jpg": case "jpeg":case "png":case "gif":
                $result[] = $dir . "/" . $file;
        }
    }

    //Convert the array into JSON
    $resultJson = json_encode($result);

    //Output the JSON object
    //This is what the AJAX request will see
    echo($resultJson);

?>
