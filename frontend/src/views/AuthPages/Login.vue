<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../../services/api";
import { toast } from "vue3-toastify";
import { removeOwnedProductsFromCart } from "../../services/cart";


const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");

async function submit() {
  try {
    const res = await apiPost("/auth/login", { email: email.value, password: password.value });
    if (res.error) { error.value = res.error; return; }
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    await removeOwnedProductsFromCart(res.user.id);
    await router.push("/");
  setTimeout(() => {
    location.reload();
  }, 100);
  } catch (e) {
    toast.error("Giriş yapılırken bir hata oluştu.");
  }
}
</script>

<template>
  <div class="p-8 mx-auto max-w-lg bg-white rounded-2xl shadow-2xl mt-10 border border-gray-100">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">Giriş Yap</h1>
    </div>

    <input v-model="email" placeholder="Email"
      class="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 focus:border-slate-900 focus:bg-white text-sm outline-0 rounded-lg transition-all">
    <input v-model="password" type="password" placeholder="Şifre"
      class="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 focus:border-slate-900 focus:bg-white  mt-4  mb-5 text-sm outline-0 rounded-lg transition-all">

    <button @click="submit"
      class="w-full bg-slate-900 text-white py-2.5 rounded-md hover:bg-slate-800 transition-transform duration-300 hover:scale-105">Giriş
      Yap</button>
  </div>
</template>

<style scoped></style>
