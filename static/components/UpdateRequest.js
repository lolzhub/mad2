export default {
    template: `
    <div>
        <h2>Update Service Request</h2>
        <form @submit.prevent="submitUpdate">
            <div class="mb-3">
                <label class="form-label">Request ID</label>
                <input type="text" class="form-control" v-model="requestId">

            </div>
            <div class="mb-3">
                <label class="form-label">Location</label>
                <input type="text" class="form-control" v-model="location">
            </div>
            <div class="mb-3">
                <label class="form-label">Preferred Date</label>
                <input type="datetime-local" class="form-control" v-model="preferred_date">
            </div>
            <div class="mb-3">
                <label class="form-label">Urgency Level</label>
                <select class="form-control" v-model="urgency_level">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <button type="submit" class="btn btn-success">Update Request</button>
            
            <button type="button" class="btn btn-danger ms-2" @click="cancelRequest">
                Cancel
            </button>
        </form>
    </div>
    `,
    data() {
        return {
            requestId: this.$route.params.id,
            remarks: '',
            location: '',
            preferred_date: "",
            urgency_level: 'Medium',
            service_status: ''
        };
    },
    mounted() {
        fetch(`/api/req/${this.requestId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        .then(response => response.json())
        .then(data => {
            this.remarks = data.remarks || '';
            this.location = data.location || '';
            this.preferred_date = data.preferred_date ? data.preferred_date.replace(" ", "T") : '';
            this.urgency_level = data.urgency_level || 'Medium';
            this.service_status = data.service_status || '';
        });
    },
    methods: {
        getCurrentFormattedDate() {
            const now = new Date();
            return now.toISOString().replace("Z", "").split(".")[0]; // Format: YYYY-MM-DDTHH:MM:SS
        },
        submitUpdate() {
            const updatedData = {
                remarks: this.remarks,
                location: this.location,
                preferred_date: this.getCurrentFormattedDate(),
                urgency_level: this.urgency_level
            };
            fetch(`/api/req/${this.requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(updatedData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Service request updated successfully!");
                    this.$router.push("/dashboard");
                } else {
                    alert("Update failed: " + data.msg);
                }
            });
        },
        cancelRequest() {
            // if (!confirm("Are you sure you want to cancel this request?")) return;
            
            // fetch(`/api/req/${this.requestId}`, {
            //     method: "PUT",
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            //     },
            //     body: JSON.stringify({ service_status: "canceled" })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.status === "success") {
            //         alert("Service request has been canceled.");
            //         this.$router.push("/dashboard");
            //     } else {
            //         alert("Cancellation failed: " + data.msg);
            //     }
            // });
            this.$router.push("/dashboard");

        }
    }
};
