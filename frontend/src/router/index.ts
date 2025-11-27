import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '../views/Home.vue'
import AboutView from '../views/About.vue'
import ContactView from '../views/Contact.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/hakkimizda', component: AboutView },
  { path: '/iletisim', component: ContactView },
  
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})