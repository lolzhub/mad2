export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 400px; width: 300px;">
                <div>
                    <p> {{message}}</p>
                    <h2 class="text-center">Login Form</h2>
                    <div>
                        <label for="email">Enter your email:</label>
                        <input type="text" v-model="formData.email" id="email">
                    </div>
                    <div>
                        <label for="password">Enter your password:</label>
                        <input type="password" v-model="formData.password" id="password">
                    </div>
                    <div>
                        <label>
                            <input type="radio" v-model="userType" value="customer"> Customer
                        </label>
                        <label>
                            <input type="radio" v-model="userType" value="professional"> Professional
                        </label>
                    </div>
                    <div>
                        <button class="btn btn-primary" @click="loginUser">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function (){
        return {
            formData:{
                email: "",
                password: ""
            },
            userType: "customer",
            message:""
        }
    },
    methods: {
        loginUser: function (){
            const loginUrl = this.userType === "customer" ? "/api/c_login" : "/api/p_login";
            
            fetch(loginUrl, {
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
                    localStorage.setItem("id", data.id)
                    localStorage.setItem("full_name", data.full_name)
                    this.$router.push('/dashboard')
                }
                else{
                    this.message = data.msg
                }
            })
            
        }
    }
}
