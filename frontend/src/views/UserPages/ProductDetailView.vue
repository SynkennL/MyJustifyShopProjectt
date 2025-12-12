<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiGet, apiPost } from "../../services/api";
import { addToCart } from "../../services/cart";
import { toast } from "vue3-toastify";
import Button from "../../components/common/Button.vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import Card from "../../components/common/Card.vue";

const route = useRoute();
const router = useRouter();
const product = ref<any>(null);
const loading = ref(true);
const currentImageIndex = ref(0);
const selectedSize = ref("");
const currentUserId = ref<number | null>(null);
const quantity = ref(1);

const isOwnProduct = computed(() => {
  if (!currentUserId.value || !product.value?.seller_id) return false;
  return product.value.seller_id === currentUserId.value;
});

const features = computed(() => {
  if (!product.value?.features) return null;
  const f = typeof product.value.features === 'string' 
    ? JSON.parse(product.value.features) 
    : product.value.features;
  return f;
});

const displayFeatures = computed(() => {
  if (!features.value) return [];
  const hasSizes = Array.isArray(features.value.sizes) && features.value.sizes.length > 0;
  return Object.entries(features.value).filter(([k]) => {
    const lk = k.toLowerCase();
    return lk !== 'sizes' && !(hasSizes && ['beden', 'bede', 'size'].includes(lk));
  });
});

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUserId.value = JSON.parse(userStr).id;
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
        product.value.images = Array.isArray(parsed) ? parsed : [product.value.image_url];
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

const handleAddToCart = () => {
  if (isOwnProduct.value) {
    toast.error("Kendi ürününüzü sepete ekleyemezsiniz!");
    return;
  }

  if (features.value?.sizes && !selectedSize.value) {
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

  if (isOwnProduct.value) {
    toast.error("Kendi ürününüzü satın alamazsınız!");
    return;
  }

  if (features.value?.sizes && !selectedSize.value) {
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

const changeImage = (index: number) => currentImageIndex.value = index;
const nextImage = () => {
  if (product.value.images.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % product.value.images.length;
  }
};
const prevImage = () => {
  if (product.value.images.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0
      ? product.value.images.length - 1
      : currentImageIndex.value - 1;
  }
};
</script>

<template>
  <LoadingSpinner v-if="loading" />

  <div v-else-if="product" class="max-w-6xl mx-auto px-4 py-6">
    <button @click="router.back()" class="text-gray-600 hover:text-gray-900 mb-4 text-sm flex items-center gap-1 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Geri
    </button>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Resimler -->
      <div>
        <div class="relative border rounded-lg overflow-hidden bg-white mb-3">
          <img :src="product.images[currentImageIndex]" :alt="product.title" class="w-full aspect-square object-cover" />
          <button v-if="product.images.length > 1" @click="prevImage" class="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow hover:bg-gray-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button v-if="product.images.length > 1" @click="nextImage" class="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow hover:bg-gray-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div v-if="product.images.length > 1" class="flex gap-2 overflow-x-auto">
          <button 
            v-for="(image, index) in product.images" 
            :key="index" 
            @click="changeImage(index)" 
            :class="['flex-shrink-0 w-16 h-16 rounded border-2', currentImageIndex === index ? 'border-gray-900' : 'border-gray-200']"
          >
            <img :src="image" class="w-full h-full object-cover rounded" />
          </button>
        </div>
      </div>

      <!-- Bilgiler -->
      <div>
        <h1 class="text-2xl font-bold mb-2">{{ product.title }}</h1>
        <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>
        <div class="text-3xl font-bold text-gray-900 mb-4">{{ product.price }} TL</div>
        <div class="text-sm text-gray-600 mb-4">
          Satıcı: <span class="font-medium text-gray-900">{{ product.seller_name || product.seller_email }}</span>
        </div>

        <Card v-if="displayFeatures.length" padding="md" class="mb-4">
          <div class="text-sm font-semibold mb-2">Özellikler</div>
          <div class="text-sm space-y-1">
            <div v-for="[key, value] in displayFeatures" :key="key" class="flex">
              <span class="text-gray-600 w-24">{{ key }}:</span>
              <span class="font-medium">{{ value }}</span>
            </div>
          </div>
        </Card>

        <div v-if="features?.sizes" class="mb-4">
          <div class="text-sm font-semibold mb-2">Beden</div>
          <div class="flex flex-wrap gap-2">
            <label v-for="size in features.sizes" :key="size" class="flex items-center gap-1 cursor-pointer">
              <input type="radio" :value="size" v-model="selectedSize" name="sizeGroup" class="w-3 h-3" />
              {{ size }}
            </label>
          </div>
        </div>

        <div class="mb-4">
          <div class="text-sm font-semibold mb-2">Miktar</div>
          <div class="flex items-center gap-2">
            <Button size="sm" @click="quantity = Math.max(1, quantity - 1)">-</Button>
            <span class="w-12 text-center">{{ quantity }}</span>
            <Button size="sm" @click="quantity = quantity + 1">+</Button>
          </div>
        </div>

        <div v-if="isOwnProduct" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          Kendi ürününüzü satın alamazsınız
        </div>

        <div class="flex gap-2">
          <Button flex @click="handleAddToCart" :disabled="isOwnProduct">
            Sepete Ekle
          </Button>
          <Button flex variant="success" @click="handleBuyNow" :disabled="isOwnProduct">
            Satın Al
          </Button>
        </div>

        <div class="mt-4 pt-3">
          <RouterLink :to="`/kategori/${product.category_slug}`" class="text-sm text-gray-600 hover:text-gray-900 transition">
            Kategori: {{ product.category_name }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>