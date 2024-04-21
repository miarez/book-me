class Day {
    constructor(
        day
    ){
        this.date = new Date(day);
        this.day = this.date.toISOString().split('T')[0]
        this.dow = day_mapping[this.date.getDay()]
        this.is_weekend = (["Saturday", "Sunday"].includes(this.dow))
    }
    
}
