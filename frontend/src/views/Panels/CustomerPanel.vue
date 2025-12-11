<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiDelete, apiPatch } from "../../services/api";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Button from "../../components/Button.vue";
import Card from "../../components/Card.vue";
import PageHeader from "../../components/PageHeader.vue";
import EmptyState from "../../components/EmptyState.vue";
import OrderCard from "../../components/OrderCard.vue";
import ProductForm from "../../components/ProductForm.vue";

const router = useRouter();
const myProducts = ref<any[]>([]);
const soldOrders = ref<any[]>([]);
const purchasedOrders = ref<any[]>([]);
const categories = ref<any[]>([]);
const userId = ref<number | null>(null);
const userRole = ref<string>("");

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== 'customer' && user.role !== 'admin') {
    toast.error("Bu sayfaya erişim yetkiniz yok!");
    router.push("/");
    return;
  }
  userId.value = user.id;
  userRole.value = user.role;
  loadData();
});

async function loadData() {
  try {
    const [allProducts, allOrders, cats] = await Promise.all([
      apiGet<any[]>("/products"),
      apiGet<any[]>("/orders/my-orders"),
      apiGet<any[]>("/categories")
    ]);

    myProducts.value = allProducts.filter((p: any) => p.seller_id === userId.value);
    soldOrders.value = allOrders.filter((order: any) => order.seller_id === userId.value);
    purchasedOrders.value = allOrders.filter((order: any) => order.buyer_id === userId.value);
    categories.value = cats;
  } catch (error) {
    console.error("Veri yükleme hatası:", error);
    toast.error("Veriler yüklenirken bir hata oluştu!");
  }
}

async function handleProductSubmit(productData: any, sizes: string[]) {
  if (!productData.title || !productData.price || !productData.category_id) {
    toast.error("Başlık, fiyat ve kategori zorunludur!");
    return;
  }

  if (productData.image_urls.length === 0) {
    toast.error("En az bir resim URL'si ekleyin!");
    return;
  }

  try {
    const cleanedFeatures: any = {};
    Object.entries(productData.features).forEach(([key, value]) => {
      if (value) cleanedFeatures[key.charAt(0).toUpperCase() + key.slice(1)] = value;
    });

    const data = {
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      images: productData.image_urls,
      features: Object.keys(cleanedFeatures).length > 0 ? cleanedFeatures : null,
      sizes: sizes.length > 0 ? sizes : undefined
    };

    await apiPost("/products", data);
    toast.success("Ürün başarıyla eklendi!");
    await loadData();
  } catch (error: any) {
    console.error("Ürün ekleme hatası:", error);
    toast.error(error.error || "Ürün eklenirken bir hata oluştu!");
  }
}

async function deleteProduct(productId: number) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

  try {
    await apiDelete(`/products/${productId}`);
    toast.success("Ürün başarıyla silindi!");
    await loadData();
  } catch (error: any) {
    console.error("Silme hatası:", error);
    toast.error(error.error || "Ürün silinemedi!");
  }
}

async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    await apiPatch(`/orders/${orderId}/status`, { status: newStatus });
    toast.success("Sipariş durumu güncellendi!");
    await loadData();
  } catch (error: any) {
    console.error("Durum güncelleme hatası:", error);
    toast.error(error.error || "Durum güncellenirken bir hata oluştu!");
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
      <ProductForm :categories="categories" @submit="handleProductSubmit" />
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
        <OrderCard 
          v-for="order in soldOrders" 
          :key="order.id" 
          :order="order" 
          type="sold"
          :on-status-change="updateOrderStatus"
        />
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
        <OrderCard 
          v-for="order in purchasedOrders" 
          :key="order.id" 
          :order="order" 
          type="purchased"
        />
      </div>
    </Card>
  </div>
</template>