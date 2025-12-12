<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { compareList, removeFromCompare, clearCompare } from "../../services/compare";
import { addToCart } from "../../services/cart";
import { toast } from "vue3-toastify";
import Button from "../../components/common/Button.vue";
import EmptyState from "../../components/common/EmptyState.vue";
import PageHeader from "../../components/layout/PageHeader.vue";

const router = useRouter();

const getFirstImage = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return 'https://via.placeholder.com/300';
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : imageUrl;
  } catch {
    return imageUrl;
  }
};

const parseFeatures = (features: any) => {
  if (!features) return null;
  return typeof features === 'string' ? JSON.parse(features) : features;
};

const allFeatureKeys = computed(() => {
  const keys = new Set<string>();
  compareList.value.forEach(product => {
    const features = parseFeatures(product.features);
    if (features) {
      Object.keys(features).forEach(key => {
        if (key.toLowerCase() !== 'sizes') keys.add(key);
      });
    }
  });
  return Array.from(keys);
});

const getFeatureValue = (product: any, key: string) => {
  const features = parseFeatures(product.features);
  return features?.[key] || '-';
};

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
      <PageHeader 
        title="Ürün Karşılaştırma" 
        description="Ürünleri yan yana karşılaştırın ve en iyisini seçin"
      >
        <template #actions>
          <div class="flex items-center gap-3 justify-end mt-4">
            <Button 
              v-if="compareList.length > 0"
              variant="danger"
              @click="clearCompare"
            >
              Tümünü Temizle
            </Button>
            <Button @click="router.push('/')">
              Alışverişe Dön
            </Button>
          </div>
        </template>
      </PageHeader>

      <EmptyState
        v-if="compareList.length === 0"
        title="Karşılaştırma listesi boş"
        description="Ürün sayfalarından karşılaştırma ikonuna tıklayarak ürün ekleyin"
        icon="compare"
        action-text="Ürünleri Keşfet"
        action-to="/"
      />

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
                    <Button full-width @click="handleAddToCart(product)">
                      Sepete Ekle
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="p-4 font-medium text-gray-900 sticky left-0 bg-white">Açıklama</td>
                <td v-for="product in compareList" :key="product.id" class="p-4 text-sm text-gray-600">
                  {{ product.description || '-' }}
                </td>
              </tr>

              <tr 
                v-for="featureKey in allFeatureKeys" 
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

      <div v-if="compareList.length > 0" class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-800">
            <strong>İpucu:</strong> En fazla 3 ürün karşılaştırabilirsiniz. Daha fazla ürün eklemek için mevcut ürünlerden birini kaldırın.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>