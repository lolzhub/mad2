export default {
    template: `
    <div>
        <h2>Welcome, Adee!</h2>
        
        <!-- CRUD Services -->
        <div class="border p-3 mb-3">
            <h3>Manage Services</h3>
            <button @click="addService" class="btn btn-primary">Add New Service</button>
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Service ID</th>
                            <th>Service Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="service in services" :key="service.id">
                            <td>{{ service.id }}</td>
                            <td>{{ service.name }}</td>
                            <td>
                                <button @click="editService(service)" class="btn btn-warning btn-sm">Edit</button>
                                <button @click="deleteService(service)" class="btn btn-danger btn-sm">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- View Professionals -->
        <div class="border p-3 mb-3">
            <h3>Professionals Info</h3>
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Professional ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Resume</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="professional in professionals" :key="professional.id">
                            <td>
                                <a href="#" @click.prevent="viewProfessional(professional.id)">{{ professional.id }}</a>
                            </td>
                            <td>{{ professional.full_name }}</td>
                            <td>{{ professional.email }}</td>
                            <td>
                                <a v-if="professional.document" :href="'/api'+professional.document" target="_blank">View Resume</a>
                                
                                <span v-else>N/A</span>
                            </td>
                            <td>
                                <button v-if="!professional.is_blocked" @click="blockProfessional(professional.id)" class="btn btn-danger btn-sm">Block</button>
                                <button v-if="professional.is_blocked" @click="unblockProfessional(professional.id)" class="btn btn-success btn-sm">Unblock</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- View Service Requests -->
        <div class="border p-3 mb-3">
            <h3>Service Requests</h3>
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Professional Name</th>
                            <th>Customer</th>
                            <th>Cost</th>
                            <th>Updated At</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in serviceRequests" :key="request.id">
                            <td>{{ request.id }}</td>
                            <td>{{ request.professional_name }}</td>
                            <td>{{ request.customer_id }}</td>
                            <td>{{ request.cost }}</td>
                            <td>{{ request.updated_at }}</td>
                            <td>{{ request.service_status }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            services: [],
            professionals: [],
            serviceRequests: []
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            fetch("/api/all_servs", {
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
            .then(response => response.json())
            .then(data => this.services = data.services);

            fetch("/api/all_proffs", {
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
            .then(response => response.json())
            .then(data => this.professionals = data.professionals);

            fetch("/api/all_reqs", {
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
            .then(response => response.json())
            .then(data => this.serviceRequests = data.service_requests);
        },
        addService() {
            this.$router.push("/add_service");
        },
        editService(service) {
            this.$router.push({ name: "EditService", params: { id: service.id } });
        },
        deleteService(service) {
            if (confirm(`Are you sure you want to delete ${service.name}?`)) {
                fetch(`/api/serv/${service.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Service deleted successfully!");
                        this.fetchData();
                    } else {
                        alert("Error: " + data.msg);
                    }
                });
            }
        },
        viewProfessional(professionalId) {
            this.$router.push({ name: "Proff_Details", params: { id: professionalId } });
        },
        blockProfessional(professionalId) {
            if (confirm("Are you sure you want to block this professional?")) {
                fetch(`/api/proff/b/${professionalId}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Professional blocked successfully!");
                        this.fetchData();
                    } else {
                        alert("Error: " + data.msg);
                    }
                });
            }
        },
        unblockProfessional(professionalId) {
            if (confirm("Are you sure you want to unblock this professional?")) {
                fetch(`/api/proff/ub/${professionalId}`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        alert("Professional unblocked successfully!");
                        this.fetchData();
                    } else {
                        alert("Error: " + data.msg);
                    }
                });
            }
        }
    }
};
