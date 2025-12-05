<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { cart, clearGuestCart } from "../services/cart";

const isMobileMenuOpen = ref(false)
const isDropdownOpenMobile = ref(false)
const isUserDropdownOpen = ref(false)

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
  clearGuestCart();
  router.push("/");
}
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        
        <RouterLink to="/" class="flex-shrink-0 mr-8 mt-4">
          <img src="../assets/justlogopurplee.png" class="h-35 w-auto hover:opacity-90 transition-opacity" alt="JustifyShop" />
        </RouterLink>

        <div class="hidden lg:flex items-center space-x-1 flex-1">
          <RouterLink to="/" 
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-all">
            Anasayfa
          </RouterLink>

          <div class="relative group">
            <button class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-all flex items-center gap-1">
              Kategoriler
              <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-1 group-hover:translate-y-0">
              <RouterLink to="/kategori/erkek-giyim"
                class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-500 first:rounded-t-lg transition-colors">
                Erkek Giyim
              </RouterLink>
              <RouterLink to="/kategori/kadin-giyim" 
                class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-500 transition-colors">
                Kadın Giyim
              </RouterLink>
              <RouterLink to="/kategori/ayakkabi" 
                class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-500 transition-colors">
                Ayakkabı
              </RouterLink>
              <RouterLink to="/kategori/cocuk-giyim"
                class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-500 last:rounded-b-lg transition-colors">
                Çocuk Giyim
              </RouterLink>
            </div>
          </div>

          <RouterLink to="/hakkimizda"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-all">
            Hakkımızda
          </RouterLink>

          <RouterLink to="/iletisim"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-md transition-all">
            İletişim
          </RouterLink>
        </div>

        <div class="hidden lg:flex items-center space-x-2">
          
          <RouterLink to="/cart" class="relative group">
            <button class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="hidden xl:inline">Sepetim</span>
              <span v-if="cart.length"
                class="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                {{cart.reduce((acc, i) => acc + i.quantity, 0)}}
              </span>
            </button>
          </RouterLink>

          <!-- Giriş yapılmamışsa -->
          <div v-if="!user" class="flex items-center gap-2 pr-3 border-gray-200">
            <RouterLink to="/login">
              <button class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                <span>Giriş Yap</span>
              </button>
            </RouterLink>
            <RouterLink to="/register">
              <button class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-sm hover:shadow-md">
                <span>Kayıt Ol</span>
              </button>
            </RouterLink>
          </div>

          <!-- Giriş yapılmışsa -->
          <div v-else class="relative border-gray-200">
            <button 
              @click="isUserDropdownOpen = !isUserDropdownOpen"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
              <span class="hidden xl:inline">{{ user?.name }}</span>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isUserDropdownOpen }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="isUserDropdownOpen" 
              @click="isUserDropdownOpen = false"
              class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1">
              
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ user?.email || '' }}</p>
              </div>

              <RouterLink to="/customer-panel" 
                class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-500 transition-colors">
                Kullanıcı Paneli
              </RouterLink>

              <RouterLink v-if="user.role === 'admin'" to="/admin"
                class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 hover:text-slate-500 transition-colors">
                Admin Paneli
              </RouterLink>

              <button @click="logout"
                class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1">
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="toggleMobileMenu" 
          class="lg:hidden p-2 text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          <svg v-if="!isMobileMenuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-white border-t border-gray-200">
      <div class="px-4 py-3 space-y-1">
        <RouterLink to="/" @click="isMobileMenuOpen = false"
          class="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          Anasayfa
        </RouterLink>

        <button 
          @click="toggleDropdownMobile"
          class="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          Kategoriler
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isDropdownOpenMobile }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="isDropdownOpenMobile" class="pl-4 space-y-1">
          <RouterLink to="/kategori/erkek-giyim" @click="isMobileMenuOpen = false"
            class="block px-4 py-2 text-sm text-gray-600 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            Erkek Giyim
          </RouterLink>
          <RouterLink to="/kategori/kadin-giyim" @click="isMobileMenuOpen = false"
            class="block px-4 py-2 text-sm text-gray-600 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            Kadın Giyim
          </RouterLink>
          <RouterLink to="/kategori/ayakkabi" @click="isMobileMenuOpen = false"
            class="block px-4 py-2 text-sm text-gray-600 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            Ayakkabı
          </RouterLink>
          <RouterLink to="/kategori/cocuk-giyim" @click="isMobileMenuOpen = false"
            class="block px-4 py-2 text-sm text-gray-600 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            Çocuk Giyim
          </RouterLink>
        </div>

        <RouterLink to="/hakkimizda" @click="isMobileMenuOpen = false"
          class="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          Hakkımızda
        </RouterLink>

        <RouterLink to="/iletisim" @click="isMobileMenuOpen = false"
          class="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          İletişim
        </RouterLink>

        <!-- Mobile Sepet -->
        <RouterLink to="/cart" @click="isMobileMenuOpen = false"
          class="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all border-t border-gray-100 mt-2 pt-3">
          <div class="flex items-center gap-2">
            Sepetim
          </div>
          <span v-if="cart.length" class="bg-slate-900 text-white rounded-full px-2.5 py-0.5 text-xs font-bold">
            {{cart.reduce((acc, i) => acc + i.quantity, 0)}}
          </span>
        </RouterLink>

        <!-- Mobile Auth -->
        <div v-if="!user" class="pt-3 space-y-2 border-t border-gray-100">
          <RouterLink to="/login" @click="isMobileMenuOpen = false"
            class="block px-4 py-3 text-sm font-medium text-center text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
            Giriş Yap
          </RouterLink>
          <RouterLink to="/register" @click="isMobileMenuOpen = false"
            class="block px-4 py-3 text-sm font-medium text-center text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all">
            Kayıt Ol
          </RouterLink>
        </div>

        <div v-else class="pt-3 space-y-1 border-t border-gray-100">
          <div class="px-4 py-3 bg-slate-50 rounded-lg mb-2">
            <p class="text-sm font-medium text-gray-900">{{ user?.email || ''}}</p>
          </div>
          
          <RouterLink to="/customer-panel" @click="isMobileMenuOpen = false"
            class="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            Kullanıcı Paneli
          </RouterLink>
          
          <RouterLink v-if="user.role === 'admin'" to="/admin" @click="isMobileMenuOpen = false"
            class="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
            Admin Paneli
          </RouterLink>
          
          <button @click="logout"
            class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all">
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
</style>