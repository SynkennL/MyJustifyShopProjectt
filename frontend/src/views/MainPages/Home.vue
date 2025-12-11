<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { apiGet } from "../../services/api";
import { loadFavoriteIds } from "../../services/favorites";
import ProductCard from "../../components/ProductCard.vue";
import EmptyState from "../../components/EmptyState.vue";
import LoadingSpinner from "../../components/LoadingSpinner.vue";
import Button from "../../components/Button.vue";

const popularProducts = ref<any[]>([]);
const categoryProducts = ref<any[]>([]);
const selectedCategory = ref<string>("erkek-giyim");
const selectedSizes = reactive<Record<number, string>>({});
const isLoadingCategory = ref<boolean>(false);
const currentUserId = ref<number | null>(null);

const categories = [
  { name: "Erkek Giyim", slug: "erkek-giyim" },
  { name: "Kadın Giyim", slug: "kadin-giyim" },
  { name: "Ayakkabı", slug: "ayakkabi" },
  { name: "Çocuk Giyim", slug: "cocuk-giyim" }
];

const categoryImages: Record<string, string> = {
  "erkek-giyim": "../../assets/erkek-giyim.jpeg",
  "kadin-giyim": "../../assets/kadın-giyim.jpg",
  "ayakkabi": "../../assets/ayakkabi3.jpg",
  "cocuk-giyim": "../../assets/cocuk-giyim.jpg"
};

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUserId.value = JSON.parse(userStr).id;
  }

  await Promise.all([
    loadPopularProducts(),
    loadCategoryProducts(selectedCategory.value),
    loadFavoriteIds()
  ]);
});

async function loadPopularProducts() {
  try {
    const products = await apiGet("/products/popular");
    popularProducts.value = products.filter((p: any) => p.seller_id !== currentUserId.value);
  } catch (error) {
    console.error("Popüler ürünler yüklenirken hata:", error);
  }
}

async function loadCategoryProducts(categorySlug: string) {
  isLoadingCategory.value = true;
  try {
    const products = await apiGet(`/products?category=${categorySlug}`);
    categoryProducts.value = products
      .filter((p: any) => p.seller_id !== currentUserId.value)
      .slice(0, 4);
  } catch (error) {
    console.error("Kategori ürünleri yüklenirken hata:", error);
    categoryProducts.value = [];
  } finally {
    isLoadingCategory.value = false;
  }
}

async function selectCategory(categorySlug: string) {
  selectedCategory.value = categorySlug;
  await loadCategoryProducts(categorySlug);
}

function isOwnProduct(product: any): boolean {
  if (!currentUserId.value || !product?.seller_id) return false;
  return product.seller_id === currentUserId.value;
}

const handleRefresh = () => {
  loadPopularProducts();
};
</script>

<template>
  <!-- Hero Slider -->
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <div data-hs-carousel='{"loadingClasses": "opacity-0"}' class="relative">
      <div class="hs-carousel relative overflow-hidden w-full h-96 md:h-[500px] bg-gray-100 rounded-xl">
        <div class="hs-carousel-body absolute top-0 bottom-0 start-0 flex flex-nowrap transition-transform duration-700 opacity-0">
          <div class="hs-carousel-slide">
            <div class="h-96 md:h-[500px] flex flex-col bg-[url('./assets/herodiscountbanner1.png')] bg-cover bg-center bg-no-repeat relative">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div class="mt-auto w-2/3 md:max-w-lg ps-6 pb-6 md:ps-12 md:pb-12 relative z-10">
                <span class="block text-white text-sm font-bold mb-3 bg-red-600 px-4 py-2 rounded-lg inline-block shadow-lg">
                  Yılbaşı İndirimleri
                </span>
                <span class="block text-white text-2xl md:text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight">
                  Şuanda mevcut olan yılbaşı indirimlerinden ürünlerimizden satın alarak yararlanabilirsiniz!
                </span>
              </div>
            </div>
          </div>
          <div class="hs-carousel-slide">
            <div class="h-96 md:h-[500px] flex flex-col bg-[url('./assets/herobanner2.png')] bg-cover bg-center bg-no-repeat relative">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div class="mt-auto w-2/3 md:max-w-lg ps-6 pb-6 md:ps-12 md:pb-12 relative z-10">
                <span class="block text-white text-sm font-bold mb-3 bg-blue-600 px-4 py-2 rounded-lg inline-block shadow-lg">
                  Açılışa Özel İndirim
                </span>
                <span class="block text-white text-2xl md:text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight">
                  Açılışa özel uygun ve indirimli fiyatlı ürünler sizi bekliyor!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="hs-carousel-prev hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 start-0 inline-flex justify-center items-center w-10 h-full text-white hover:bg-black/20 rounded-s-xl">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
        </svg>
      </button>

      <button type="button" class="hs-carousel-next hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 end-0 inline-flex justify-center items-center w-10 h-full text-white hover:bg-black/20 rounded-e-xl">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Popüler Ürünler -->
  <div class="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Popüler Ürünler</h2>
        <p class="text-gray-600">En çok satın alınan ürünlerimiz</p>
      </div>

      <EmptyState 
        v-if="popularProducts.length === 0"
        title="Henüz popüler ürün bulunmuyor"
        icon="product"
      />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        <ProductCard
          v-for="product in popularProducts"
          :key="product.id"
          :product="product"
          :selected-size="selectedSizes[product.id]"
          @update:selected-size="selectedSizes[product.id] = $event"
          :is-owned="isOwnProduct(product)"
          @refresh="handleRefresh"
        />
      </div>
    </div>
  </div>

  <!-- Keşfedilebilir Ürünler -->
  <div class="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Keşfedilebilir Ürünler</h2>
        <p class="text-gray-600">İlgini çeken kategorideki ürünleri keşfet</p>
      </div>

      <div class="flex flex-wrap gap-3 mb-8">
        <Button 
          v-for="category in categories" 
          :key="category.slug"
          variant="primary"
          @click="selectCategory(category.slug)"
        >
          {{ category.name }}
        </Button>
      </div>

      <LoadingSpinner v-if="isLoadingCategory" text="Ürünler yükleniyor..." />

      <EmptyState 
        v-else-if="categoryProducts.length === 0"
        title="Bu kategoride henüz ürün bulunmuyor"
        icon="product"
      />

      <div v-else>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          <ProductCard
            v-for="product in categoryProducts"
            :key="product.id"
            :product="product"
            :selected-size="selectedSizes[product.id]"
            @update:selected-size="selectedSizes[product.id] = $event"
            :is-owned="isOwnProduct(product)"
            @refresh="loadCategoryProducts(selectedCategory)"
          />
        </div>

        <div class="text-center mt-8">
          <RouterLink :to="`/kategori/${selectedCategory}`">
            <Button variant="primary" size="lg">
              Tümünü Gör
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Popüler Kategoriler -->
  <div class="px-4 sm:px-6 lg:px-8 py-12 bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Popüler Kategoriler</h2>
        <p class="text-gray-600">En çok tercih edilen kategorilerimizi keşfedin</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <RouterLink 
          v-for="category in categories"
          :key="category.slug"
          :to="`/kategori/${category.slug}`" 
          class="group"
        >
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative overflow-hidden aspect-video">
              <img 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                :src="categoryImages[category.slug]" 
                :alt="category.name"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5">{{ category.name }}</h3>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>