<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "../services/api";
import { useRouter } from "vue-router";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category_name: string;
  image_url?: string;
  features?: any;
}

interface SoldOrder {
  id: number;
  product_title: string;
  quantity: number;
  total_price: number;
  status: string;
  buyer_email: string;
  image_url?: string;
  created_at: string;
}

interface PurchasedOrder {
  id: number;
  product_title: string;
  quantity: number;
  total_price: number;
  status: string;
  seller_email: string;
  image_url?: string;
  created_at: string;
}

const router = useRouter();
const myProducts = ref<Product[]>([]);
const soldOrders = ref<SoldOrder[]>([]);
const purchasedOrders = ref<PurchasedOrder[]>([]);
const categories = ref<any[]>([]);
const userId = ref<number | null>(null);
const userRole = ref<string>("");

// Yeni ürün formu
const newProduct = ref({
  title: "",
  description: "",
  price: 0,
  category_id: null as number | null,
  image_url: "",
  features: {
    beden: "",
    renk: "",
    malzeme: "",
    marka: ""
  }
});

async function loadData() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userId.value = user.id;
    userRole.value = user.role;

    const allProducts = await apiGet("/products");
    myProducts.value = allProducts.filter((p: any) => p.seller_id === user.id);
    
    const allOrders = await apiGet("/orders/my-orders");
    
    soldOrders.value = allOrders.filter((order: any) => 
      order.seller_id === user.id
    );
    
    purchasedOrders.value = allOrders.filter((order: any) => 
      order.buyer_id === user.id
    );

    const cats = await apiGet("/categories");
    categories.value = cats;
  } catch (error) {
    console.error("Veri yükleme hatası:", error);
  }
}

async function addProduct() {
  if (!newProduct.value.title || !newProduct.value.price || !newProduct.value.category_id) {
    alert("Başlık, fiyat ve kategori zorunludur!");
    return;
  }

  try {
    // Özellikleri temizle (boş değerleri kaldır)
    const cleanedFeatures: any = {};
    
    if (newProduct.value.features.beden) cleanedFeatures.Beden = newProduct.value.features.beden;
    if (newProduct.value.features.renk) cleanedFeatures.Renk = newProduct.value.features.renk;
    if (newProduct.value.features.malzeme) cleanedFeatures.Malzeme = newProduct.value.features.malzeme;
    if (newProduct.value.features.marka) cleanedFeatures.Marka = newProduct.value.features.marka;

    const productData = {
      title: newProduct.value.title,
      description: newProduct.value.description,
      price: newProduct.value.price,
      category_id: newProduct.value.category_id,
      image_url: newProduct.value.image_url,
      features: Object.keys(cleanedFeatures).length > 0 ? cleanedFeatures : null
    };

    const res = await apiPost("/products", productData);
    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Ürün başarıyla eklendi!");
    
    // Formu sıfırla
    newProduct.value = {
      title: "",
      description: "",
      price: 0,
      category_id: null,
      image_url: "",
      features: {
        beden: "",
        renk: "",
        malzeme: "",
        marka: ""
      }
    };
    
    await loadData();
  } catch (error) {
    console.error("Ürün ekleme hatası:", error);
    alert("Ürün eklenirken bir hata oluştu!");
  }
}

async function deleteProduct(productId: number) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:4000/api"}/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Ürün başarıyla silindi!");
      await loadData();
    } else {
      alert(data.error || "Ürün silinemedi!");
    }
  } catch (error) {
    console.error("Silme hatası:", error);
    alert("Ürün silinirken bir hata oluştu!");
  }
}

async function updateOrderStatus(orderId: number, newStatus: string) {
  const token = localStorage.getItem("token");
  try {
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
      const data = await res.json();
      alert(data.error || "Durum güncellenemedi!");
    }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    alert("Durum güncellenirken bir hata oluştu!");
  }
}

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

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== 'customer' && user.role !== 'admin') {
    alert("Bu sayfaya erişim yetkiniz yok!");
    router.push("/");
    return;
  }
});
</script>

