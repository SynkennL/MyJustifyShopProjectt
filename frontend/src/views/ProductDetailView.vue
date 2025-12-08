<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";
import { addToCart } from "../services/cart";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const product = ref<any>(null);
const loading = ref(true);
const currentImageIndex = ref(0);
const selectedSize = ref("");
const currentUserId = ref<number | null>(null);
const quantity = ref(1);

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }
  await loadProduct();
});

async function loadProduct() {
  try {
    loading.value = true;
    const productId = route.params.id;
    const data = await apiGet(`/products/${productId}`);
    product.value = data;

    // image_url'i parse et (artık JSON array olabilir)
    if (product.value.image_url) {
      try {
        const parsed = JSON.parse(product.value.image_url);
        if (Array.isArray(parsed)) {
          product.value.images = parsed;
        } else {
          product.value.images = [product.value.image_url];
        }
      } catch {
        product.value.images = [product.value.image_url];
      }
    } else {
      product.value.images = ['https://via.placeholder.com/600x600?text=No+Image'];
    }
  } catch (error) {
    console.error("Ürün yüklenirken hata:", error);
    toast.error("Ürün bulunamadı!");
    router.push("/");
  } finally {
    loading.value = false;
  }
}

function parseFeatures(features: any) {
  if (!features) return null;
  if (typeof features === 'string') {
    try {
      return JSON.parse(features);
    } catch {
      return null;
    }
  }
  return features;
}

function featureEntries(features: any) {
  const f = parseFeatures(features);
  if (!f) return [];
  const hasSizes = Array.isArray(f.sizes) && f.sizes.length > 0;
  return Object.entries(f).filter(([k]) => {
    const lk = String(k).toLowerCase();
    if (lk === 'sizes') return false;
    if (hasSizes && (lk === 'beden' || lk === 'bede' || lk === 'size')) return false;
    return true;
  });
}

function isOwnProduct() {
  return currentUserId.value && product.value?.seller_id === currentUserId.value;
}

const handleAddToCart = () => {
  if (isOwnProduct()) {
    toast.error("Kendi ürününüzü sepete ekleyemezsiniz!");
    return;
  }

  const features = parseFeatures(product.value.features);
  const hasRequiredSize = features?.sizes;

  if (hasRequiredSize && !selectedSize.value) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  for (let i = 0; i < quantity.value; i++) {
    addToCart({
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      image: product.value.images[0],
      sizes: selectedSize.value ? [selectedSize.value] : null,
      seller_id: product.value.seller_id,
    });
  }
  
  toast.success(`"${product.value.title}" (${quantity.value} adet) sepete eklendi!`);
};

const handleBuyNow = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  if (isOwnProduct()) {
    toast.error("Kendi ürününüzü satın alamazsınız!");
    return;
  }

  const features = parseFeatures(product.value.features);
  const hasRequiredSize = features?.sizes;

  if (hasRequiredSize && !selectedSize.value) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  const res = await apiPost("/orders", {
    product_id: product.value.id,
    quantity: quantity.value,
    sizes: selectedSize.value ? [selectedSize.value] : undefined
  });

  if (res.error) {
    toast.error(res.error);
    return;
  }

  toast.success(`"${product.value.title}" başarıyla satın alındı!`);
  router.push("/customer-panel");
};

function changeImage(index: number) {
  currentImageIndex.value = index;
}

function nextImage() {
  if (product.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length;
  }
}

