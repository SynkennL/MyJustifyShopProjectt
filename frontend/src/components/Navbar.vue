<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { cart } from "../services/cart";

const isMobileMenuOpen = ref(false)
const isDropdownOpenDesktop = ref(false)
const isDropdownOpenMobile = ref(false)

const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
const toggleDropdownDesktop = () => isDropdownOpenDesktop.value = !isDropdownOpenDesktop.value
const toggleDropdownMobile = () => isDropdownOpenMobile.value = !isDropdownOpenMobile.value

const router = useRouter();
const user = ref<{ email?: string, role?: string } | null>(null);

function loadUserFromStorage() {
  const u = localStorage.getItem("user");
  user.value = u ? JSON.parse(u) : null;
}

onMounted(() => loadUserFromStorage());

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  user.value = null;
  router.push("/");
}
</script>

<template>
  <nav class="bg-gray-900 text-white">
    <div class="mx-auto px-4 sm:px-10 flex justify-between items-center h-24">

      <!-- Logo -->
      <RouterLink to="/">
        <img src="../assets/justifylogo.png"
          class="object-contain h-40 w-auto mt-3 hover:scale-110 transition-transform duration-200" />
      </RouterLink>

      <!-- Desktop Menu -->
      <ul class="hidden md:flex space-x-8 text-lg items-center">

        <li>
          <RouterLink to="/" class="hover:text-gray-200 font-bold hover:underline">Anasayfa</RouterLink>
        </li>

        <li class="relative">
          <button @click="toggleDropdownDesktop" class="hover:text-gray-200 flex items-center font-bold hover:underline gap-1">
            Kategoriler
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="isDropdownOpenDesktop" class="absolute left-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">
            <RouterLink to="/kategori/erkek-giyim" class="block px-4 py-2 hover:bg-gray-100">Erkek Giyim</RouterLink>
            <RouterLink to="/kategori/kadin-giyim" class="block px-4 py-2 hover:bg-gray-100">Kadın Giyim</RouterLink>
            <RouterLink to="/kategori/ayakkabi" class="block px-4 py-2 hover:bg-gray-100">Ayakkabı</RouterLink>
            <RouterLink to="/kategori/cocuk-giyim" class="block px-4 py-2 hover:bg-gray-100">Çocuk Giyim</RouterLink>
          </div>
        </li>

        <li><RouterLink to="/hakkimizda" class="hover:text-gray-200 font-bold hover:underline">Hakkımızda</RouterLink></li>
        <li><RouterLink to="/iletisim" class="hover:text-gray-200 font-bold hover:underline">İletişim</RouterLink></li>

        <!-- Sepetim - Modern Tasarım -->
        <li>
          <RouterLink to="/cart" class="relative group">
            <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <!-- Sepet İkonu -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              <span class="font-bold text-sm">Sepetim</span>
              
              <!-- Badge - Ürün Sayısı -->
              <span v-if="cart.length" 
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                {{ cart.reduce((acc, i) => acc + i.quantity, 0) }}
              </span>
            </div>
          </RouterLink>
        </li>

        <!-- Auth -->
        <li v-if="!user" class="flex items-center gap-4">
          <RouterLink to="/login" class="btn">Giriş</RouterLink>
          <RouterLink to="/register" class="btn">Kayıt Ol</RouterLink>
        </li>
        <li v-else class="flex items-center gap-4">
          <span class="text-sm">Merhaba, {{ user.email }}</span>
          <button @click="logout" class="btn">Çıkış</button>
          <RouterLink to="/customer-panel" class="btn">
            {{ user.role === 'admin' ? '🛠️ Panelim' : 'Panelim' }}
          </RouterLink>
        </li>
      </ul>

      <!-- Mobile Menu Button -->
      <button @click="toggleMobileMenu" class="md:hidden hover:text-gray-200 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-gray-900 px-4 pb-4">
      <ul class="space-y-3 text-lg">
        <li><RouterLink to="/" class="block py-2 hover:text-gray-200 hover:underline">Anasayfa</RouterLink></li>

        <li>
          <button @click="toggleDropdownMobile"
            class="w-full text-left py-2 flex justify-between items-center hover:underline">
            Kategoriler
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="isDropdownOpenMobile" class="bg-gray-800 rounded px-2 py-2">
            <RouterLink to="/kategori/erkek-giyim" class="block py-2 pl-4 hover:text-gray-200">Erkek Giyim</RouterLink>
            <RouterLink to="/kategori/kadin-giyim" class="block py-2 pl-4 hover:text-gray-200">Kadın Giyim</RouterLink>
            <RouterLink to="/kategori/ayakkabi" class="block py-2 pl-4 hover:text-gray-200">Ayakkabı</RouterLink>
            <RouterLink to="/kategori/cocuk-giyim" class="block py-2 pl-4 hover:text-gray-200">Çocuk Giyim</RouterLink>
          </div>
        </li>

        <li><RouterLink to="/hakkimizda" class="block py-2 hover:text-gray-200 hover:underline">Hakkımızda</RouterLink></li>
        <li><RouterLink to="/iletisim" class="block py-2 hover:text-gray-200 hover:underline">İletişim</RouterLink></li>

        <!-- Sepetim - Mobile Modern Tasarım -->
        <li>
          <RouterLink to="/cart" class="relative block">
            <div class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-blue-700 hover:bg-green-500 transition-all duration-300 shadow-lg">
              <div class="flex items-center gap-3">
                <!-- Sepet İkonu -->
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-bold">Sepetim</span>
              </div>
              
              <!-- Badge - Ürün Sayısı -->
              <span v-if="cart.length" 
                class="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold animate-pulse shadow-lg">
                {{ cart.reduce((acc, i) => acc + i.quantity, 0) }} Ürün
              </span>
              <span v-else class="text-gray-300 text-sm">Boş</span>
            </div>
          </RouterLink>
        </li>

        <!-- Auth -->
        <li v-if="!user" class="flex flex-col gap-2">
          <RouterLink to="/login" class="btn block w-full text-center">Giriş</RouterLink>
          <RouterLink to="/register" class="btn block w-full text-center">Kayıt Ol</RouterLink>
        </li>
        <li v-else class="flex flex-col gap-2">
          <span class="text-sm text-center">Merhaba, {{ user.email }}</span>
          <button @click="logout" class="btn w-full">Çıkış</button>
          <RouterLink to="/customer-panel" class="btn w-full text-center">
            {{ user.role === 'admin' ? '🛠️ Panelim' : 'Panelim' }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
</style>