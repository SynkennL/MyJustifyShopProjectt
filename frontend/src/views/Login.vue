<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../services/api";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");

async function submit() {
  error.value = "";
  try {
    const res = await apiPost("/auth/login", { email: email.value, password: password.value });
    if (res.error) { error.value = res.error; return; }
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    router.push("/");
    location.reload();
  } catch (e:any) {
    error.value = "Sunucu hatası";
  }
}
</script>

<template>
  <div class="p-6 mx-auto max-w-md bg-white rounded-xl shadow-md mt-10">
    <h1 class="text-3xl font-bold text-slate-900 mb-6">Giriş Yap</h1>

    <input v-model="email" placeholder="Email" class="w-full py-2.5 px-4 mb-4 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 rounded-md transition-all" />
    <input v-model="password" type="password" placeholder="Şifre" class="w-full py-2.5 px-4 mb-4 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 rounded-md transition-all" />

    <button @click="submit" class="w-full bg-slate-900 text-white py-2.5 rounded-md hover:bg-slate-800 transition-transform duration-300 hover:scale-105">Giriş Yap</button>

    <p v-if="error" class="text-red-500 mt-3">{{ error }}</p>
  </div>
</template>

<style scoped></style>
