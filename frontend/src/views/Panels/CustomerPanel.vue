<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "../../services/api";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import Card from "../../components/Card.vue";
import PageHeader from "../../components/PageHeader.vue";
import EmptyState from "../../components/EmptyState.vue";

const router = useRouter();
const myProducts = ref<any[]>([]);
const soldOrders = ref<any[]>([]);
const purchasedOrders = ref<any[]>([]);
const categories = ref<any[]>([]);
const userId = ref<number | null>(null);
const userRole = ref<string>("");

const newProduct = ref({
  title: "",
  description: "",
  price: 0,
  category_id: null as number | null,
  image_urls: [] as string[],
  features: { renk: "", malzeme: "", marka: "" }
});

const newImageUrl = ref("");
const predefinedSizes = ["XS","S","M","L","XL","XXL","36","38","40","42","44"];
const selectedProductSizes = ref<string[]>([]);

function addImageUrl() {
  if (newImageUrl.value.trim()) {
    newProduct.value.image_urls.push(newImageUrl.value.trim());
    newImageUrl.value = "";
  }
}

function removeImageUrl(index: number) {
  newProduct.value.image_urls.splice(index, 1);
}

async function loadData() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    userId.value = user.id;
    userRole.value = user.role;

    const allProducts = await apiGet("/products");
    myProducts.value = allProducts.filter((p: any) => p.seller_id === user.id);
    
    const allOrders = await apiGet("/orders/my-orders");
    soldOrders.value = allOrders.filter((order: any) => order.seller_id === user.id);
    purchasedOrders.value = allOrders.filter((order: any) => order.buyer_id === user.id);

    const cats = await apiGet("/categories");
    categories.value = cats;
  } catch (error) {
    console.error("Veri yükleme hatası:", error);
  }
}

async function addProduct() {
  if (!newProduct.value.title || !newProduct.value.price || !newProduct.value.category_id) {
    toast.error("Başlık, fiyat ve kategori zorunludur!");
    return;
  }

  if (newProduct.value.image_urls.length === 0) {
    toast.error("En az bir resim URL'si ekleyin!");
    return;
  }

  try {
    const cleanedFeatures: any = {};
    if (newProduct.value.features.renk) cleanedFeatures.Renk = newProduct.value.features.renk;
    if (newProduct.value.features.malzeme) cleanedFeatures.Malzeme = newProduct.value.features.malzeme;
    if (newProduct.value.features.marka) cleanedFeatures.Marka = newProduct.value.features.marka;

    const productData = {
      title: newProduct.value.title,
      description: newProduct.value.description,
      price: newProduct.value.price,
      category_id: newProduct.value.category_id,
      images: newProduct.value.image_urls,
      features: Object.keys(cleanedFeatures).length > 0 ? cleanedFeatures : null,
      sizes: selectedProductSizes.value.length > 0 ? selectedProductSizes.value : undefined
    };

    const res = await apiPost("/products", productData);
    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Ürün başarıyla eklendi!");
    
    newProduct.value = {
      title: "",
      description: "",
      price: 0,
      category_id: null,
      image_urls: [],
      features: { renk: "", malzeme: "", marka: "" }
    };
    selectedProductSizes.value = [];
    
    await loadData();
  } catch (error) {
    console.error("Ürün ekleme hatası:", error);
    toast.error("Ürün eklenirken bir hata oluştu!");
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
      toast.success("Ürün başarıyla silindi!");
      await loadData();
    } else {
      toast.error(data.error || "Ürün silinemedi!");
    }
  } catch (error) {
    console.error("Silme hatası:", error);
    toast.error("Ürün silinirken bir hata oluştu!");
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
      toast.success("Sipariş durumu güncellendi!");
      await loadData();
    } else {
      const data = await res.json();
      toast.error(data.error || "Durum güncellenemedi!");
    }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    toast.error("Durum güncellenirken bir hata oluştu!");
  }
}

function parseFeatures(features: any) {
  if (!features) return null;
  return typeof features === 'string' ? JSON.parse(features) : features;
}

function getFirstImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return 'https://via.placeholder.com/300';
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : imageUrl;
  } catch {
    return imageUrl;
  }
}

function featureEntries(features: any) {
  const f = parseFeatures(features);
  if (!f) return [];
  const hasSizes = Array.isArray(f.sizes) && f.sizes.length > 0;
  return Object.entries(f).filter(([k]) => {
    const lk = String(k).toLowerCase();
    return lk !== 'sizes' && !(hasSizes && ['beden', 'bede', 'size'].includes(lk));
  });
}

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
    toast.error("Bu sayfaya erişim yetkiniz yok!");
    router.push("/");
    return;
  }
  loadData();
});
</script>

<template>
  <div v-if="userRole === 'admin' || userRole === 'customer'" class="max-w-7xl mx-auto p-6">
    <PageHeader title="Kullanıcı Paneli">
      <template #actions>
        <div class="flex justify-end mt-4">
          <Button v-if="userRole === 'admin'" @click="router.push('/admin')">
            🛠️ Admin Yönetim Paneli
          </Button>
        </div>
      </template>
    </PageHeader>

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

    <!-- Yeni İlan Ekle -->
    <Card title="📦 Yeni İlan Ekle" padding="md" class="mb-8 bg-green-50">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input v-model="newProduct.title" placeholder="Ürün başlığı" />
          <Input v-model.number="newProduct.price" type="number" placeholder="Fiyat" />
        </div>

        <textarea 
          v-model="newProduct.description" 
          placeholder="Açıklama" 
          rows="3"
          class="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none"
        />

        <select 
          v-model="newProduct.category_id" 
          class="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none"
        >
          <option :value="null">Kategori seç</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <!-- Resim URL'leri -->
        <Card padding="md" border>
          <h4 class="font-semibold mb-3 text-gray-700">📷 Ürün Resimleri</h4>
          <div class="flex gap-2 mb-3">
            <Input 
              v-model="newImageUrl" 
              placeholder="Resim URL'si ekle (https://...)" 
              @keyup.enter="addImageUrl"
            />
            <Button @click="addImageUrl">Ekle</Button>
          </div>
          
          <div v-if="newProduct.image_urls.length > 0" class="grid grid-cols-3 gap-3">
            <div v-for="(url, index) in newProduct.image_urls" :key="index" class="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden">
              <img :src="url" alt="Ürün resmi" class="w-full h-full object-cover" />
              <button @click="removeImageUrl(index)" class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 text-center py-4">Henüz resim eklenmedi</p>
        </Card>

        <!-- Özellikler -->
        <Card padding="md" border>
          <h4 class="font-semibold mb-3 text-gray-700">Ürün Özellikleri</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Beden:</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="s in predefinedSizes" :key="s" class="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" :value="s" v-model="selectedProductSizes" class="w-4 h-4" />
                  <span class="text-xs">{{ s }}</span>
                </label>
              </div>
            </div>
            <Input v-model="newProduct.features.renk" label="Renk" placeholder="Örn: Siyah, Mavi" />
            <Input v-model="newProduct.features.malzeme" label="Malzeme" placeholder="Örn: %100 Pamuk" />
            <Input v-model="newProduct.features.marka" label="Marka" placeholder="Örn: Nike, Adidas" />
          </div>
        </Card>

        <Button variant="primary" full-width size="md" @click="addProduct">
          Ürün Ekle
        </Button>
      </div>
    </Card>

    <!-- Benim İlanlarım -->
    <Card title="🏷️ Benim İlanlarım" :padding="myProducts.length ? 'md' : 'lg'" class="mb-8">
      <p class="text-sm text-gray-600 mb-4">Toplam {{ myProducts.length }} ilan</p>
      
      <EmptyState 
        v-if="myProducts.length === 0"
        title="Henüz ilan eklemediniz"
        description="Yukarıdan yeni ilan ekleyebilirsiniz"
        icon="product"
      />

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="product in myProducts" :key="product.id" padding="md" hover>
          <RouterLink :to="`/urun/${product.id}`">
            <img :src="getFirstImage(product.image_url)" alt="Ürün" class="w-full h-48 object-cover rounded-lg mb-3 hover:opacity-90 transition" />
          </RouterLink>
          <RouterLink :to="`/urun/${product.id}`">
            <h4 class="font-semibold text-lg mb-1 hover:text-blue-600 transition">{{ product.title }}</h4>
          </RouterLink>
          <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ product.description }}</p>
          <p class="text-gray-500 text-xs mb-2">Kategori: {{ product.category_name }}</p>
          
          <div v-if="featureEntries(product.features).length" class="mb-3">
            <div class="flex flex-wrap gap-2">
              <span v-for="[key, value] in featureEntries(product.features)" :key="key" class="text-xs font-medium px-3 py-1.5 rounded-full border text-black">
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
          
          <p class="font-bold text-lg mb-3 text-gray-900">{{ product.price }} TL</p>
          <Button variant="danger" full-width @click="deleteProduct(product.id)">Sil</Button>
        </Card>
      </div>
    </Card>

    <!-- Sattığım Ürünlerin Siparişleri -->
    <Card title="💼 Sattığım Ürünlerin Siparişleri" padding="md" class="mb-8 bg-blue-50">
      <p class="text-sm text-gray-600 mb-4">Sizin ilanlarınızdan satın alınan ürünler ({{ soldOrders.length }} sipariş)</p>
      
      <EmptyState 
        v-if="soldOrders.length === 0"
        title="Henüz ürünlerinizden sipariş verilmedi"
        icon="cart"
      />

      <div v-else class="space-y-4">
        <Card v-for="order in soldOrders" :key="order.id" padding="md" hover>
          <div class="flex items-start gap-4">
            <img :src="getFirstImage(order.image_url)" alt="Ürün" class="w-24 h-24 object-cover rounded-lg" />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.product_title }}</h3>
              <p class="text-gray-600 text-sm">✉️ Alıcı: {{ order.buyer_email }}</p>
              <p class="text-gray-600 text-sm">📦 Adet: {{ order.quantity }}</p>
              <p v-if="order.sizes && order.sizes.length" class="text-gray-600 text-sm">Bedenler: {{ order.sizes.join(", ") }}</p>
              <p class="font-bold text-lg mt-1">💰 {{ order.total_price }} TL</p>
              <p class="text-gray-500 text-xs mt-1">📅 {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-[140px]">
              <span :class="['px-3 py-1 rounded-full text-sm font-medium text-center', getStatusBadge(order.status)]">
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
        </Card>
      </div>
    </Card>

    <!-- Satın Aldığım Siparişler -->
    <Card title="🛒 Satın Aldığım Siparişler" padding="md" class="bg-purple-50">
      <p class="text-sm text-gray-600 mb-4">Başka satıcılardan satın aldığınız ürünler ({{ purchasedOrders.length }} sipariş)</p>
      
      <EmptyState 
        v-if="purchasedOrders.length === 0"
        title="Henüz ürün satın almadınız"
        icon="cart"
      />

      <div v-else class="space-y-4">
        <Card v-for="order in purchasedOrders" :key="order.id" padding="md" hover>
          <div class="flex items-start gap-4">
            <img :src="getFirstImage(order.image_url)" alt="Ürün" class="w-24 h-24 object-cover rounded-lg" />
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ order.product_title }}</h3>
              <p class="text-gray-600 text-sm">🏪 Satıcı: {{ order.seller_email }}</p>
              <p class="text-gray-600 text-sm">📦 Adet: {{ order.quantity }}</p>
              <p v-if="order.sizes && order.sizes.length" class="text-gray-600 text-sm">Bedenler: {{ order.sizes.join(", ") }}</p>
              <p class="font-bold text-lg mt-1">💰 {{ order.total_price }} TL</p>
              <p class="text-gray-500 text-xs mt-1">📅 {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <span :class="['px-3 py-1 rounded-full text-sm font-medium text-center', getStatusBadge(order.status)]">
                {{ getStatusText(order.status) }}
              </span>
              <div class="text-xs text-gray-500 text-center mt-1 px-2">
                Satıcı tarafından yönetiliyor
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  </div>
</template>