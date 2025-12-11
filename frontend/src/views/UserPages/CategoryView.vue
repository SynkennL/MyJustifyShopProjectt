<script setup lang="ts">
import { ref, onMounted, watch, reactive } from "vue";
import { useRoute } from "vue-router";
import { apiGet } from "../../services/api";
import { loadFavoriteIds } from "../../services/favorites";
import ProductCard from "../../components/ProductCard.vue";
import EmptyState from "../../components/EmptyState.vue";
import PageHeader from "../../components/PageHeader.vue";

const route = useRoute();
const categorySlug = ref(String(route.params.name));
const products = ref<any[]>([]);
const currentUserId = ref<number | null>(null);
const selectedSizes = reactive<Record<number, string>>({});

const categoryTitles: Record<string, string> = {
  "erkek-giyim": "Erkek Giyim",
  "kadin-giyim": "Kadın Giyim",
  "ayakkabi": "Ayakkabı",
  "cocuk-giyim": "Çocuk Giyim",
};

watch(
  () => route.params.name,
  (newVal) => {
    categorySlug.value = String(newVal);
    loadProducts();
  }
);

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUserId.value = JSON.parse(userStr).id;
  }
  loadProducts();
  loadFavoriteIds();
});

async function loadProducts() {
  if (!categorySlug.value) return;
  const res = await apiGet(`/products?category=${categorySlug.value}`);
  products.value = res.filter((p: any) => p.seller_id !== currentUserId.value);
}

function isOwnProduct(product: any): boolean {
  if (!currentUserId.value || !product?.seller_id) return false;
  return product.seller_id === currentUserId.value;
}
</script>

<template>
  <div class="p-6">
    <PageHeader 
      :title="categoryTitles[categorySlug] || 'Kategori'" 
      show-back
    />

    <EmptyState
      v-if="products.length === 0"
      title="Bu kategoride henüz ürün bulunmuyor"
      icon="product"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :selected-size="selectedSizes[product.id]"
        @update:selected-size="selectedSizes[product.id] = $event"
        :is-owned="isOwnProduct(product)"
        @refresh="loadProducts"
      />
    </div>
  </div>
</template>