
class Day {
    constructor(date) {
        const dayDate = new Date(date);
        this.day = dayDate.toISOString().split('T')[0];
        this.dow = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayDate.getDay()];
        this.isWeekend = ["Saturday", "Sunday"].includes(this.dow);
    }
}