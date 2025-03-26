export default {
    template: `
    <div>
        <h2>Welcome, Professional!</h2>
        
        <!-- Assigned Service Requests -->
        <div class="border p-3 mb-3">
            <h3>Assigned Service Requests</h3>
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Service Name</th>
                            <th>Customer</th>
                            <th>Location</th>
                            <th>Urgency Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                        <tbody>
                            <tr v-for="request in assignedRequests" :key="request.id" v-if="request.service_status === 'requested'">
                                <td>{{ request.id }}</td>
                                <td>{{ request.service_id }}</td>
                                <td>{{ request.customer_id }}</td>
                                <td>{{ request.location }}</td>
                                <td>{{ request.urgency_level }}</td>
                                <td>
                                    <button @click="acceptRequest(request)" class="btn btn-success btn-sm">Accept</button>
                                    <button @click="rejectRequest(request)" class="btn btn-danger btn-sm">Reject</button>
                                </td>
                            </tr>
                        </tbody>
                </table>
            </div>
        </div>

        <!-- Completed Service Requests -->
        <div class="border p-3 mb-3">
            <h3>Completed Service Requests</h3>
            <div class="border" style="height: 300px; overflow-y: scroll;">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Service Name</th>
                            <th>Customer</th>
                            <th>Completion Date</th>
                        </tr>
                    </thead>
                        <tbody>
                            <tr v-for="request in completedRequests" :key="request.id" v-if="request.service_status === 'closed'">
                                <td>{{ request.id }}</td>
                                <td>{{ request.service_id }}</td>
                                <td>{{ request.customer_id }}</td>
                                <td>{{ request.updated_at }}</td>
                            </tr>
                        </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            assignedRequests: [],
            completedRequests: []
        };
    },
    mounted() {
        fetch("/api/all_reqs", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        .then(response => response.json())
        .then(data => this.assignedRequests = data.service_requests);
        
        fetch("/api/all_reqs", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        .then(response => response.json())
        .then(data => this.completedRequests = data.service_requests);
    },
    methods: {
        acceptRequest(request) {
            const updatedData = {
                service_status: "accepted"}

            fetch(`/api/req/${request.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(updatedData)

            })
            .then(response => response.json())
            .then(() => {
                this.assignedRequests = this.assignedRequests.filter(req => req.id !== request.id);
                alert("Service request accepted!");
            });
        },
        rejectRequest(request) {
            const updatedData = {
                service_status: "rejected"}
            fetch(`/api/req/${request.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(updatedData)
            })
            .then(response => response.json())
            .then(() => {
                this.assignedRequests = this.assignedRequests.filter(req => req.id !== request.id);
                alert("Service request rejected!");
            });
        }
    }
};
