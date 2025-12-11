<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../../services/api";
import { toast } from "vue3-toastify";
import { removeOwnedProductsFromCart } from "../../services/cart";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import Card from "../../components/Card.vue";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = "";
  
  try {
    const res = await apiPost("/auth/login", { 
      email: email.value, 
      password: password.value 
    });
    
    if (res.error) {
      error.value = res.error;
      return;
    }
    
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    await removeOwnedProductsFromCart(res.user.id);
    
    await router.push("/");
    setTimeout(() => location.reload(), 100);
  } catch (e) {
    toast.error("Giriş yapılırken bir hata oluştu.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] px-4">
    <Card class="w-full max-w-lg" padding="lg">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">Giriş Yap</h1>
        <p class="text-gray-600">Hesabınıza erişmek için giriş yapın</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <Input
          v-model="email"
          type="email"
          label="E-posta"
          placeholder="ornek@email.com"
          required
          autocomplete="email"
        />

        <Input
          v-model="password"
          type="password"
          label="Şifre"
          placeholder="Şifrenizi girin"
          required
          autocomplete="current-password"
        />

        <p v-if="error" class="text-red-500 text-sm bg-red-50 py-2 px-4 rounded-lg border border-red-200">
          {{ error }}
        </p>

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          full-width
          :loading="loading"
        >
          Giriş Yap
        </Button>

        <p class="text-center text-sm text-gray-600 mt-4">
          Hesabınız yok mu?
          <RouterLink to="/register" class="font-semibold text-slate-900 hover:underline ml-1">
            Kayıt Olun
          </RouterLink>
        </p>
      </form>
    </Card>
  </div>
</template>