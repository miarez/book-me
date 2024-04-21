<?php

function validateDate($date, $format = 'Y-m-d')
{
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

$appointments_file = "appointments.json";

switch($_REQUEST["type"]){
    case "get_appointments":
        echo file_get_contents($appointments_file);
        break;
    case "register_appointment":


        $appointments = json_decode(file_get_contents($appointments_file), true);

        $raw_appointment = $_REQUEST["appointment"];

        $appointment = [];
        if(!validateDate($raw_appointment["day"])){
            echo json_encode(["error" => true]);
            exit;
        }
        if(
            !is_numeric($raw_appointment["start"]) 
                ||
            $raw_appointment["start"] < 300 
                ||
            $raw_appointment["start"] > 1440                 
        ){
            echo json_encode(["error" => true]);
            exit;
        }

        if(
            !is_numeric($raw_appointment["end"])
                ||
            $raw_appointment["end"] < 300 
                ||
            $raw_appointment["end"] > 1440                             
        ){
            echo json_encode(["error" => true]);
            exit;
        }

        $appointment = [
            "day"   => $raw_appointment["day"],
            "start" => $raw_appointment["start"],
            "end"   => $raw_appointment["end"],            
        ];


        array_push($appointments, $appointment);
        
        echo file_put_contents($appointments_file, json_encode($appointments));        
        break;
}



// echo json_encode($_REQUEST);