<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../../services/api";
import { clearGuestCart } from "../../services/cart";
import Button from "../../components/Button.vue";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("customer");
const error = ref("");

async function submit() {
  error.value = "";
  const res = await apiPost("/auth/register", {
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value
  });
  if (res.error) { error.value = res.error; return; }
  localStorage.setItem("token", res.token);
  localStorage.setItem("user", JSON.stringify(res.user));
  clearGuestCart();

  await router.push("/");
  setTimeout(() => {
    location.reload();
  }, 100);
}
</script>

<template>
  <div class="p-8 mx-auto max-w-lg bg-white rounded-2xl shadow-2xl mt-10 border border-gray-100">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-slate-900 mb-2">Hesap Oluştur</h1>
      <p class="text-gray-500">JustifyShop'a hoş geldiniz</p>
    </div>

    <form @submit.prevent="submit" class="space-y-5">
      <!-- İsim -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">İsim Soyisim</label>
        <input v-model="name" type="text" placeholder="Adınızı girin"
          class="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 focus:border-slate-900 focus:bg-white text-sm outline-0 rounded-lg transition-all"
          required />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">E-posta Adresi</label>
        <input v-model="email" type="email" placeholder="ornek@email.com"
          class="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 focus:border-slate-900 focus:bg-white text-sm outline-0 rounded-lg transition-all"
          required />
      </div>

      <!-- Şifre -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
        <input v-model="password" type="password" placeholder="En az 6 karakter"
          class="w-full py-3 px-4 bg-gray-50 border-2 border-gray-200 focus:border-slate-900 focus:bg-white text-sm outline-0 rounded-lg transition-all"
          required minlength="6" />
      </div>

      <!-- Hesap Türü Seçimi -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-3">Hesap Türü</label>
        <div class="grid grid-cols-2 gap-4">
          <!-- Müşteri -->
          <label :class="[
            'relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all',
            role === 'customer'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          ]">
            <input type="radio" v-model="role" value="customer" class="sr-only" />
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-3" :class="role === 'customer' ? 'text-blue-500' : 'text-gray-400'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span class="font-bold text-lg block mb-1"
                :class="role === 'customer' ? 'text-blue-600' : 'text-gray-700'">Müşteri</span>
              <span class="text-xs text-gray-500">Ürün satın al & Ürün satışı yap</span>
            </div>
            <div v-if="role === 'customer'" class="absolute top-3 right-3">
              <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </label>

          <!-- Yönetici -->
          <label :class="[
            'relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all',
            role === 'admin'
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          ]">
            <input type="radio" v-model="role" value="admin" class="sr-only" />
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-3" :class="role === 'admin' ? 'text-purple-500' : 'text-gray-400'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="font-bold text-lg block mb-1"
                :class="role === 'admin' ? 'text-purple-600' : 'text-gray-700'">Yönetici</span>
              <span class="text-xs text-gray-500">Ürün sat & Ürünleri yönet</span>
            </div>
            <div v-if="role === 'admin'" class="absolute top-3 right-3">
              <svg class="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />
              </svg>
            </div>
          </label>
        </div>
      </div>

      <!-- Açıklama -->
      <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-gray-600">
            <strong class="text-gray-700">{{ role === 'admin' ? 'Yönetici:' : 'Müşteri:' }}</strong>
            {{ role === 'admin'
              ? 'Müşterilerin mevcut ilanlarını yönetebilir,ürün satabilir,ürün satın alabilirsiniz.'
              : 'Ürün satın alabilir,ürün satabilir,mevcut ürünleri görüntüleyebilirsiniz.'
            }}
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <Button variant="primary" size="lg" full-width type="submit">
        Hesap Oluştur
    </Button>

      <p v-if="error" class="text-red-500 text-center text-sm bg-red-50 py-2 px-4 rounded-lg border border-red-200">
        {{ error }}
      </p>

      <!-- Login Link -->
      <p class="text-center text-sm text-gray-600">
        Zaten hesabınız var mı?
        <RouterLink to="/login" class="font-semibold text-slate-900 hover:underline ml-1">
          Giriş Yapın
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped></style>