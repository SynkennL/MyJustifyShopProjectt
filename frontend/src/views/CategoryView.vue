<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { apiGet } from "../services/api";
import { addToCart } from "../services/cart";

const route = useRoute();
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

async function loadProducts() {
  if (!categorySlug.value) return;
  const res = await apiGet(`/products?category=${categorySlug.value}`);
  products.value = res;
}

onMounted(loadProducts);

const handleAddToCart = (product: any) => {
  addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image || "https://via.placeholder.com/300x300?text=No+Image",
  });
  alert(`${product.title} sepete eklendi!`);
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-8">{{ categoryTitles[categorySlug] || "Kategori" }}</h1>

    <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="item in products" :key="item.id" class="bg-white rounded-xl shadow hover:shadow-xl transition p-4 flex flex-col">
        <img :src="item.image || 'https://via.placeholder.com/300x300?text=No+Image'" alt="Ürün Resmi" class="w-full h-48 object-cover rounded-lg mb-4"/>
        <h2 class="text-lg font-semibold mb-1">{{ item.title }}</h2>
        <p class="text-gray-500 text-sm mb-2 line-clamp-3">{{ item.description }}</p>
        <p class="text-gray-900 font-bold text-lg mt-auto">{{ item.price }} TL</p>
        <button @click="handleAddToCart(item)" class="mt-3 bg-gray-900 text-white font-medium py-2 rounded hover:bg-gray-800 transition">
          Sepete Ekle
        </button>
      </div>
    </div>

    <p v-else class="text-gray-500 text-lg">
      Bu kategoride henüz ürün bulunmuyor.
    </p>
  </div>
</template>
