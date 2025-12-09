<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";
import { addToCart } from "../services/cart";
import { removeFromFavorites } from "../services/favorites";
import { toast } from "vue3-toastify";

const router = useRouter();
const favorites = ref<any[]>([]);
const loading = ref(true);
const selectedSizes = reactive<Record<number, string>>({});
const currentUserId = ref<number | null>(null);

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Favorileri görmek için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }

  await loadFavorites();
});

async function loadFavorites() {
  try {
    loading.value = true;
    const data = await apiGet("/favorites");
    favorites.value = data;

    favorites.value.forEach((p: any) => {
      const f = parseFeatures(p.features);
      if (f && Array.isArray(f.sizes) && f.sizes.length > 0) {
        selectedSizes[p.id] = "";
      }
    });
  } catch (error) {
    console.error("Favoriler yüklenemedi:", error);
    toast.error("Favoriler yüklenirken bir hata oluştu!");
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

function getFirstImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return 'https://via.placeholder.com/300';
  try {
    const parsed = JSON.parse(imageUrl);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch {
    return imageUrl;
  }
  return imageUrl;
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

function isOwnProduct(product: any) {
  return currentUserId.value && product.seller_id === currentUserId.value;
}

const handleRemoveFavorite = async (productId: number) => {
  try {
    await removeFromFavorites(productId);
    toast.success("Favorilerden kaldırıldı!");
    await loadFavorites();
  } catch (error) {
    toast.error("Favorilerden kaldırılamadı!");
  }
};

const handleAddToCart = (product: any) => {
  if (isOwnProduct(product)) {
    toast.error("Kendi ürününüzü sepete ekleyemezsiniz!");
    return;
  }

  const selectedSize = selectedSizes[product.id];
  const hasRequiredSize = parseFeatures(product.features)?.sizes;

  if (hasRequiredSize && !selectedSize) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: getFirstImage(product.image_url),
    sizes: selectedSize ? [selectedSize] : null,
    seller_id: product.seller_id,
  });
  toast.success(`"${product.title}" sepete eklendi!`);
};

const handleBuyNow = async (product: any) => {
  if (isOwnProduct(product)) {
    toast.error("Kendi ürününüzü satın alamazsınız!");
    return;
  }

  const selectedSize = selectedSizes[product.id];
  const hasRequiredSize = parseFeatures(product.features)?.sizes;

  if (hasRequiredSize && !selectedSize) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  const res = await apiPost("/orders", {
    product_id: product.id,
    quantity: 1,
    sizes: selectedSize ? [selectedSize] : undefined
  });

  if (res.error) {
    toast.error(res.error);
    return;
  }

  toast.success(`"${product.title}" başarıyla satın alındı!`);
  router.push("/customer-panel");
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Favorilerim</h1>
        <p class="text-gray-600 mt-1">Beğendiğiniz ürünleri buradan takip edebilirsiniz</p>
      </div>
      <button 
        @click="router.push('/')"
        class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Alışverişe Devam
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900"></div>
    </div>

    <div v-else-if="favorites.length === 0" class="text-center py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Henüz favori ürününüz yok</h2>
      <p class="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek kolayca takip edebilirsiniz</p>
      <button 
        @click="router.push('/')"
        class="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
      >
        Ürünleri Keşfet
      </button>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="product in favorites" 
          :key="product.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition relative group"
        >
          <button 
            @click="handleRemoveFavorite(product.id)"
            class="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
            title="Favorilerden çıkar"
          >
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <RouterLink :to="`/urun/${product.id}`" class="block relative overflow-hidden aspect-square">
            <img 
              :src="getFirstImage(product.image_url)" 
              :alt="product.title"
              class="w-full h-full object-cover hover:opacity-90 transition"
            />
          </RouterLink>

          <div class="p-4">
            <RouterLink :to="`/urun/${product.id}`">
              <h3 class="font-semibold text-lg text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition">
                {{ product.title }}
              </h3>
            </RouterLink>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ product.description }}</p>

            <div v-if="featureEntries(product.features).length" class="mb-3">
              <div class="flex flex-wrap gap-1.5">
                <span 
                  v-for="([key, value]) in featureEntries(product.features)" 
                  :key="key"
                  class="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>

            <div v-if="parseFeatures(product.features)?.sizes" class="mb-3">
              <label class="text-xs text-gray-600 block mb-2">Beden:</label>
              <div class="flex flex-wrap gap-1.5">
                <label 
                  v-for="size in parseFeatures(product.features).sizes" 
                  :key="size">
                  <input type="radio" :value="size" v-model="selectedSizes" name="sizeGroup" class="w-3 h-3" />
                  {{ size }}
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl font-bold text-gray-900">{{ product.price }} TL</span>
              <span class="text-xs text-gray-500">{{ product.category_name }}</span>
            </div>

            <div v-if="!isOwnProduct(product)" class="flex gap-2">
              <button 
                @click="handleAddToCart(product)"
                class="flex-1 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition font-medium text-sm"
              >
                Sepete Ekle
              </button>
              <button 
                @click="handleBuyNow(product)"
                class="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium text-sm"
              >
                Satın Al
              </button>
            </div>

            <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
              <p class="text-xs text-blue-800">Sizin ürününüz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>