function prevImage() {
  if (product.value.images.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? product.value.images.length - 1 
      : currentImageIndex.value - 1;
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-screen">
    <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900"></div>
  </div>

  <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Geri Dön Butonu -->
    <button 
      @click="router.back()"
      class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Geri Dön
    </button>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Resim Galerisi -->
      <div class="space-y-4">
        <!-- Ana Resim -->
        <div class="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
          <img 
            :src="product.images[currentImageIndex]" 
            :alt="product.title"
            class="w-full h-full object-cover"
          />
          
          <!-- Resim Navigasyon Butonları -->
          <div v-if="product.images.length > 1" class="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="prevImage"
              class="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              @click="nextImage"
              class="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Resim Sayacı -->
          <div v-if="product.images.length > 1" class="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {{ currentImageIndex + 1 }} / {{ product.images.length }}
          </div>
        </div>

        <!-- Küçük Resimler -->
        <div v-if="product.images.length > 1" class="grid grid-cols-4 sm:grid-cols-5 gap-3">
          <button
            v-for="(image, index) in product.images"
            :key="index"
            @click="changeImage(index)"
            :class="[
              'aspect-square rounded-lg overflow-hidden border-2 transition',
              currentImageIndex === index 
                ? 'border-gray-900 ring-2 ring-gray-900' 
                : 'border-gray-200 hover:border-gray-400'
            ]"
          >
            <img :src="image" :alt="`${product.title} - ${index + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Ürün Bilgileri -->
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.title }}</h1>
          <p class="text-gray-600">{{ product.description }}</p>
        </div>

        <!-- Fiyat -->
        <div class="border-t border-b border-gray-200 py-4">
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold text-gray-900">{{ product.price }} TL</span>
          </div>
        </div>

        <!-- Satıcı Bilgisi -->
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm text-gray-600">Satıcı</p>
            <p class="font-semibold text-gray-900">{{ product.seller_name || product.seller_email }}</p>
          </div>
        </div>

        <!-- Özellikler -->
        <div v-if="featureEntries(product.features).length" class="space-y-3">
          <h3 class="font-semibold text-gray-900">Ürün Özellikleri</h3>
          <div class="grid grid-cols-2 gap-3">
            <div 
              v-for="([key, value]) in featureEntries(product.features)" 
              :key="key"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <p class="text-xs text-gray-600 mb-1">{{ key }}</p>
              <p class="font-semibold text-gray-900">{{ value }}</p>
            </div>
          </div>
        </div>

        <!-- Beden Seçimi -->
        <div v-if="parseFeatures(product.features)?.sizes" class="space-y-3">
          <h3 class="font-semibold text-gray-900">Beden Seçimi</h3>
          <div class="flex flex-wrap gap-2">
            <label 
              v-for="size in parseFeatures(product.features).sizes" 
              :key="size"
              :class="[
                'px-6 py-3 border-2 rounded-lg cursor-pointer transition font-medium',
                selectedSize === size 
                  ? 'border-gray-900 bg-gray-900 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              ]"
            >
              <input type="radio" :value="size" v-model="selectedSize" class="sr-only" />
              {{ size }}
            </label>
          </div>
        </div>

        <!-- Miktar Seçimi -->
        <div class="space-y-3">
          <h3 class="font-semibold text-gray-900">Miktar</h3>
          <div class="flex items-center gap-3">
            <button 
              @click="quantity = Math.max(1, quantity - 1)"
              class="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              -
            </button>
            <span class="w-16 text-center text-xl font-semibold">{{ quantity }}</span>
            <button 
              @click="quantity = quantity + 1"
              class="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              +
            </button>
          </div>
        </div>

        <!-- Uyarı Mesajı (Kendi Ürünü) -->
        <div v-if="isOwnProduct()" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-blue-800">Bu sizin ürününüz. Kendi ürününüzü satın alamazsınız.</p>
          </div>
        </div>

        <!-- Aksiyon Butonları -->
        <div class="flex gap-3">
          <button 
            @click="handleAddToCart"
            :disabled:="isOwnProduct()"
            :class="[
              'flex-1 py-4 rounded-lg font-semibold transition text-lg',
              isOwnProduct() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            ]"
          >
            Sepete Ekle
          </button>
          <button 
            @click="handleBuyNow"
            :disabled:="isOwnProduct()"
            :class="[
              'flex-1 py-4 rounded-lg font-semibold transition text-lg',
              isOwnProduct() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            ]"
          >
            Hemen Satın Al
          </button>
        </div>

        <!-- Kategori -->
        <div class="border-gray-200">
          <RouterLink 
            :to="`/kategori/${product.category_slug}`"
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            {{ product.category_name }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>