<script setup lang="ts">
import { useRouter } from "vue-router";
import { compareList, removeFromCompare, clearCompare } from "../services/compare";
import { addToCart } from "../services/cart";
import { toast } from "vue3-toastify";

const router = useRouter();

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

function getAllFeatureKeys() {
  const allKeys = new Set<string>();
  compareList.value.forEach(product => {
    const features = parseFeatures(product.features);
    if (features) {
      Object.keys(features).forEach(key => {
        if (key.toLowerCase() !== 'sizes') {
          allKeys.add(key);
        }
      });
    }
  });
  return Array.from(allKeys);
}

function getFeatureValue(product: any, key: string) {
  const features = parseFeatures(product.features);
  return features?.[key] || '-';
}

const handleAddToCart = (product: any) => {
  addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: getFirstImage(product.image_url),
    seller_id: product.seller_id,
  });
  toast.success(`"${product.title}" sepete eklendi!`);
};

const handleRemove = (productId: number) => {
  removeFromCompare(productId);
  toast.success("Ürün karşılaştırmadan kaldırıldı!");
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Ürün Karşılaştırma</h1>
          <p class="text-gray-600 mt-1">Ürünleri yan yana karşılaştırın ve en iyisini seçin</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            v-if="compareList.length > 0"
            @click="clearCompare"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            Tümünü Temizle
          </button>
          <button 
            @click="router.push('/')"
            class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Alışverişe Dön
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="compareList.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Karşılaştırma listesi boş</h2>
        <p class="text-gray-600 mb-6">Ürün sayfalarından karşılaştırma ikonuna tıklayarak ürün ekleyin</p>
        <button 
          @click="router.push('/')"
          class="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          Ürünleri Keşfet
        </button>
      </div>

      <!-- Comparison Table -->
      <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left p-4 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">Özellikler</th>
                <th v-for="product in compareList" :key="product.id" class="p-4 min-w-[280px]">
                  <div class="relative">
                    <button 
                      @click="handleRemove(product.id)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <img 
                      :src="getFirstImage(product.image_url)" 
                      :alt="product.title"
                      class="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <RouterLink 
                      :to="`/urun/${product.id}`"
                      class="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 block mb-2"
                    >
                      {{ product.title }}
                    </RouterLink>
                    <div class="text-2xl font-bold text-gray-900 mb-2">{{ product.price }} TL</div>
                    <div class="text-sm text-gray-600 mb-3">{{ product.category_name }}</div>
                    <button 
                      @click="handleAddToCart(product)"
                      class="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                    >
                      Sepete Ekle
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Açıklama -->
              <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="p-4 font-medium text-gray-900 sticky left-0 bg-white">Açıklama</td>
                <td v-for="product in compareList" :key="product.id" class="p-4 text-sm text-gray-600">
                  {{ product.description || '-' }}
                </td>
              </tr>

              <!-- Özellikler -->
              <tr 
                v-for="featureKey in getAllFeatureKeys()" 
                :key="featureKey"
                class="border-b border-gray-200 hover:bg-gray-50"
              >
                <td class="p-4 font-medium text-gray-900 sticky left-0 bg-white">{{ featureKey }}</td>
                <td v-for="product in compareList" :key="product.id" class="p-4 text-sm text-gray-600">
                  {{ getFeatureValue(product, featureKey) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Info Box -->
      <div v-if="compareList.length > 0" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="text-sm text-blue-800">
            <strong>İpucu:</strong> En fazla 3 ürün karşılaştırabilirsiniz. Daha fazla ürün eklemek için mevcut ürünlerden birini kaldırın.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>