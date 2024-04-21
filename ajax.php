<?php


switch($_REQUEST["type"]){
    case "get_events":
        echo file_get_contents("events.json");
        break;
    case "update":
        file_put_contents("events.json", json_encode($_REQUEST['events']));        
        break;
}



// echo json_encode($_REQUEST);