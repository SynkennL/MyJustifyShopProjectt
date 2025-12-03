<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "../services/api";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category_name: string;
  seller_email: string;
  seller_name: string;
  image_url?: string;
}

const categories = ref<Category[]>([]);
const allProducts = ref<Product[]>([]);
const catName = ref("");
const catSlug = ref("");

async function load() {
  const cats = await apiGet("/categories");
  categories.value = cats;
  
  const products = await apiGet("/products");
  allProducts.value = products;
}

async function addCategory() {
  const res = await apiPost("/categories", { name: catName.value, slug: catSlug.value });
  if (res.error) { alert(res.error); return; }
  catName.value = ""; catSlug.value = "";
  await load();
}

async function deleteProduct(productId: number) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:4000/api"}/products/${productId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (res.ok) {
    alert("Ürün silindi!");
    await load();
  } else {
    alert("Ürün silinemedi!");
  }
}

onMounted(load);
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-bold mb-6">Yönetim Paneli</h2>

    <!-- Kategori Ekle -->
    <section class="mb-8 p-4 border rounded-lg">
      <h3 class="font-semibold mb-3 text-lg">Kategori Ekle</h3>
      <div class="flex gap-2">
        <input v-model="catName" placeholder="Kategori adı" class="input flex-1" />
        <input v-model="catSlug" placeholder="Slug (örn: erkek-giyim)" class="input flex-1" />
        <button @click="addCategory" class="btn">Ekle</button>
      </div>
    </section>

    <!-- Mevcut Kategoriler -->
    <section class="mb-8 p-4 border rounded-lg">
      <h3 class="font-semibold mb-3 text-lg">Mevcut Kategoriler</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div v-for="cat in categories" :key="cat.id" class="bg-gray-100 p-2 rounded text-center">
          <p class="font-medium">{{ cat.name }}</p>
          <p class="text-xs text-gray-500">{{ cat.slug }}</p>
        </div>
      </div>
    </section>

    <!-- Tüm Ürünler -->
    <section class="p-4 border rounded-lg">
      <h3 class="font-semibold mb-4 text-lg">Tüm Müşteri Ürünleri ({{ allProducts.length }})</h3>
      
      <div v-if="allProducts.length === 0" class="text-center py-10 text-gray-500">
        Henüz ürün bulunmuyor.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in allProducts" :key="product.id" class="border rounded-lg p-4 hover:shadow-lg transition">
          <img 
            :src="product.image_url || 'https://via.placeholder.com/300'" 
            alt="Ürün" 
            class="w-full h-48 object-cover rounded-lg mb-3"
          />
          <h4 class="font-semibold text-lg mb-1">{{ product.title }}</h4>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ product.description }}</p>
          <p class="text-gray-500 text-xs mb-1">Kategori: {{ product.category_name }}</p>
          <p class="text-gray-500 text-xs mb-2">
            Satıcı: {{ product.seller_name || product.seller_email }}
          </p>
          <p class="font-bold text-lg mb-3">{{ product.price }} TL</p>
          <button @click="deleteProduct(product.id)" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
            Sil
          </button>
        </div>
      </div>
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
  white-space: nowrap;
}
.btn:hover {
  background-color: #111827;
}
</style>