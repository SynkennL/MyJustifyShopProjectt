<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { cart } from "../services/cart";

const isMobileMenuOpen = ref(false)
const isDropdownOpenMobile = ref(false)

const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
const toggleDropdownMobile = () => isDropdownOpenMobile.value = !isDropdownOpenMobile.value

const router = useRouter();
const user = ref<{ email?: string, role?: string, name: string } | null>(null);

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
  <nav class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white sticky top-0 z-50 shadow-2xl backdrop-blur-sm">
    <div class="mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 lg:h-20">
        <!-- Logo -->
        <RouterLink to="/" class="flex-shrink-0">
          <img src="../assets/justifylogoom.png"
            class="object-contain h-32 lg:h-32 mt-4 w-auto hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
        </RouterLink>

        <div class="hidden lg:flex items-center space-x-4 xl:space-x-6">
          <!-- Ana Menü -->
          <div class="flex items-center space-x-4 xl:space-x-6">
            <RouterLink to="/" class="text-sm xl:text-base hover:text-blue-400 font-semibold hover:scale-105 transition-all duration-200 relative group">
              Anasayfa
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </RouterLink>

            <!-- Kategoriler Dropdown -->
            <div class="relative group">
              <button
                class="text-sm xl:text-base hover:text-blue-400 flex items-center font-semibold gap-1.5 transition-all duration-200 hover:scale-105">
                Kategoriler
                <svg class="w-3 h-3 xl:w-4 xl:h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" stroke-width="2"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                class="absolute left-0 mt-2 w-48 bg-white text-black rounded-xl shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-1 border border-gray-100">
                <RouterLink to="/kategori/erkek-giyim"
                  class="block px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-t-xl transition-all duration-200 font-medium hover:pl-5">
                  Erkek Giyim
                </RouterLink>
                <RouterLink to="/kategori/kadin-giyim" class="block px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium hover:pl-5">
                  Kadın Giyim
                </RouterLink>
                <RouterLink to="/kategori/ayakkabi" class="block px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium hover:pl-5">
                  Ayakkabı
                </RouterLink>
                <RouterLink to="/kategori/cocuk-giyim"
                  class="block px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-b-xl transition-all duration-200 font-medium hover:pl-5">
                  Çocuk Giyim
                </RouterLink>
              </div>
            </div>

            <RouterLink to="/hakkimizda"
              class="text-sm xl:text-base hover:text-blue-400 font-semibold hover:scale-105 transition-all duration-200 relative group">
              Hakkımızda
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </RouterLink>

            <RouterLink to="/iletisim"
              class="text-sm xl:text-base hover:text-blue-400 font-semibold hover:scale-105 transition-all duration-200 relative group">
              İletişim
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </RouterLink>
          </div>

          <!-- Sağ Menü -->
          <div class="flex items-center space-x-2 xl:space-x-3">
            <!-- Giriş yapılmamışsa -->
            <div v-if="!user" class="flex items-center gap-2">
              <!-- Sepet -->
              <RouterLink to="/cart" class="relative group">
                <div
                  class="flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-110 hover:from-blue-500 hover:to-blue-600">
                  <span class="font-bold text-xs xl:text-sm">Sepetim</span>
                  <span v-if="cart.length"
                    class="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold shadow-lg animate-pulse">
                    {{cart.reduce((acc, i) => acc + i.quantity, 0)}}
                  </span>
                </div>
              </RouterLink>

              <RouterLink to="/login">
                <div
                  class="flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-110">
                  <span class="font-bold text-xs xl:text-sm">Giriş</span>
                </div>
              </RouterLink>
              <RouterLink to="/register">
                <div
                  class="flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:scale-110">
                  <span class="font-bold text-xs xl:text-sm">Kayıt</span>
                </div>
              </RouterLink>
            </div>

            <!-- Giriş yapılmışsa - Kullanıcı Dropdown -->
            <div v-else class="relative group">
              <button
                class="text-sm xl:text-base hover:text-blue-400 flex items-center font-semibold gap-1.5 transition-all duration-200 hover:scale-105 px-3 py-1.5 rounded-lg hover:bg-white/10">
                {{ user.email && user.email.split('@')[0] }}
                <svg class="w-3 h-3 xl:w-4 xl:h-4 transition-transform group-hover:rotate-180 duration-300" fill="none" stroke="currentColor" stroke-width="2"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                class="absolute right-0 mt-2 w-52 bg-white text-black rounded-xl shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-1 border border-gray-100">
                <RouterLink to="/cart" class="flex items-center justify-between px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-t-xl transition-all duration-200 font-medium hover:pl-5">
                  <span>Sepetim</span>
                  <span v-if="cart.length" class="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                    {{cart.reduce((acc, i) => acc + i.quantity, 0)}}
                  </span>
                </RouterLink>

                <RouterLink to="/customer-panel" class="block px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium hover:pl-5">
                  Kullanıcı Paneli
                </RouterLink>

                <RouterLink v-if="user.role === 'admin'" to="/admin"
                  class="block px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium hover:pl-5">
                  Admin Paneli
                </RouterLink>

                <button @click="logout"
                  class="w-full text-left px-4 py-3 text-sm hover:bg-red-50 rounded-b-xl transition-all duration-200 text-red-600 font-medium hover:pl-5">
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button @click="toggleMobileMenu" class="lg:hidden hover:text-blue-400 focus:outline-none p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-gradient-to-b from-gray-800 to-gray-900 px-4 pb-4 border-t border-gray-700/50">
      <ul class="space-y-2 pt-2">
        <li>
          <RouterLink to="/" @click="isMobileMenuOpen = false"
            class="block py-2.5 hover:text-blue-400 hover:bg-white/5 rounded-lg px-3 text-sm font-medium transition-all duration-200">
            Anasayfa
          </RouterLink>
        </li>

        <li>
          <button @click="toggleDropdownMobile"
            class="w-full text-left py-2.5 flex justify-between items-center hover:bg-white/5 rounded-lg px-3 text-sm font-medium transition-all duration-200">
            Kategoriler
            <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpenMobile }" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="isDropdownOpenMobile" class="bg-gray-800/50 rounded-lg px-2 py-2 mt-2 space-y-1 border border-gray-700/30">
            <RouterLink to="/kategori/erkek-giyim" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-blue-400 hover:bg-white/5 rounded-lg text-sm transition-all duration-200">
              Erkek Giyim
            </RouterLink>
            <RouterLink to="/kategori/kadin-giyim" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-blue-400 hover:bg-white/5 rounded-lg text-sm transition-all duration-200">
              Kadın Giyim
            </RouterLink>
            <RouterLink to="/kategori/ayakkabi" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-blue-400 hover:bg-white/5 rounded-lg text-sm transition-all duration-200">
              Ayakkabı
            </RouterLink>
            <RouterLink to="/kategori/cocuk-giyim" @click="isMobileMenuOpen = false"
              class="block py-2 pl-4 hover:text-blue-400 hover:bg-white/5 rounded-lg text-sm transition-all duration-200">
              Çocuk Giyim
            </RouterLink>
          </div>
        </li>

        <li>
          <RouterLink to="/hakkimizda" @click="isMobileMenuOpen = false"
            class="block py-2.5 hover:text-blue-400 hover:bg-white/5 rounded-lg px-3 text-sm font-medium transition-all duration-200">
            Hakkımızda
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/iletisim" @click="isMobileMenuOpen = false"
            class="block py-2.5 hover:text-blue-400 hover:bg-white/5 rounded-lg px-3 text-sm font-medium transition-all duration-200">
            İletişim
          </RouterLink>
        </li>

        <!-- Sepet -->
        <li>
          <RouterLink to="/cart" @click="isMobileMenuOpen = false" class="block">
            <div
              class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-bold text-sm">Sepetim</span>
              </div>
              <span v-if="cart.length"
                class="bg-red-500 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-lg animate-pulse">
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
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span class="font-bold text-sm">Giriş Yap</span>
            </div>
          </RouterLink>
          <RouterLink to="/register" @click="isMobileMenuOpen = false">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105">
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
          <div class="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-gray-700/50">
            <svg class="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium text-sm truncate">{{ user.email }}</span>
          </div>

          <!-- Panel -->
          <RouterLink to="/customer-panel" @click="isMobileMenuOpen = false">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105">
              <span class="font-bold text-sm">Kullanıcı Paneli</span>
            </div>
          </RouterLink>

          <!-- Admin Paneli -->
          <RouterLink v-if="user.role === 'admin'" to="/admin" @click="isMobileMenuOpen = false">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105">
              <span class="font-bold text-sm">Admin Paneli</span>
            </div>
          </RouterLink>

          <!-- Çıkış -->
          <button @click="logout" class="w-full">
            <div
              class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/50 transform hover:scale-105">
              <span class="font-bold text-sm">Çıkış Yap</span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped></style>