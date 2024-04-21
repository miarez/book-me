class Day {
    constructor(
        day
    ){
        let date = new Date(day);
        this.day = date.toISOString().split('T')[0]
        this.dow = day_mapping[date.getDay()]
        this.is_weekend = (["Saturday", "Sunday"].includes(this.dow))
    }    
}
