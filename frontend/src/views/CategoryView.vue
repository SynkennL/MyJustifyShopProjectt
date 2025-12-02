<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

// Başlangıçta URL parametresini al
const categoryName = ref(String(route.params.name))

// Route değişirse categoryName güncellenir
watch(
  () => route.params.name,
  (newVal) => {
    categoryName.value = String(newVal)
  }
)

// Kategori başlıkları
const categoryTitles: Record<string, string> = {
  "erkek-giyim": "Erkek Giyim",
  "kadin-giyim": "Kadın Giyim",
  "ayakkabi": "Ayakkabı",
  "cocuk-giyim": "Çocuk Giyim",
}

// Ürünler
const products: Record<string, any[]> = {
  "erkek-giyim": [
    { id: 1, name: "Erkek Mont", price: 799 },
    { id: 2, name: "Sweatshirt", price: 349 },
  ],
  "kadin-giyim": [
    { id: 3, name: "Kadın Elbise", price: 699 },
    { id: 4, name: "Bluz", price: 299 },
  ],
  "ayakkabi": [
    { id: 5, name: "Spor Ayakkabı", price: 999 },
  ],
  "cocuk-giyim": [
    { id: 8, name: "Çocuk Tişörtü", price: 149 },
    { id: 9, name: "Çocuk Pantolon", price: 199 },
  ],
}

// Kategoriye göre ürünler
const categoryProducts = computed(() => {
  return products[categoryName.value] || []
})
</script>


<template>
  <div class="p-6">

    <!-- Kategori Başlığı -->
    <h1 class="text-3xl font-bold mb-6">
  {{ categoryTitles[categoryName] || "Kategori" }}
    </h1>

    <!-- Ürün Grid -->
    <div v-if="categoryProducts.length" class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <div
        v-for="item in categoryProducts"
        :key="item.id"
        class="border p-4 rounded-xl shadow hover:shadow-lg transition"
      >
        <h2 class="font-semibold text-lg">{{ item.name }}</h2>
        <p class="text-gray-500">{{ item.price }} TL</p>
      </div>
    </div>

    <!-- Ürün yoksa -->
    <p v-else class="text-gray-500 text-lg">
      Bu kategoride henüz ürün bulunmuyor.
    </p>

  </div>
</template>
