import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'preline'

import { router } from './router'

const app = createApp(App)

router.afterEach(() => {
  setTimeout(() => {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      (window as any).HSStaticMethods.autoInit();
    }
  }, 100);
});

app.use(router).mount('#app')