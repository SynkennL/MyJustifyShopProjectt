import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import AboutView from '../views/About.vue'
import ContactView from '../views/Contact.vue'
import CategoryView from '../views/CategoryView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/hakkimizda', component: AboutView },
  { path: '/iletisim', component: ContactView },
  { path: "/kategori/:name", name: "category", component: CategoryView,
}

  
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})