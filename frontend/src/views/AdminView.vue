<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "../services/api";

// Kategori tipi
interface Category {
  id: number;
  name: string;
  slug: string;
}

const categories = ref<Category[]>([]);
const catName = ref("");
const catSlug = ref("");

const prodTitle = ref("");
const prodPrice = ref(0);
const prodDesc = ref("");
const prodCategory = ref<number | null>(null);
const prodImage = ref("");

async function load() {
  const res = await apiGet("/categories");
  categories.value = res;
}

async function addCategory() {
  const res = await apiPost("/categories", { name: catName.value, slug: catSlug.value });
  if (res.error) { alert(res.error); return; }
  catName.value = ""; catSlug.value = "";
  await load();
}

async function addProduct() {
  const res = await apiPost("/products", { 
    title: prodTitle.value, 
    price: prodPrice.value, 
    description: prodDesc.value, 
    category_id: prodCategory.value,
    image_url: prodImage.value
  });
  if (res.error) { alert(res.error); return; }
  prodTitle.value = ""; prodDesc.value = ""; prodPrice.value = 0; prodImage.value = "";
  await load();
}

onMounted(load);
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">Yönetim Paneli</h2>

    <!-- Kategori Ekle -->
    <section class="mb-6">
      <h3 class="font-semibold mb-2">Kategori Ekle</h3>
      <input v-model="catName" placeholder="Kategori adı" class="input mb-2" />
      <input v-model="catSlug" placeholder="Slug" class="input mb-2" />
      <button @click="addCategory" class="btn">Ekle</button>
    </section>

    <!-- Ürün Ekle -->
    <section class="mb-6">
      <h3 class="font-semibold mb-2">Ürün Ekle</h3>
      <input v-model="prodTitle" placeholder="Ürün başlığı" class="input mb-2" />
      <input v-model.number="prodPrice" placeholder="Fiyat" class="input mb-2" />
      <textarea v-model="prodDesc" placeholder="Açıklama" class="input mb-2"></textarea>
      <input v-model="prodImage" placeholder="Resim URL" class="input mb-2" />
      <select v-model="prodCategory" class="input mb-2">
        <option :value="null">Kategori seç</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button @click="addProduct" class="btn">Ürün Ekle</button>
    </section>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
.btn {
  padding: 0.5rem 1rem;
  background-color: #1f2937;
  color: white;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn:hover {
  background-color: #111827;
}
</style>
