<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../../services/api";
import { clearGuestCart } from "../../services/cart";
import { toast } from "vue3-toastify";
import Button from "../../components/common/Button.vue";
import Input from "../../components/common/Input.vue";
import AuthLayout from "./components/AuthLayout.vue";
import AuthFormHeader from "./components/AuthFormHeader.vue";
import AuthFooter from "./components/AuthFooter.vue";
import RoleSelector from "./components/RoleSelector.vue";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const role = ref<'customer' | 'admin'>("customer");
const error = ref("");
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = "";
  
  try {
    const res = await apiPost("/auth/register", {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    });
    
    if (res.error) {
      error.value = res.error;
      return;
    }
    
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    clearGuestCart();

    await router.push("/");
    setTimeout(() => location.reload(), 100);
  } catch (e) {
    toast.error("Kayıt olurken bir hata oluştu.");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthLayout max-width="lg">
    <!-- Header -->
    <AuthFormHeader
      title="Hesap Oluştur"
      description="JustifyShop'a hoş geldiniz"
      icon="register"
    />

    <!-- Register Form -->
    <form @submit.prevent="submit" class="space-y-5">
      <Input
        v-model="name"
        label="İsim Soyisim"
        placeholder="Adınızı girin"
        required
        autocomplete="name"
      />

      <Input
        v-model="email"
        type="email"
        label="E-posta Adresi"
        placeholder="ornek@email.com"
        required
        autocomplete="email"
      />

      <Input
        v-model="password"
        type="password"
        label="Şifre"
        placeholder="En az 6 karakter"
        required
        autocomplete="new-password"
      />

      <!-- Role Selector -->
      <RoleSelector v-model="role" />

      <!-- Error Message -->
      <p v-if="error" class="text-red-500 text-sm bg-red-50 py-2 px-4 rounded-lg border border-red-200">
        {{ error }}
      </p>

      <!-- Submit Button -->
      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        full-width 
        :loading="loading"
      >
        Hesap Oluştur
      </Button>
    </form>

    <!-- Footer -->
    <AuthFooter type="register" />
  </AuthLayout>
</template>