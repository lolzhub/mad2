
export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <p>{{ message }}</p>
                    <h2 class="text-center">Edit Service</h2>
                    <div>
                        <label for="name">Service Name:</label>
                        <input type="text" v-model="service.name" id="name" required>
                    </div>
                    <div>
                        <label for="price">Price:</label>
                        <input type="number" v-model="service.price" id="price" required>
                    </div>
                    <div>
                        <label for="time_required">Time Required:</label>
                        <input type="text" v-model="service.time_required" id="time_required" required>
                    </div>
                    <div>
                        <label for="description">Description:</label>
                        <textarea v-model="service.description" id="description"></textarea>
                    </div>
                    <div>
                        <button class="btn btn-primary" @click="updateService">Update</button>
                        <router-link to="/admin" class="btn btn-secondary">Cancel</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            service: { id: '', name: '', price: '', time_required: '', description: '' },
            message: ''
        };
    },
    mounted() {
        // console.log(this.$route.params.id)
        this.fetchService(this.$route.params.id);
    },
    methods: {
        fetchService(serviceId) {
            fetch(`/api/serv/${serviceId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
            })
            .then(response => response.json())
            .then(data => {
                this.service = data.service;
                console.log(data.service, '<-------')
            });
        },
        updateService() {
            fetch(`/api/serv/${this.service.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(this.service)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Service updated successfully!");
                    this.$router.push("/admin");
                } else {
                    alert("Error: " + data.msg);
                }
            });
        }
    }
};
