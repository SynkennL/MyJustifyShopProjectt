<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiDelete } from "../../services/api";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import Card from "../../components/Card.vue";
import PageHeader from "../../components/PageHeader.vue";
import EmptyState from "../../components/EmptyState.vue";

const router = useRouter();

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
  try {
    const cats = await apiGet<Category[]>("/categories");
    categories.value = cats;
    
    const products = await apiGet<Product[]>("/products");
    allProducts.value = products;
  } catch (error) {
    console.error("Veri yükleme hatası:", error);
    toast.error("Veriler yüklenirken bir hata oluştu!");
  }
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

async function addCategory() {
  if (!catName.value || !catSlug.value) {
    toast.error("Kategori adı ve slug gereklidir!");
    return;
  }

  try {
    await apiPost("/categories", { 
      name: catName.value, 
      slug: catSlug.value 
    });
    
    toast.success("Kategori eklendi!");
    catName.value = "";
    catSlug.value = "";
    await load();
  } catch (error: any) {
    toast.error(error.error || "Kategori eklenirken bir hata oluştu!");
  }
}

async function deleteProduct(productId: number) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

  try {
    await apiDelete(`/products/${productId}`);
    toast.success("Ürün silindi!");
    await load();
  } catch (error: any) {
    toast.error(error.error || "Ürün silinemedi!");
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== 'admin') {
    toast.error("Bu sayfaya erişim yetkiniz yok!");
    router.push("/");
    return;
  }
  load();
});
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <PageHeader title="🛠️ Admin Yönetim Paneli">
      <template #actions>
        <div class="flex justify-end mt-4">
          <Button @click="router.push('/customer-panel')">
            ← Kişisel Panelime Dön
          </Button>
        </div>
      </template>
    </PageHeader>

    <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="text-sm text-yellow-800">
          <strong>Not:</strong> Bu sayfa sadece site yönetimi içindir. Kendi ürünlerinizi ve siparişlerinizi yönetmek için "Kişisel Panelime Dön" butonuna tıklayın.
        </div>
      </div>
    </div>

    <!-- Kategori Ekle -->
    <Card title="➕ Kategori Ekle" padding="md" class="mb-8">
      <div class="flex gap-2">
        <Input v-model="catName" placeholder="Kategori adı" />
        <Input v-model="catSlug" placeholder="Slug (örn: erkek-giyim)" />
        <Button variant="success" @click="addCategory">Ekle</Button>
      </div>
    </Card>

    <!-- Mevcut Kategoriler -->
    <Card title="📂 Mevcut Kategoriler" padding="md" class="mb-8">
      <EmptyState 
        v-if="categories.length === 0"
        title="Henüz kategori bulunmuyor"
        icon="product"
      />

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div v-for="cat in categories" :key="cat.id" class="bg-gray-100 p-3 rounded text-center">
          <p class="font-medium">{{ cat.name }}</p>
          <p class="text-xs text-gray-500">{{ cat.slug }}</p>
        </div>
      </div>
    </Card>

    <!-- Tüm Ürünler -->
    <Card title="🏪 Tüm Kullanıcı Ürünleri" padding="md">
      <p class="text-sm text-gray-600 mb-4">Toplam {{ allProducts.length }} ürün</p>
      
      <EmptyState 
        v-if="allProducts.length === 0"
        title="Henüz ürün bulunmuyor"
        icon="product"
      />

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="product in allProducts" :key="product.id" padding="md" hover>
          <img 
            :src="getFirstImage(product.image_url)" 
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
          <Button variant="danger" full-width @click="deleteProduct(product.id)">
            Sil
          </Button>
        </Card>
      </div>
    </Card>
  </div>
</template>