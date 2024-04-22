class BookingSystem {
    constructor() {

        this.do_not_book_next_n_hours = 3 * 60

        const baseConfig = {start: "05:00", end: "23:00"}
        this.config = baseConfig

        this.loadConfig().then(config => {

            this.appointments = [];
            this.initDatepicker();
            this.updateSlots();

        }).catch(error => {
            console.error('Error loading configuration:', error);
        });

    }

    async loadConfig(){
        const response = await fetch('ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 
            },
            body: 'type=get_config' 
        });
        const result = await response.json()

        if(result.status == "success"){
            this.config = result.data.availability_config
            this.events_config = result.data.events_config
            this.default_padding = this.events_config["default"].padding

            this.calendars = result.data.calendars
            this.prep_calendars()

            cs(this.calendars)
        }
    }

    prep_calendars(){
        Object.entries(this.calendars).forEach(entry => {
            const [name, calendar] = entry;
            Object.entries(calendar).forEach(calendar_entry => {            
                const [key, value] = calendar_entry;
                this.calendars[name][key].start = Utils.timeToMinutes(value.start) - value.padding.before
                this.calendars[name][key].end   = Utils.timeToMinutes(value.end) + value.padding.after                
            });
        });

    }

    submitBooking() {

        let name_field = document.getElementById('name')
        if (!name_field.checkValidity()) {
            name_field.reportValidity();
            return;
        }
        let name = name_field.value;

        let email_field = document.getElementById('email')
        if (!email_field.checkValidity()) {
            email_field.reportValidity();
            return;
        }
        let email = email_field.value;

        let day = document.getElementById('day').value;
        let duration = document.getElementById('duration').value;
        let start = Utils.timeToMinutes(document.getElementById('start').value);
        let end = Utils.timeToMinutes(document.getElementById('end').value);
        let appointmentType = document.getElementById('appointment-type').value;

        if (!this.addEvent(new Day(day), start, end, name, email, appointmentType)) {
            alert("Slot Unavailable");
        } else {
            this.closeOverlay();
            this.updateSlots();
        }
    }

    async fetchAppointments() {
        const response = await fetch('ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 
            },
            body: 'type=get_appointments' 
        });

        const result = await response.json();

        if(result.status == 'success'){
            this.appointments = result.data.map(item => new TimeSlot(new Day(item.day), item.start, item.end, item.appointmentType));

        }
    }

    async addEvent(day, start, end, name, email, appointmentType) {
        const newSlot = new TimeSlot(day, start, end, appointmentType);
        if (this.slotAvailable(newSlot)) {
            const formData = new URLSearchParams();
            formData.append("type", "register_appointment");
            formData.append("day", newSlot.day.day);
            formData.append("start", newSlot.start); 
            formData.append("end", newSlot.end);
            formData.append("name", name);
            formData.append("email", email);
            formData.append("appointmentType", appointmentType);            

            const response = await fetch('ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                },
                body: formData
            });
            const data = await response.json();

            this.appointments.push(newSlot)
            return true;
        }
        return false;
    }

    slotAvailable(newSlot) {
        for (const event of this.appointments) {
            let padding = this.default_padding;
            if (this.events_config[event.appointmentType].padding) {
                padding = this.events_config[event.appointmentType].padding;
            }
    
            let event_start_with_padding = event.start - padding.before;
            let event_end_with_padding = parseInt(event.end) + padding.after;
    
            if (event.day.day === newSlot.day.day &&
                this.timesOverlap(event_start_with_padding, event_end_with_padding, newSlot.start, newSlot.end)) {
                return false;
            }
        }
    
        for (const [name, calendar] of Object.entries(this.calendars)) {
            for (const calendar_entry of calendar) {
                if (calendar_entry.day == newSlot.day.dow) {
                    if (this.timesOverlap(calendar_entry.start, calendar_entry.end, newSlot.start, newSlot.end)) {
                        return false;
                    }
                }
            }
        }
    
        return true;
    }
    

    timesOverlap(start1, end1, start2, end2) {
        
        let ans = !(end1 <= start2 || end2 <= start1);
        return ans
    }

    initDatepicker() {
        $("#datePicker").datepicker({
            dateFormat: "yy-mm-dd",
            minDate: new Date()

        }).datepicker("setDate", new Date());
    }

    async updateSlots() {
        const dateText = $("#datePicker").val();
        const duration = parseInt($("#durationSelect").val(), 10);
        if (dateText) {
            const day = new Day(dateText);

            await this.displayAvailableSlots(day, duration);
        } else {
            alert("Please select a date first.");
        }
    }

    async displayAvailableSlots(day, duration) {

        await this.fetchAppointments();

        document.getElementById("error-notification").textContent = "";

        const slotsContainer = document.getElementById("slotsContainer");
        slotsContainer.innerHTML = ""; // Clear previous slots

        const [start, end] = this.getDayAvailabilityRange(day);
        let currentTime = start;

        // bug here for next days...
        if(day.day == (new Day(new Date())).day){
            let now = new Date();
            let hours = now.getHours(); 
            currentTime = hours * 60 + this.do_not_book_next_n_hours; 
        }

        while (currentTime + duration <= end) {
            if (this.slotAvailable(new TimeSlot(day, currentTime, currentTime + duration, "default"))) {

                const slotElement = document.createElement('div');
                slotElement.className = 'slot';
                slotElement.textContent = `${Utils.minutesToTime(currentTime)} - ${Utils.minutesToTime(currentTime + duration)}`;
                // Using an IIFE (Immediately Invoked Function Expression) to create a closure
                slotElement.onclick = ((currentStartTime, currentEndTime) => {
                    return () => {
                        this.openOverlay(day, duration, currentStartTime, currentEndTime);
                    };
                })(currentTime, currentTime + duration);
                slotsContainer.appendChild(slotElement);
            }
            currentTime += duration;
        }

        if (slotsContainer.children.length === 0) {
            document.getElementById("error-notification").textContent = "No Available Slots On This Day";
        }
    }

    getDayAvailabilityRange(day) {

        let dayConfig = this.config.daily;

        if(this.config.weekend && day.isWeekend){
            dayConfig = this.config.weekend
        }

        if(this.config[day.dow]){
            dayConfig = this.config[day.dow]
        }

        if(this.config.custom[day.day]){
            dayConfig = this.config.custom[day.day]
        }

        // const baseConfig = {start: "05:00", end: "23:00"}; // Default hours
        // const dayConfig = day.isWeekend ? {start: "09:00", end: "23:00"} : baseConfig;
        return [Utils.timeToMinutes(dayConfig.start), Utils.timeToMinutes(dayConfig.end)];
    }

    openOverlay(day, duration, start, end) {

        document.getElementById("day").value = day.day;
        document.getElementById("duration").value = `${duration} minutes`;
        document.getElementById("start").value = Utils.minutesToTime(start);
        document.getElementById("end").value = Utils.minutesToTime(end);
        document.getElementById('overlay').style.display = 'flex';
    }

    closeOverlay() {
        document.getElementById('overlay').style.display = 'none';
    }

    // delete custom day config after the date has passed
    dispose_custom_config_from_past(){}

    // delete bookings from the past
    dispose_past_bookings(){}
}
