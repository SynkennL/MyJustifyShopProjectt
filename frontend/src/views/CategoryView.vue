<script setup lang="ts">

import { ref, onMounted, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";
import { addToCart } from "../services/cart";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const categorySlug = ref(String(route.params.name));

watch(
  () => route.params.name,
  (newVal) => {
    categorySlug.value = String(newVal);
    loadProducts();
  }
);

const categoryTitles: Record<string, string> = {
  "erkek-giyim": "Erkek Giyim",
  "kadin-giyim": "Kadın Giyim",
  "ayakkabi": "Ayakkabı",
  "cocuk-giyim": "Çocuk Giyim",
};

const products = ref<any[]>([]);
const currentUserId = ref<number | null>(null);
const selectedSizes = reactive<Record<number, string>>({});

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

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }
  loadProducts();
});

async function loadProducts() {
  if (!categorySlug.value) return;
  const res = await apiGet(`/products?category=${categorySlug.value}`);
  const filtered = res.filter(
    (p: any) => p.seller_id !== currentUserId.value
  );
  products.value = filtered;
  products.value.forEach((p: any) => {
    const f = parseFeatures(p.features);
    if (f && Array.isArray(f.sizes) && f.sizes.length > 0) {
      selectedSizes[p.id] = "";
    }
  });
}

function isOwnProduct(product: any) {
  return currentUserId.value && product.seller_id === currentUserId.value;
}

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
    image: product.image_url || "https://via.placeholder.com/300x300?text=No+Image",
    sizes: selectedSize ? [selectedSize] : null,
    seller_id: product.seller_id,
  });
  toast.success(`"${product.title}" sepete eklendi!`);
};

const handleBuyNow = async (product: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  if (isOwnProduct(product)) {
    toast.error("Kendi ürününüzü satın alamazsınız!");
    return;
  }

  const quantity = 1;
  const selectedSize = selectedSizes[product.id]; // string değeri al
  const hasRequiredSize = parseFeatures(product.features)?.sizes; // beden gerekli mi

  if (hasRequiredSize && !selectedSize) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  const res = await apiPost("/orders", {
    product_id: product.id,
    quantity: quantity,
    sizes: selectedSize ? [selectedSize] : undefined // string'i array'e çevir
  });

  if (res.error) {
    toast.error(res.error);
    return;
  }

  toast.success(`"${product.title}" başarıyla satın alındı! Siparişlerinizi panelden takip edebilirsiniz.`);
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-8">{{ categoryTitles[categorySlug] || "Kategori" }}</h1>

    <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="item in products" :key="item.id"
        class="bg-white rounded-xl shadow hover:shadow-xl transition p-4 flex flex-col relative">

        <img :src="item.image_url || 'https://via.placeholder.com/300x300?text=No+Image'" alt="Ürün Resmi"
          class="w-full h-48 object-cover rounded-lg mb-4" />
        <h2 class="text-lg font-semibold mb-1">{{ item.title }}</h2>
        <p class="text-gray-500 text-sm mb-2 line-clamp-3">{{ item.description }}</p>
        <p class="text-gray-600 text-xs mb-1" v-if="item.seller_email">Satıcı: {{ item.seller_email }}</p>

        <div v-if="parseFeatures(item.features) && parseFeatures(item.features).sizes" class="mb-3">
          <label class="text-sm text-gray-600 block mb-2">Beden</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="s in parseFeatures(item.features).sizes" :key="item.id"
              class="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" :value="s" v-model="selectedSizes[item.id]" class="w-4 h-4 rounded" />
              <span>{{ s }}</span>
            </label>
          </div>
        </div>

        <div v-if="featureEntries(item.features).length" class="mb-3">
          <div class="flex flex-wrap gap-1.5">
            <span v-for="([key, value]) in featureEntries(item.features)" :key="item.id"
              class="inline-flex items-center gap-1  text-black text-xs font-medium px-2.5 py-1.5 rounded-full mt-3 shadow-sm border">
              <span class="font-semibold">{{ key }}:</span> {{ value }}
            </span>
          </div>
        </div>

        <p class="text-gray-900 font-bold text-lg mt-auto mb-3">{{ item.price }} TL</p>

        <div class="flex gap-2">
          <button @click="handleAddToCart(item)"
            class="flex-1 bg-gray-900 text-white font-medium py-2 rounded hover:bg-gray-800 transition">
            Sepete Ekle
          </button>
          <button @click="handleBuyNow(item)"
            class="flex-1 bg-green-600 text-white font-medium py-2 rounded hover:bg-green-700 transition">
            Satın Al
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-gray-500 text-lg">
      Bu kategoride henüz ürün bulunmuyor.
    </p>
  </div>
</template>