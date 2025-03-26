
export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <p>{{ message }}</p>
                    <h2 class="text-center">Add New Service</h2>
                    <div>
                        <label for="name">Service Name:</label>
                        <input type="text" v-model="newService.name" id="name" required>
                    </div>
                    <div>
                        <label for="price">Price:</label>
                        <input type="number" v-model="newService.price" id="price" required>
                    </div>
                    <div>
                        <label for="time_required">Time Required:</label>
                        <input type="text" v-model="newService.time_required" id="time_required" required>
                    </div>
                    <div>
                        <label for="description">Description:</label>
                        <textarea v-model="newService.description" id="description"></textarea>
                    </div>
                    <div>
                        <label for="cat">Category:</label>
                        <input type="text" v-model="newService.cat" id="cat">
                    </div>
                    <div>
                        <button class="btn btn-primary" @click="submitService">Submit</button>
                        <router-link to="/admin" class="btn btn-secondary">Cancel</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            newService: {
                name: "",
                price: "",
                time_required: "",
                description: "",
                rating: 0,
                cat: ""
            },
            message: ""
        };
    },
    methods: {
        submitService() {
            fetch("/api/add_serv", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify(this.newService)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Service added successfully!");
                    this.$router.push("/admin");
                } else {
                    this.message = "Error: " + data.msg;
                }
            });
        }
    }
};
