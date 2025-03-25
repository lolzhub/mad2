export default {
    template: `
    <div>
        <h2>Provide Feedback</h2>
        <div class="card p-3">
            <p><strong>Service Name:</strong> {{ service.service_id }}</p>
            <p><strong>Description:</strong> {{ service.service_desc }}</p>
            <p><strong>Date:</strong> {{ service.date_of_request }}</p>
            <p><strong>Professional:</strong> {{ service.professional_name }} (ID: {{ service.professional_id }})</p>

            <label for="rating">Rating (out of 5):</label>
            <input type="number" v-model="rating" min="1" max="5" class="form-control"/>

            <label for="remarks">Remarks:</label>
            <textarea v-model="remarks" class="form-control"></textarea>

            <div class="mt-3">
                <button @click="submitFeedback" class="btn btn-success">Submit</button>
                <button @click="$router.go(-1)" class="btn btn-secondary ml-2">Close</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            service: {},
            rating: null,
            remarks: ""
        };
    },
    mounted() {
        const serviceId = this.$route.params.id;
        fetch(`/api/req/${serviceId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        .then(response => response.json())
        .then(data => this.service = data.service_request);
    },
    methods: {
        submitFeedback() {
            const now = new Date();
            const formattedDate = now.toISOString().split(".")[0]; // Removes milliseconds and timezone
        
            fetch(`/api/req/${this.service.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify({
                    service_status: "closed",
                    rating: this.rating,
                    remarks: this.remarks,
                    date_of_completion: formattedDate // Fixed format
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status === "success") {
                    alert("Service closed successfully!");
                    this.$router.push('/dashboard');
                }
            });
        }
        
    }
};