<template>
  <div v-if="userRole === 'admin' || userRole==='customer'" class="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">
        {{ userRole === 'admin' ? 'Yönetici Paneli' : '👤 Kullanıcı Paneli' }}
      </h2>
      <button 
        v-if="userRole === 'admin'" 
        @click="router.push('/admin')"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        🛠️ Admin Yönetim Paneli
      </button>
    </div>

    <div v-if="userRole === 'admin'" class="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-indigo-800">
          <strong>Yönetici Olarak:</strong> Kendi ürünlerinizi satabilir, alabilir ve yönetebilirsiniz. Ayrıca tüm kullanıcıların ürünlerini ve kategorileri yönetmek için yukarıdaki "Admin Yönetim Paneli" butonuna tıklayın.
        </div>
      </div>
    </div>

    <section class="mb-8 p-4 border rounded-lg bg-green-50">
      <h3 class="font-semibold mb-3 text-lg">📦 Yeni İlan Ekle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="newProduct.title" placeholder="Ürün başlığı" class="input" />
        <input v-model.number="newProduct.price" type="number" placeholder="Fiyat" class="input" />
        <textarea v-model="newProduct.description" placeholder="Açıklama" class="input" rows="3"></textarea>
        <input v-model="newProduct.image_url" placeholder="Resim URL" class="input" />
        <select v-model="newProduct.category_id" class="input">
          <option :value="null">Kategori seç</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <!-- ÖZELLİKLER BÖLÜMÜ -->
      <div class="mt-4 p-4 rounded-lg border border-gray-200">
        <h4 class="font-semibold mb-3 text-gray-700 flex items-center gap-2">
          Ürün Özellikleri
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Beden</label>
            <input v-model="newProduct.features.beden" 
                   placeholder="Örn: XL, 42, M-L" 
                   class="input text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Renk</label>
            <input v-model="newProduct.features.renk" 
                   placeholder="Örn: Siyah, Mavi" 
                   class="input text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Malzeme</label>
            <input v-model="newProduct.features.malzeme" 
                   placeholder="Örn: %100 Pamuk" 
                   class="input text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Marka</label>
            <input v-model="newProduct.features.marka" 
                   placeholder="Örn: Nike, Adidas" 
                   class="input text-sm" />
          </div>
        </div>
      </div>

      <button @click="addProduct" class="btn mt-4 w-full">Ürün Ekle</button>
    </section>

    <section class="mb-8 p-4 border rounded-lg">
      <h3 class="font-semibold mb-4 text-lg">🏷️ Benim İlanlarım ({{ myProducts.length }})</h3>
      
      <div v-if="myProducts.length === 0" class="text-center py-10 text-gray-500">
        Henüz ilan eklemediniz. Yukarıdan yeni ilan ekleyebilirsiniz.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in myProducts" :key="product.id" class="border rounded-lg p-4 hover:shadow-lg transition bg-white">
          <img 
            :src="product.image_url || 'https://via.placeholder.com/300'" 
            alt="Ürün" 
            class="w-full h-48 object-cover rounded-lg mb-3"
          />
          <h4 class="font-semibold text-lg mb-1">{{ product.title }}</h4>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ product.description }}</p>
          <p class="text-gray-500 text-xs mb-2">Kategori: {{ product.category_name }}</p>
          
          <div v-if="parseFeatures(product.features)" class="mb-3">
            <div class="flex flex-wrap gap-2">
              <span v-for="(value, key) in parseFeatures(product.features)" :key="key"
                    class="inline-flex items-center gap-1 text-black text-xs font-medium px-3 py-1.5 rounded-full border">
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
          
          <p class="font-bold text-lg mb-3 text-gray-900">{{ product.price }} TL</p>
          <button @click="deleteProduct(product.id)" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
            Sil
          </button>
        </div>
      </div>
    </section>

    <section class="mb-8 p-4 border rounded-lg bg-blue-50">
      <h3 class="font-semibold mb-4 text-lg">💼 Sattığım Ürünlerin Siparişleri ({{ soldOrders.length }})</h3>
      <p class="text-sm text-gray-600 mb-4">Sizin ilanlarınızdan satın alınan ürünler. Sipariş durumlarını buradan yönetebilirsiniz.</p>
      
      <div v-if="soldOrders.length === 0" class="text-center py-10 text-gray-500">
        Henüz ürünlerinizden sipariş verilmedi.
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in soldOrders" :key="order.id" class="bg-white border rounded-lg p-4 hover:shadow-lg transition">
          <div class="flex items-start gap-4">
            <img 
              :src="order.image_url || 'https://via.placeholder.com/100'" 
              alt="Ürün" 
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.product_title }}</h3>
              <p class="text-gray-600 text-sm">✉️ Alıcı: {{ order.buyer_email }}</p>
              <p class="text-gray-600 text-sm">📦 Adet: {{ order.quantity }}</p>
              <p class="font-bold text-lg mt-1">💰 {{ order.total_price }} TL</p>
              <p class="text-gray-500 text-xs mt-1">📅 {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-[140px]">
              <span 
                :class="['px-3 py-1 rounded-full text-sm font-medium text-center', getStatusBadge(order.status)]"
              >
                {{ getStatusText(order.status) }}
              </span>
              <select 
                @change="(e) => updateOrderStatus(order.id, (e.target as HTMLSelectElement).value)"
                class="text-sm border rounded px-2 py-1.5 bg-white cursor-pointer"
              >
                <option value="">Durum Değiştir</option>
                <option value="confirmed">✅ Onayla</option>
                <option value="shipped">🚚 Kargola</option>
                <option value="delivered">✔️ Teslim Et</option>
                <option value="cancelled">❌ İptal Et</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="p-4 border rounded-lg bg-purple-50">
      <h3 class="font-semibold mb-4 text-lg">🛒 Satın Aldığım Siparişler ({{ purchasedOrders.length }})</h3>
      <p class="text-sm text-gray-600 mb-4">Başka satıcılardan satın aldığınız ürünler. Sipariş durumunu takip edebilirsiniz.</p>
      
      <div v-if="purchasedOrders.length === 0" class="text-center py-10 text-gray-500">
        Henüz ürün satın almadınız.
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in purchasedOrders" :key="order.id" class="bg-white border rounded-lg p-4 hover:shadow-lg transition">
          <div class="flex items-start gap-4">
            <img 
              :src="order.image_url || 'https://via.placeholder.com/100'" 
              alt="Ürün" 
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.product_title }}</h3>
              <p class="text-gray-600 text-sm">🏪 Satıcı: {{ order.seller_email }}</p>
              <p class="text-gray-600 text-sm">📦 Adet: {{ order.quantity }}</p>
              <p class="font-bold text-lg mt-1">💰 {{ order.total_price }} TL</p>
              <p class="text-gray-500 text-xs mt-1">📅 {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <span 
                :class="['px-3 py-1 rounded-full text-sm font-medium text-center', getStatusBadge(order.status)]"
              >
                {{ getStatusText(order.status) }}
              </span>
              <div class="text-xs text-gray-500 text-center mt-1 px-2">
                Satıcı tarafından yönetiliyor
              </div>
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