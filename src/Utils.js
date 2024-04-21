
class Utils {
    static timeToMinutes(time) {
        const [hour, minutes] = time.split(":").map(Number);
        return (hour * 60) + minutes;
    }

    static minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}