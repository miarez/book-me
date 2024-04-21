

class BookMe {

    day_mapping = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    HOUR_CONFIG = {
        "daily" : {
            "start" : "05:00",
            "end"   : "23:00",
        },
        "weekend" : {
            "start" : "09:00",
            "end"   : "23:00",
        },
        "Saturday" : {
            "start" : "10:00",
            "end"   : "11:00",
        },
    }

    DATE_BASED_HOUR_CONFIG = {
        "2024-04-22" : {
            "start" : "10:30",
            "end"   : "11:00",
        }
    }

        
    get_day_availability(
        day
    ){

        cs(this.HOUR_CONFIG)

        // let config = HOUR_CONFIG.daily;

        // if(HOUR_CONFIG.weekend && day.is_weekend){
        //     config = HOUR_CONFIG.weekend;
        // }
        // if(HOUR_CONFIG[day.dow]){
        //     config = HOUR_CONFIG[day.dow];                    
        // }
        
        // if(DATE_BASED_HOUR_CONFIG[day.day]){
        //     config = DATE_BASED_HOUR_CONFIG[day.day];                    
        // }

        // return {
        //     "start" : Utils.time_to_minutes(config.start),
        //     "end"   : Utils.time_to_minutes(config.end),                    
        // };
    }



}