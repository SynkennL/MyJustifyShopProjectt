<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showConsent = ref(false);
const showSettings = ref(false);

const preferences = ref({
  necessary: true,
  functional: true,
  analytics: true,
  marketing: false
});

onMounted(() => {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) {
    setTimeout(() => {
      showConsent.value = true;
    }, 1000);
  }
});

function acceptAll() {
  preferences.value = {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  };
  saveConsent();
}

function acceptSelected() {
  saveConsent();
}

function rejectAll() {
  preferences.value = {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  };
  saveConsent();
}

function saveConsent() {
  localStorage.setItem('cookieConsent', JSON.stringify({
    timestamp: new Date().toISOString(),
    preferences: preferences.value
  }));
  showConsent.value = false;
  showSettings.value = false;
}

function toggleSettings() {
  showSettings.value = !showSettings.value;
}
</script>

<template>
  <!-- Cookie Consent - Sol Alt Küçük Banner -->
  <Transition name="slide-left">
    <div v-if="showConsent" class="fixed bottom-6 left-6 z-[100] max-w-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Ana Banner -->
        <div v-if="!showSettings" class="p-5">
          <div class="flex items-start gap-3 mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold text-gray-900 mb-1">
                Çerezleri Kullanıyoruz
              </h3>
              <p class="text-xs text-gray-600 leading-relaxed">
                Daha iyi bir deneyim için çerezler kullanıyoruz. Siteyi kullanarak kabul etmiş olursunuz.
              </p>
            </div>
            <button 
              @click="rejectAll"
              class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-2">
            <button 
              @click="acceptAll"
              class="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Kabul Et
            </button>
            
            <div class="flex gap-2">
              <button 
                @click="rejectAll"
                class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium text-xs"
              >
                Reddet
              </button>
              <button 
                @click="toggleSettings"
                class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all font-medium text-xs"
              >
                Özelleştir
              </button>
            </div>
          </div>
        </div>

        <!-- Ayarlar Paneli -->
        <div v-else class="p-5 max-h-[500px] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900">Çerez Ayarları</h3>
            <button 
              @click="toggleSettings"
              class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-3 mb-4">
            <!-- Gerekli -->
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-5 bg-slate-900 rounded-full relative">
                    <div class="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <h4 class="font-semibold text-sm text-gray-900">Gerekli</h4>
                </div>
              </div>
              <p class="text-xs text-gray-600">Sitenin çalışması için zorunlu.</p>
            </div>

            <!-- Fonksiyonel -->
            <div class="p-3 bg-white rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="preferences.functional" class="sr-only peer" />
                    <div class="w-8 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                  <h4 class="font-semibold text-sm text-gray-900">Fonksiyonel</h4>
                </div>
              </div>
              <p class="text-xs text-gray-600">Tercihlerinizi hatırlar.</p>
            </div>

            <!-- Analitik -->
            <div class="p-3 bg-white rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="preferences.analytics" class="sr-only peer" />
                    <div class="w-8 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                  <h4 class="font-semibold text-sm text-gray-900">Analitik</h4>
                </div>
              </div>
              <p class="text-xs text-gray-600">Kullanım istatistikleri toplar.</p>
            </div>

            <!-- Pazarlama -->
            <div class="p-3 bg-white rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="preferences.marketing" class="sr-only peer" />
                    <div class="w-8 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                  <h4 class="font-semibold text-sm text-gray-900">Pazarlama</h4>
                </div>
              </div>
              <p class="text-xs text-gray-600">Kişiselleştirilmiş reklamlar.</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button 
              @click="acceptSelected"
              class="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold text-sm"
            >
              Kaydet
            </button>
            <button 
              @click="toggleSettings"
              class="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm"
            >
              Geri
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Mobil için alt banner -->
  <Transition name="slide-up">
    <div v-if="showConsent" class="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:hidden">
      <div class="bg-white rounded-t-2xl shadow-2xl border border-gray-200">
        <div v-if="!showSettings" class="p-4">
          <div class="flex items-start gap-3 mb-3">
            <span class="text-2xl">🍪</span>
            <div class="flex-1">
              <h3 class="text-sm font-bold text-gray-900 mb-1">Çerezleri Kullanıyoruz</h3>
              <p class="text-xs text-gray-600">Daha iyi deneyim için çerezler kullanıyoruz.</p>
            </div>
            <button @click="rejectAll" class="p-1 text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-2">
            <button @click="acceptAll" class="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm">
              Kabul Et
            </button>
            <div class="flex gap-2">
              <button @click="rejectAll" class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs">
                Reddet
              </button>
              <button @click="toggleSettings" class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs">
                Özelleştir
              </button>
            </div>
          </div>
        </div>

        <div v-else class="p-4 max-h-[400px] overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-gray-900">Çerez Ayarları</h3>
            <button @click="toggleSettings" class="p-1 text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-2 mb-3">
            <div class="p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-7 h-4 bg-slate-900 rounded-full relative">
                  <div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
                <h4 class="font-semibold text-xs">Gerekli</h4>
              </div>
              <p class="text-xs text-gray-600">Zorunlu çerezler</p>
            </div>

            <div class="p-2 bg-white rounded-lg border">
              <div class="flex items-center gap-2 mb-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="preferences.functional" class="sr-only peer" />
                  <div class="w-7 h-4 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <h4 class="font-semibold text-xs">Fonksiyonel</h4>
              </div>
              <p class="text-xs text-gray-600">Tercihler</p>
            </div>

            <div class="p-2 bg-white rounded-lg border">
              <div class="flex items-center gap-2 mb-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="preferences.analytics" class="sr-only peer" />
                  <div class="w-7 h-4 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <h4 class="font-semibold text-xs">Analitik</h4>
              </div>
              <p class="text-xs text-gray-600">İstatistikler</p>
            </div>

            <div class="p-2 bg-white rounded-lg border">
              <div class="flex items-center gap-2 mb-1">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="preferences.marketing" class="sr-only peer" />
                  <div class="w-7 h-4 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <h4 class="font-semibold text-xs">Pazarlama</h4>
              </div>
              <p class="text-xs text-gray-600">Reklamlar</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="acceptSelected" class="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">
              Kaydet
            </button>
            <button @click="toggleSettings" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
              Geri
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (min-width: 640px) {
  .sm\:hidden {
    display: none;
  }
}
</style>