export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <p> {{message}}</p>
                    <h2 class="text-center">Admin Login</h2>
                    <div>
                        <label for="username">Enter your username:</label>
                        <input type="text" v-model="formData.username" id="username">
                    </div>
                    <div>
                        <label for="password">Enter your password:</label>
                        <input type="password" v-model="formData.password" id="password">
                    </div>
                    <div>
                        <button class="btn btn-primary" @click="loginAdmin">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function (){
        return {
            formData:{
                username: "",
                password: ""
            },
            message:""
        }
    },
    methods: {
        loginAdmin: function (){
            fetch("/api/admin", {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                if (Object.keys(data).includes("access_token")){
                    localStorage.setItem("access_token", data.access_token)
                    localStorage.setItem("admin_id", data.id)
                    localStorage.setItem("admin_name", data.full_name)
                    this.$router.push("/admin");
                }
                else{
                    this.message = data.msg
                }
            })
        }
    }
}
