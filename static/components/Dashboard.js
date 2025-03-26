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
                            <th>Description</th>
                            <th>Provider Name</th>
                            <th>Time required</th>
                            <th>Rating</th>
                            <th>Cost</th>
                            <th>Book</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="service in filteredServices" :key="service.id">
                            <td>{{ service.name }}</td>
                            <td>{{ service.description }}</td>
                            <td>{{ service.proff_name }}</td>
                            <td>{{ service.time_required }}</td>
                            <td>{{ service.rating }}</td>
                            <td>{{ service.price }}</td>
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
                            <th>Actions</th>
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
                            <td>
                                <button v-if="sr.service_status === 'requested'" @click="updateRequest(sr)" class="btn btn-warning btn-sm">Update</button>
                                <button v-if="sr.service_status === 'requested'" @click="deleteRequest(sr)" class="btn btn-danger btn-sm">Delete</button>
                                
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
            this.$router.push({ 
                name: 'BookService', 
                params: { 
                    cost: service.price, 
                    time: service.time_required, 
                    proff_name: service.proff_name, 
                    proff_id: service.proff, 
                    name: service.name, 
                    id: service.proff 
                } 
            });
        },
        updateRequest(sr) {
            this.$router.push({ name: 'UpdateRequest', params: { id: sr.id } });
        },
        deleteRequest(sr) {
            if (confirm("Are you sure you want to delete this request?")) {
                fetch(`/api/req/${sr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Service request deleted successfully!");
                        this.srs = this.srs.filter(request => request.id !== sr.id);
                    } else {
                        alert("Failed to delete request: " + data.msg);
                    }
                })
                .catch(error => console.error("Error deleting service request:", error));
            }
        }
    }
};
