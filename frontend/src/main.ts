import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'preline'
import "vue3-toastify/dist/index.css";      // Stil dosyası!
import Vue3Toastify from 'vue3-toastify';
import { router } from './router'

const app = createApp(App)

router.afterEach(() => {
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      (window as any).HSStaticMethods.autoInit();
    }
  }, 100);
});

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: "top-right"
})

app.use(router).mount('#app')