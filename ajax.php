<?php



header('Content-Type: application/json');

$appointments_file = "data/appointments.json";
    

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
    
            $appointment = [
                "day"   => $_POST["day"],
                "start" => $_POST["start"],
                "end"   => $_POST["end"],            
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