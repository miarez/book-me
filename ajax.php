<?php



header('Content-Type: application/json');

$appointments_file = "data/bookings.json";



    

try {
    if(!isset($_POST["type"])){
        echo json_encode(["status" => "error", "message" => "Request Type Not Provided"]);
        exit;
    }
    
    
    function validateDate($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }
 
    switch($_POST["type"]){
        case "get_config":
            $response = file_get_contents("data/config.json");
            if(!empty($response)){
                $decoded = json_decode($response, true);
                if(!is_array($decoded)){
                    echo json_encode(["status" => "error", "message" => "Failed To Config Details"]);                    
                    exit;
                }
            }
            
            $events_config = json_decode(file_get_contents("data/event_config.json"), true);
            if(!is_array($events_config)){
                echo json_encode(["status" => "error", "message" => "Failed To Load Event Details"]);
                exit;
            }

            $calendars = json_decode(file_get_contents("data/calendars.json"), true);
            if(!is_array($events_config)){
                echo json_encode(["status" => "error", "message" => "Failed To Load Calendars"]);
                exit;
            }

            echo json_encode(["status" => "success", "data" => ["availability_config" => $decoded, "events_config" => $events_config, "calendars" => $calendars]]);
            exit;
        case "get_appointments":
            $response = file_get_contents($appointments_file);
            if(!empty($response)){
                $decoded = json_decode($response, true);
                if(is_array($decoded)){
                    echo json_encode(["status" => "success", "data" => $decoded]);
                    exit;
                }
            }
            break;
        case "register_appointment":


            $events_config = json_decode(file_get_contents("data/event_config.json"), true);
            if(!is_array($events_config)){
                echo json_encode(["status" => "error", "message" => "Failed To Load Event Details"]);
                exit;
            }

            $event_config = $events_config[$_POST["appointmentType"]];
            if(!is_array($event_config)){
                $event_config = $event_config["default"];
            }






            $appointments = [];
            $decoded = json_decode(file_get_contents($appointments_file), true);
            if(is_array($decoded)){
                $appointments = $decoded;
            }

        
            if(!validateDate($_POST["day"])){
                echo json_encode(["status" => "error", "message" => "Day Invalid"]);
                exit;
            }
            if(
                !is_numeric($_POST["start"]) 
                    ||
                    $_POST["start"] < 300 
                    ||
                    $_POST["start"] > 1440                 
            ){
                echo json_encode(["status" => "error", "message" => "Start Invalid"]);
                exit;
            }
    
            if(
                !is_numeric($_POST["end"])
                    ||
                    $_POST["end"] < 300 
                    ||
                    $_POST["end"] > 1440                             
            ){
                echo json_encode(["status" => "error", "message" => "End Invalid"]);
                exit;
            }

            if(
                !isset($_POST["name"])
            ){
                echo json_encode(["status" => "error", "message" => "Name Invalid"]);
                exit;
            }
            if(
                !isset($_POST["email"])
            ){
                echo json_encode(["status" => "error", "message" => "Email Invalid"]);
                exit;
            }
            if(
                !isset($_POST["appointmentType"])
            ){
                echo json_encode(["status" => "error", "message" => "appointmentType Invalid"]);
                exit;
            }
    
            $appointment = [
                "day"               => shitty_sanitize($_POST["day"]),
                "start"             => shitty_sanitize($_POST["start"]),
                "end"               => shitty_sanitize($_POST["end"]),
                "name"              => shitty_sanitize($_POST["name"]),
                "email"             => shitty_sanitize($_POST["email"]),
                "appointmentType"   => shitty_sanitize($_POST["appointmentType"]), 
                "padding"           => $event_config["padding"]
            ];
            array_push($appointments, $appointment);        
            if(file_put_contents($appointments_file, json_encode($appointments))){
                echo json_encode(["status" => "success", "message" => "Inserted Booking"]);
                exit;
            }
            echo json_encode(["status" => "error", "message" => "Unknown Type Provided"]);
            exit;
            
    }    

} catch (Error $e){    
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}




echo json_encode(["error" => true, "message" => "Unknown Type Provided"]);
exit;

function shitty_sanitize($item){
    return htmlspecialchars(strip_tags($item));
}
