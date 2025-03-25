export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <h2 class="text-center">Register</h2>
                <div>
                    <label>
                        <input type="radio" v-model="userType" value="customer"> Customer
                    </label>
                    <label>
                        <input type="radio" v-model="userType" value="professional"> Professional
                    </label>
                </div>
                <div>
                    <label for="email">Email:</label>
                    <input type="text" v-model="formData.email" id="email">
                </div>
                <div>
                    <label for="password">Password:</label>
                    <input type="password" v-model="formData.password" id="password">
                </div>
                <div>
                    <label for="full_name">Full Name:</label>
                    <input type="text" v-model="formData.full_name" id="full_name">
                </div>
                <div>
                    <label for="address">Address:</label>
                    <input type="text" v-model="formData.address" id="address">
                </div>
                <div>
                    <label for="pincode">Pincode:</label>
                    <input type="text" v-model="formData.pincode" id="pincode">
                </div>
                <div v-if="userType === 'professional'">
                    <label for="service_name">Service Name:</label>
                    <input type="text" v-model="formData.service_name" id="service_name">
                    <label for="experience">Experience (years):</label>
                    <input type="number" v-model="formData.experience" id="experience">
                    <label for="document">Upload Document:</label>
                    <input type="file" @change="handleFileUpload">
                </div>
                <div>
                    <button class="btn btn-primary" @click="registerUser">Register</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userType: "customer",
            formData: {
                email: "",
                password: "",
                full_name: "",
                address: "",
                pincode: "",
                service_name: "",
                experience: "",
                document: null
            }
        };
    },
    methods: {
        handleFileUpload(event) {
            this.formData.document = event.target.files[0];
        },
        registerUser() {
            let apiUrl = this.userType === "customer" ? "/api/c_register" : "/api/p_register";
            let formDataToSend;
            
            if (this.userType === "professional") {
                formDataToSend = new FormData();
                for (let key in this.formData) {
                    formDataToSend.append(key, this.formData[key]);
                }
            } else {
                formDataToSend = JSON.stringify(this.formData);
            }
            
            fetch(apiUrl, {
                method: "POST",
                headers: this.userType === "customer" ? { "Content-Type": "application/json" } : {},
                body: this.userType === "customer" ? formDataToSend : formDataToSend
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                alert("User registered successfully!!")
                this.$router.push('/login')
            })

            
        }
    }
}
