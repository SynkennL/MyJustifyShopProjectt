import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import AboutView from '../views/About.vue'
import ContactView from '../views/Contact.vue'
import CategoryView from '../views/CategoryView.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import AdminView from '../views/AdminView.vue'
import CustomerPanel from '../views/CustomerPanel.vue'
import CartView from '../views/CartView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/hakkimizda', component: AboutView },
  { path: '/iletisim', component: ContactView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/admin', component: AdminView },
  { path: '/customer-panel', component: CustomerPanel },
  { path: "/cart", name: "Cart", component: CartView },
  {
    path: "/kategori/:name", name: "category", component: CategoryView,
  }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})