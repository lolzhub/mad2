export default {
    template: `
    <div>
        <h2>Book Service</h2>
        <form @submit.prevent="submitRequest">
            <div class="mb-3">
                <label class="form-label">Service Name</label>
                <input type="text" class="form-control" v-model="service_name" disabled>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Professional ID</label>
                <input type="number" class="form-control" v-model="professional_id" disabled>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Time Required</label>
                <input type="text" class="form-control" v-model="time_req" disabled>
            </div>
            


            <div class="mb-3">
                <label class="form-label">Preferred Date</label>
                <input type="datetime-local" class="form-control" v-model="display_preferred_date">
            </div>

            <div class="mb-3">
                <label class="form-label">Urgency Level</label>
                <select class="form-control" v-model="urgency_level">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>

            <div class="mb-3">
                <label class="form-label">Cost</label>
                <input type="number" class="form-control" v-model="cost" disabled>
            </div>

            <button type="submit" class="btn btn-success">Confirm Booking</button>
        </form>
    </div>
    `,
    data() {
        return {
            service_name: this.$route.params.name || '',
            professional_id: this.$route.params.proff_id || '',
            cost: this.$route.params.cost || '',
            time_req: this.$route.params.time,
            location: '',
            display_preferred_date: this.getFutureDate(2), // Display +2 days in the input
            urgency_level: 'Medium',
        };
    },
    methods: {
        getFutureDate(days) {
            const date = new Date();
            date.setDate(date.getDate() + days); // Add `days` to the current date
            return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
        },
        getCurrentFormattedDate() {
            const now = new Date();
            return now.toISOString().replace("Z", "").split(".")[0]; // Format: YYYY-MM-DDTHH:MM:SS
        },
        submitRequest() {
            const requestData = {
                service_id: this.$route.params.id,
                customer_id: localStorage.getItem("id"),
                professional_id: this.professional_id,
                remarks: this.remarks,
                preferred_date: this.getCurrentFormattedDate(), // Send current time to backend
                urgency_level: this.urgency_level,
                cost: this.cost
            };

            fetch("/api/add_req", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Service booked successfully!");
                    this.$router.push("/dashboard");
                } else {
                    alert("Failed to book service: " + data.msg);
                }
            })
            .catch(error => console.error("Error booking service:", error));
        }
    }
};
