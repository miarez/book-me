class BookingSystem {
    constructor() {
        this.appointments = [];
        this.initDatepicker();
        this.updateSlots();
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

        if (!this.addEvent(new Day(day), start, end)) {
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

        this.appointments = []
        if(result.status == 'success'){
            this.appointments = result.data.map(item => new TimeSlot(new Day(item.day), item.start, item.end));
        }
    }

    async addEvent(day, start, end) {
        const newSlot = new TimeSlot(day, start, end);
        if (this.slotAvailable(newSlot)) {
            const formData = new URLSearchParams();
            formData.append("type", "register_appointment");
            formData.append("day", newSlot.day.day);
            formData.append("start", newSlot.start); 
            formData.append("end", newSlot.end);

            const response = await fetch('ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 
                },
                body: formData
            });
            const data = await response.json();

            this.appointments.push(newSlot)
            cs('added')
            return true;
        }
        return false;
    }

    slotAvailable(newSlot) {
        return !this.appointments.some(event =>
            event.day.day === newSlot.day.day &&
            this.timesOverlap(event.start, event.end, newSlot.start, newSlot.end)
        );
    }

    timesOverlap(start1, end1, start2, end2) {
        return !(end1 <= start2 || end2 <= start1);
    }

    initDatepicker() {
        $("#datePicker").datepicker({
            dateFormat: "yy-mm-dd"
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


        const slotsContainer = document.getElementById("slotsContainer");
        slotsContainer.innerHTML = ""; // Clear previous slots

        const [start, end] = this.getDayAvailabilityRange(day);
        let currentTime = start;

        while (currentTime + duration <= end) {
            if (this.slotAvailable(new TimeSlot(day, currentTime, currentTime + duration))) {

                const slotElement = document.createElement('div');
                slotElement.className = 'slot';
                slotElement.textContent = `${Utils.minutesToTime(currentTime)} - ${Utils.minutesToTime(currentTime + duration)}`;
                // slotElement.onclick = () => this.openOverlay(day, duration, currentTime, currentTime + duration);
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
        const baseConfig = {start: "05:00", end: "23:00"}; // Default hours
        const dayConfig = day.isWeekend ? {start: "09:00", end: "23:00"} : baseConfig;
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
}
