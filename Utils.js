class Utils {

    static time_to_minutes(
        hour_time
    ){
        const [hour, minutes] = hour_time.split(":").map(Number)
        return (hour * 60) + minutes
    }
    static minutes_to_time(totalMinutes){
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Format hours and minutes to always be two digits
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
    }
}