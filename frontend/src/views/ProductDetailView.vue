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
  <div v-if="loading" class="flex justify-center items-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
  </div>

  <div v-else-if="product" class="max-w-6xl mx-auto px-4 py-6">
    <button @click="router.back()" class="text-gray-600 hover:text-gray-900 mb-4 text-sm flex items-center gap-1">
      ← Geri
    </button>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Sol: Resimler -->
      <div>
        <div class="relative border rounded-lg overflow-hidden bg-white mb-3">
          <img :src="product.images[currentImageIndex]" :alt="product.title"
            class="w-full aspect-square object-cover" />
          <button v-if="product.images.length > 1" @click="prevImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button v-if="product.images.length > 1" @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div v-if="product.images.length > 1" class="flex gap-2 overflow-x-auto">
          <button v-for="(image, index) in product.images" :key="index" @click="changeImage(index)" :class="[
            'flex-shrink-0 w-16 h-16 rounded border-2',
            currentImageIndex === index ? 'border-gray-900' : 'border-gray-200'
          ]">
            <img :src="image" class="w-full h-full object-cover rounded" />
          </button>
        </div>
      </div>

      <!-- Sağ: Bilgiler -->
      <div>
        <h1 class="text-2xl font-bold mb-2">{{ product.title }}</h1>
        <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>

        <div class="text-3xl font-bold text-gray-900 mb-4">{{ product.price }} TL</div>

        <div class="text-sm text-gray-600 mb-4">
          Satıcı: <span class="font-medium text-gray-900">{{ product.seller_name || product.seller_email }}</span>
        </div>

        <div v-if="featureEntries(product.features).length" class="mb-2 pb-4">
          <div class="text-sm font-semibold mb-2">Özellikler</div>
          <div class="text-sm space-y-1">
            <div v-for="([key, value]) in featureEntries(product.features)" :key="key" class="flex">
              <span class="text-gray-600 w-24">{{ key }}:</span>
              <span class="font-medium">{{ value }}</span>
            </div>
          </div>
        </div>

        <div v-if="parseFeatures(product.features)?.sizes" class="mb-4">
          <div class="text-sm font-semibold mb-2">Beden</div>

          <div class="flex flex-wrap gap-2">
            <label v-for="size in parseFeatures(product.features).sizes" :key="size"
              class="flex items-center gap-1 cursor-pointer">
              <input type="radio" :value="size" v-model="selectedSize" name="sizeGroup" class="w-3 h-3" />
              {{ size }}
            </label>
          </div>
        </div>

        <div class="mb-4">
          <div class="text-sm font-semibold mb-2">Miktar</div>
          <div class="flex items-center gap-2">
            <button @click="quantity = Math.max(1, quantity - 1)" class="w-8 h-8 border rounded hover:bg-gray-50">
              -
            </button>
            <span class="w-12 text-center">{{ quantity }}</span>
            <button @click="quantity = quantity + 1" class="w-8 h-8 border rounded hover:bg-gray-50">
              +
            </button>
          </div>
        </div>

        <div v-if="isOwnProduct()" class="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          Kendi ürününüzü satın alamazsınız
        </div>

        <div class="flex gap-2">
          <button @click="handleAddToCart" :disabled:="isOwnProduct()" :class="[
            'flex-1 py-2.5 rounded font-medium',
            isOwnProduct()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          ]">
            Sepete Ekle
          </button>
          <button @click="handleBuyNow" :disabled:="isOwnProduct()" :class="[
            'flex-1 py-2.5 rounded font-medium',
            isOwnProduct()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          ]">
            Satın Al
          </button>
        </div>

        <div class="mt-1 pt-3">
          <RouterLink :to="`/kategori/${product.category_slug}`" class="text-sm text-gray-600 hover:text-gray-900">
            Kategori: {{ product.category_name }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>