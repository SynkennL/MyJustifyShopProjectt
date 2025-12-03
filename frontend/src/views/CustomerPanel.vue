<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "../services/api";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category_name: string;
  image_url?: string;
}

interface Order {
  id: number;
  product_title: string;
  quantity: number;
  total_price: number;
  status: string;
  buyer_email: string;
  image_url?: string;
  created_at: string;
}

const myProducts = ref<Product[]>([]);
const myOrders = ref<Order[]>([]);
const categories = ref<any[]>([]);

// Yeni ürün formu
const newProduct = ref({
  title: "",
  description: "",
  price: 0,
  category_id: null as number | null,
  image_url: ""
});

async function loadData() {
  // Tüm ürünleri al ve sadece kendi ürünlerimi filtrele
  const allProducts = await apiGet("/products");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  myProducts.value = allProducts.filter((p: any) => p.seller_id === user.id);
  
  // Bana gelen siparişleri al (benim ürünlerimi satın alanlar)
  const orders = await apiGet("/orders/my-orders");
  myOrders.value = orders;

  // Kategorileri yükle
  const cats = await apiGet("/categories");
  categories.value = cats;
}

async function addProduct() {
  if (!newProduct.value.title || !newProduct.value.price) {
    alert("Başlık ve fiyat zorunludur!");
    return;
  }

  const res = await apiPost("/products", newProduct.value);
  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Ürün başarıyla eklendi!");
  newProduct.value = { title: "", description: "", price: 0, category_id: null, image_url: "" };
  await loadData();
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
    await loadData();
  } else {
    alert("Ürün silinemedi!");
  }
}

async function updateOrderStatus(orderId: number, newStatus: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:4000/api"}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  if (res.ok) {
    alert("Sipariş durumu güncellendi!");
    await loadData();
  } else {
    alert("Durum güncellenemedi!");
  }
}

onMounted(loadData);

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('tr-TR');
}

function getStatusBadge(status: string) {
  const badges: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return badges[status] || 'bg-gray-100 text-gray-800';
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi'
  };
  return texts[status] || status;
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-bold mb-6">Müşteri Paneli</h2>

    <!-- Yeni Ürün Ekle -->
    <section class="mb-8 p-4 border rounded-lg">
      <h3 class="font-semibold mb-3 text-lg">Yeni Ürün Ekle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="newProduct.title" placeholder="Ürün başlığı" class="input" />
        <input v-model.number="newProduct.price" type="number" placeholder="Fiyat" class="input" />
        <textarea v-model="newProduct.description" placeholder="Açıklama" class="input" rows="3"></textarea>
        <input v-model="newProduct.image_url" placeholder="Resim URL" class="input" />
        <select v-model="newProduct.category_id" class="input">
          <option :value="null">Kategori seç</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button @click="addProduct" class="btn">Ürün Ekle</button>
      </div>
    </section>

    <!-- Benim Ürünlerim -->
    <section class="mb-8 p-4 border rounded-lg">
      <h3 class="font-semibold mb-4 text-lg">Benim Ürünlerim ({{ myProducts.length }})</h3>
      
      <div v-if="myProducts.length === 0" class="text-center py-10 text-gray-500">
        Henüz ürün eklemediniz.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in myProducts" :key="product.id" class="border rounded-lg p-4 hover:shadow-lg transition">
          <img 
            :src="product.image_url || 'https://via.placeholder.com/300'" 
            alt="Ürün" 
            class="w-full h-48 object-cover rounded-lg mb-3"
          />
          <h4 class="font-semibold text-lg mb-1">{{ product.title }}</h4>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ product.description }}</p>
          <p class="text-gray-500 text-xs mb-2">Kategori: {{ product.category_name }}</p>
          <p class="font-bold text-lg mb-3">{{ product.price }} TL</p>
          <button @click="deleteProduct(product.id)" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
            Sil
          </button>
        </div>
      </div>
    </section>

    <!-- Gelen Siparişler -->
    <section class="p-4 border rounded-lg">
      <h3 class="font-semibold mb-4 text-lg">Gelen Siparişler ({{ myOrders.length }})</h3>
      
      <div v-if="myOrders.length === 0" class="text-center py-10 text-gray-500">
        Henüz sipariş bulunmuyor.
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in myOrders" :key="order.id" class="border rounded-lg p-4 hover:shadow-lg transition">
          <div class="flex items-start gap-4">
            <img 
              :src="order.image_url || 'https://via.placeholder.com/100'" 
              alt="Ürün" 
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.product_title }}</h3>
              <p class="text-gray-600 text-sm">Müşteri: {{ order.buyer_email }}</p>
              <p class="text-gray-600 text-sm">Adet: {{ order.quantity }}</p>
              <p class="font-bold text-lg mt-1">{{ order.total_price }} TL</p>
              <p class="text-gray-500 text-xs mt-1">Tarih: {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <span 
                :class="['px-3 py-1 rounded-full text-sm font-medium text-center', getStatusBadge(order.status)]"
              >
                {{ getStatusText(order.status) }}
              </span>
              <select 
                @change="(e) => updateOrderStatus(order.id, (e.target as HTMLSelectElement).value)"
                class="text-sm border rounded px-2 py-1"
              >
                <option value="">Durum Değiştir</option>
                <option value="confirmed">Onayla</option>
                <option value="shipped">Kargola</option>
                <option value="delivered">Teslim Et</option>
                <option value="cancelled">İptal Et</option>
              </select>
            </div>
          </div>
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
}
.btn:hover {
  background-color: #111827;
}
</style>