export default {
    template: `
    <div>
        <h2>Welcome {{ userData.customer }}!</h2>
        
        <!-- Looking For Section -->
        <div class="border p-3 mb-3">
            <h3>Looking For</h3>
            <div class="d-flex gap-2 flex-wrap">
                <button v-for="service in services" :key="service" @click="filterServices(service)" class="btn btn-outline-primary">
                    {{ service }}
                </button>
            </div>
        </div>

        <!-- Filtered Services Table -->
        <div v-if="filteredServices.length" class="row border">
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <h2>Available {{ selectedService }} Services</h2>
                <table class="table table-bordered">
                    <thead class="thead-dark">
                        <tr>
                            <th>Service Name</th>
                            <th>Provider</th>
                            <th>Cost</th>
                            <th>Book</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="service in filteredServices" :key="service.id">
                            <td>{{ service.name }}</td>
                            <td>{{ service.provider }}</td>
                            <td>{{ service.cost }}</td>
                            <td>
                                <button @click="bookService(service)" class="btn btn-success">Book</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Service Requests -->
        <div class="row border">
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <h2>Your Service Requests</h2>
                <table class="table table-bordered">
                    <thead class="thead-dark">
                        <tr>
                            <th>SR Name</th>
                            <th>Service Request ID</th>
                            <th>Professional ID</th>
                            <th>Urgency Level</th>
                            <th>Cost</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="sr in srs" :key="sr.id">
                            <td>{{ sr.id }}</td>
                            <td>{{ sr.service_id }}</td>
                            <td>{{ sr.professional_id || 'N/A' }}</td>
                            <td>{{ sr.urgency_level }}</td>
                            <td>{{ sr.cost }}</td>
                            <td>
                                <span v-if="sr.service_status === 'closed'" class="badge text-white bg-secondary d-block text-center p-2">{{ sr.service_status }}</span>
                                <span v-else-if="sr.service_status === 'requested'" class="badge text-black bg-primary d-block text-center p-2">{{ sr.service_status }}</span>
                                <button v-else-if="sr.service_status === 'accepted'" @click="navigateToFeedback(sr)" class="btn btn-success d-block text-center p-1 w-100">Close it?</button>
                                <span v-else class="badge bg-info text-dark d-block text-center p-2">{{ sr.service_status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userData: "",
            srs: null,
            services: ["Plumbing", "Cleaning", "Washing", "Painting"],
            selectedService: "",
            filteredServices: []
        };
    },
    mounted() {
        fetch(`/api/dashboard/${localStorage.getItem("id")}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        .then(response => response.json())
        .then(data => this.userData = data);

        fetch("/api/all_reqs", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        .then(response => response.json())
        .then(data => this.srs = data.service_requests);
    },
    methods: {
        navigateToFeedback(sr) {
            this.$router.push({ name: 'CloseService', params: { id: sr.id } });
        },
        filterServices(service) {
            this.selectedService = service;
            fetch(`/api/all_servs_by_cat/${service}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                }
            })
            .then(response => response.json())
            .then(data => this.filteredServices = data.services || []);
        },
        bookService(service) {
            const now = new Date();
            const formattedDate = now.toISOString().split(".")[0]; // Removes milliseconds and timezone

            if (confirm(`Do you want to book ${service.name}?`)) {
                const requestData = {
                    service_id: 1,
                    customer_id: localStorage.getItem("id"),
                    professional_id: 1,
                    remarks: "No remarks", // Can be enhanced to user input
                    location: "User provided location", // Can be enhanced
                    preferred_date: formattedDate,
                    urgency_level: "Medium", // Can be dynamic
                    cost: 10
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
                        this.srs.push({
                            id: data.service_request,
                            service_id: service.id,
                            professional_id: 1,
                            urgency_level: "Medium",
                            cost: service.cost,
                            service_status: "requested"
                        });
                    } else {
                        alert("Failed to book service: " + data.msg);
                    }
                });
            }
        }
    }
};
