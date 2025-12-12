import { createWebHistory, createRouter } from 'vue-router'

import MainLayout from '../layouts/MainLayout.vue'

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
  {
    path: '/',
    component: MainLayout,
    children: [
      { 
        path: '', 
        name: 'Home',
        component: HomeView 
      },
      { 
        path: 'hakkimizda',
        name: 'About', 
        component: AboutView 
      },
      { 
        path: 'iletisim',
        name: 'Contact', 
        component: ContactView 
      },
      { 
        path: 'kategori/:name', 
        name: 'Category', 
        component: CategoryView 
      },
      { 
        path: 'urun/:id', 
        name: 'ProductDetail', 
        component: ProductDetailView 
      },
      { 
        path: 'favorilerim',
        name: 'Favorites', 
        component: FavoritesView 
      },
      { 
        path: 'karsilastir', 
        name: 'Compare', 
        component: CompareView 
      },
      { 
        path: 'cart', 
        name: 'Cart', 
        component: CartView 
      },
      { 
        path: 'profil', 
        name: 'Profile', 
        component: ProfileView 
      },
      { 
        path: 'customer-panel',
        name: 'CustomerPanel', 
        component: CustomerPanel 
      },
      { 
        path: 'admin',
        name: 'Admin', 
        component: AdminView 
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})