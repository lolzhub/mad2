export default {
    template: `
    <div v-if="professional" class="container">
        <h2>Professional Details</h2>
        <p><strong>ID:</strong> {{ professional.id }}</p>
        <p><strong>Name:</strong> {{ professional.full_name }}</p>
        <p><strong>Email:</strong> {{ professional.email }}</p>
        <p><strong>Service:</strong> {{ professional.service_name }}</p>
        <p><strong>Cost:</strong> {{ professional.cost }}</p>
        <p><strong>Resume:</strong> 
            <a v-if="professional.document" :href="'/api' + professional.document" target="_blank">View Resume</a>
            <span v-else>N/A</span>
        </p>
        <button @click="$router.push('/admin')" class="btn btn-secondary">Back</button>
    </div>
    <div v-else>
        <p>Loading professional details...</p>
    </div>
    `,
    data() {
        return {
            professional: null
        };
    },
    created() {
        this.fetchProfessionalDetails();
    },
    methods: {
        fetchProfessionalDetails() {
            const professionalId = this.$route.params.id;
            fetch(`/api/proff/${professionalId}`, {
                method: "GET",
                headers: { "Authorization": "Bearer " + localStorage.getItem("access_token") }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    this.professional = data.professional;
                } else {
                    alert("Error fetching professional details.");
                    this.$router.push("/admin");
                }
            })
            .catch(error => {
                console.error("Error fetching professional details:", error);
                this.$router.push("/admin");
            });
        }
    }
};
