<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { cart } from "../services/cart";

const isMobileMenuOpen = ref(false)
const isDropdownOpenMobile = ref(false)

const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
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

        <li class="relative group">
          <button class="hover:text-gray-200 flex items-center font-bold hover:underline gap-1">
            Kategoriler
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            class="absolute left-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <RouterLink to="/kategori/erkek-giyim" class="block px-4 py-2 hover:bg-gray-100 rounded-t-lg">Erkek Giyim
            </RouterLink>
            <RouterLink to="/kategori/kadin-giyim" class="block px-4 py-2 hover:bg-gray-100">Kadın Giyim</RouterLink>
            <RouterLink to="/kategori/ayakkabi" class="block px-4 py-2 hover:bg-gray-100">Ayakkabı</RouterLink>
            <RouterLink to="/kategori/cocuk-giyim" class="block px-4 py-2 hover:bg-gray-100 rounded-b-lg">Çocuk Giyim
            </RouterLink>
          </div>
        </li>

        <li>
          <RouterLink to="/hakkimizda" class="hover:text-gray-200 font-bold hover:underline">Hakkımızda</RouterLink>
        </li>
        <li>
          <RouterLink to="/iletisim" class="hover:text-gray-200 font-bold hover:underline">İletişim</RouterLink>
        </li>

        <!-- Sepetim - Modern Tasarım -->
        <li>
          <RouterLink to="/cart" class="relative group">
            <div
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <!-- Sepet İkonu -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>

              <span class="font-bold text-sm">Sepetim</span>

              <!-- Badge - Ürün Sayısı -->
              <span v-if="cart.length"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
                {{cart.reduce((acc, i) => acc + i.quantity, 0)}}
              </span>
            </div>
          </RouterLink>
        </li>

        <!-- Auth -->
        <li v-if="!user" class="flex items-center gap-3">
          <RouterLink to="/login">
            <div
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span class="font-bold text-sm">Giriş</span>
            </div>
          </RouterLink>
          <RouterLink to="/register">
            <div
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span class="font-bold text-sm">Kayıt Ol</span>
            </div>
          </RouterLink>
        </li>
        <li v-else class="flex items-center gap-3">
          <!-- Kullanıcı Bilgisi -->
          <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 shadow-lg">
            <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-sm font-medium truncate max-w-[150px]">{{ user.email }}</span>
          </div>

          <!-- Panel Butonu -->
          <RouterLink to="/customer-panel">
            <div
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg v-if="user.role === 'admin'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-bold text-sm">{{ user.role === 'admin' ? 'Yönetici Panel' : 'Panelim' }}</span>
            </div>
          </RouterLink>

          <!-- Çıkış Butonu -->
          <button @click="logout">
            <div
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="font-bold text-sm">Çıkış</span>
            </div>
          </button>
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
      <ul class="space-y-3">
        <li>
          <RouterLink to="/" @click="isMobileMenuOpen = false"
            class="block py-2 hover:text-gray-200 hover:underline text-base">
            Anasayfa
          </RouterLink>
        </li>

        <li>
          <button @click="toggleDropdownMobile"
            class="w-full text-left py-2 flex justify-between items-center hover:underline text-base">
            Kategoriler
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpenMobile }"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="isDropdownOpenMobile" class="bg-gray-800 rounded px-2 py-2 mt-2 space-y-1">
            <RouterLink to="/kategori/erkek-giyim" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-gray-200 text-sm">
              Erkek Giyim
            </RouterLink>
            <RouterLink to="/kategori/kadin-giyim" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-gray-200 text-sm">
              Kadın Giyim
            </RouterLink>
            <RouterLink to="/kategori/ayakkabi" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-gray-200 text-sm">
              Ayakkabı
            </RouterLink>
            <RouterLink to="/kategori/cocuk-giyim" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-gray-200 text-sm">
              Çocuk Giyim
            </RouterLink>
          </div>
        </li>

        <li>
          <RouterLink to="/hakkimizda" @click="isMobileMenuOpen = false"
            class="block py-2 hover:text-gray-200 hover:underline text-base">
            Hakkımızda
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/iletisim" @click="isMobileMenuOpen = false"
            class="block py-2 hover:text-gray-200 hover:underline text-base">
            İletişim
          </RouterLink>
        </li>

        <!-- Sepetim - Mobile Modern Tasarım -->
        <li>
          <RouterLink to="/cart" @click="isMobileMenuOpen = false" class="block">
            <div
              class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-blue-700 hover:bg-green-500 transition-all duration-300 shadow-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-bold text-sm">Sepetim</span>
              </div>

              <span v-if="cart.length"
                class="bg-red-500 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-lg">
                {{cart.reduce((acc, i) => acc + i.quantity, 0)}}
              </span>
              <span v-else class="text-gray-300 text-xs">Boş</span>
            </div>
          </RouterLink>
        </li>

        <!-- Auth - Mobile -->
        <li v-if="!user" class="space-y-2 pt-2">
          <RouterLink to="/login" @click="isMobileMenuOpen = false">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 transition-all duration-300 shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span class="font-bold text-sm">Giriş Yap</span>
            </div>
          </RouterLink>
          <RouterLink to="/register" @click="isMobileMenuOpen = false">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 transition-all duration-300 shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span class="font-bold text-sm">Kayıt Ol</span>
            </div>
          </RouterLink>
        </li>
        <li v-else class="space-y-2 pt-2">
          <!-- Kullanıcı Bilgisi -->
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700 shadow-lg">
            <svg class="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium text-sm truncate">{{ user.email }}</span>
          </div>

          <!-- Panel Butonu -->
          <RouterLink to="/customer-panel" @click="isMobileMenuOpen = false">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-lg">
              <svg v-if="user.role === 'admin'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="font-bold text-sm">{{ user.role === 'admin' ? 'Yönetici Panel' : 'Panelim' }}</span>
            </div>
          </RouterLink>

          <!-- Çıkış Butonu -->
          <button @click="logout" class="w-full">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 transition-all duration-300 shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="font-bold text-sm">Çıkış Yap</span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped></style>