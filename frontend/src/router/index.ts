import { createWebHistory, createRouter } from 'vue-router'

import HomeView from '../views/MainPages/Home.vue'
import AboutView from '../views/MainPages/About.vue'
import ContactView from '../views/MainPages/Contact.vue'
import CategoryView from '../views/UserPages/CategoryView.vue'
import LoginView from '../views/AuthPages/Login.vue'
import RegisterView from '../views/AuthPages/Register.vue'
import AdminView from '../views/Panels/AdminView.vue'
import CustomerPanel from '../views/Panels/CustomerPanel.vue'
import CartView from '../views/CartPages/CartView.vue'
import ProductDetailView from '../views/UserPages/ProductDetailView.vue'
import FavoritesView from '../views/UserPages/FavoritesView.vue'
import CompareView from '../views/UserPages/CompareView.vue'
import ProfileView from '../views/UserPages/ProfileView.vue'

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
  { path: '/karsilastir', name: 'Compare', component: CompareView },
  { path: '/profil', name: 'Profile', component: ProfileView }

]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})