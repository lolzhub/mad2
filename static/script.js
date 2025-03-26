import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import Navbar from "./components/Navbar.js"
import Footer from "./components/Footer.js"
import Dashboard from "./components/Dashboard.js"
import CloseService from "./components/CloseService.js"
import BookService from "./components/BookService.js"
import UpdateRequest from "./components/UpdateRequest.js"
import Proff_Dash from "./components/Proff_Dash.js"
import Admin from "./components/Admin.js"
import Admin_Login from "./components/Admin_Login.js"
import Add_service from "./components/Add_service.js"
import EditService from "./components/EditService.js"
import Proff_Details from "./components/Proff_Details.js"


const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/admin', component: Admin},
    {path: '/admin_login', component: Admin_Login},
    {path: '/proff_details/:id',name:"Proff_Details", component: Proff_Details},
    {path: '/add_service', component: Add_service},
    {
        path: "/edit_service/:id",
        name: "EditService",
        component: EditService
    },
    {path: '/register', component: Register},
    {path: '/dashboard', component: Dashboard},
    {path: '/proff_dash', component: Proff_Dash},
    {path: '/close_sr/:id', name: "CloseService", component: CloseService},
    {
        path: '/book-service/:id/:cost/:time/:proff_name/:name/:proff_id',
        name: 'BookService',
        component: BookService
      },
      {
        path: '/update-request/:id',
        name: 'UpdateRequest',
        component: UpdateRequest
    }
    ]

const router = new VueRouter({
    routes
})

const app = new Vue({
    el: "#app",
    router,
    template: `
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <foot></foot>
    </div>
    `,
    data: {
        section: "frontend"
    },
    components: {
        "nav-bar": Navbar,
        "foot": Footer
    }
})

