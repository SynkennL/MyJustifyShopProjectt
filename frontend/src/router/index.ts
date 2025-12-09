import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import AboutView from '../views/About.vue'
import ContactView from '../views/Contact.vue'
import CategoryView from '../views/CategoryView.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import AdminView from '../views/AdminView.vue'
import CustomerPanel from '../views/CustomerPanel.vue'
import CartView from '../views/CartView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import CompareView from '../views/CompareView.vue'
const routes = [
  { path: '/', component: HomeView },
  { path: '/hakkimizda', component: AboutView },
  { path: '/iletisim', component: ContactView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/admin', component: AdminView },
  { path: '/customer-panel', component: CustomerPanel },
  { path: "/cart", name: "Cart", component: CartView },
  { path: "/kategori/:name", name: "category", component: CategoryView },
  { path: "/urun/:id", name: "ProductDetail", component: ProductDetailView },
  { path: '/favorilerim', component: FavoritesView },
  { path: '/karsilastir', name: 'Compare', component: CompareView }

]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})