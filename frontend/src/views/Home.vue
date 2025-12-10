<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";
import { addToCart } from "../services/cart";
import { toast } from "vue3-toastify";
import { isFavorite, toggleFavorite, loadFavoriteIds } from "../services/favorites";
import { addToCompare, removeFromCompare, isInCompare, MAX_COMPARE, compareList } from "../services/compare";

const router = useRouter();
const popularProducts = ref<any[]>([]);
const currentUserId = ref<number | null>(null);
const selectedCategory = ref<string>("erkek-giyim");
const categoryProducts = ref<any[]>([]);
const selectedSizes = reactive<Record<number, string>>({});
const isLoadingCategory = ref<boolean>(false);

const categories = [
  { name: "Erkek Giyim", slug: "erkek-giyim" },
  { name: "Kadın Giyim", slug: "kadin-giyim" },
  { name: "Ayakkabı", slug: "ayakkabi" },
  { name: "Çocuk Giyim", slug: "cocuk-giyim" }
];

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

function featureEntries(features: any) {
  const f = parseFeatures(features);
  if (!f) return [];
  const hasSizes = Array.isArray(f.sizes) && f.sizes.length > 0;
  return Object.entries(f).filter(([k]) => {
    const lk = String(k).toLowerCase();
    if (lk === 'sizes') return false;
    if (hasSizes && (lk === 'beden' || lk === 'bede' || lk === 'size')) return false;
    return true;
  });
}

function getFirstImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return 'https://via.placeholder.com/300';
  try {
    const parsed = JSON.parse(imageUrl);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0];
    }
  } catch {
    return imageUrl;
  }
  return imageUrl;
}

// Karşılaştırma fonksiyonu
const handleToggleCompare = (product: any) => {
  if (isInCompare(product.id)) {
    removeFromCompare(product.id);
    toast.success("Ürün karşılaştırmadan kaldırıldı!");
  } else {
    if (compareList.value.length >= MAX_COMPARE) {
      toast.error(`En fazla ${MAX_COMPARE} ürün karşılaştırabilirsiniz!`);
      return;
    }
    const success = addToCompare({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: getFirstImage(product.image_url),
      category_name: product.category_name,
      features: product.features,
      description: product.description
    });
    if (success) {
      toast.success("Ürün karşılaştırmaya eklendi!");
    }
  }
};

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }

  try {
    const products = await apiGet("/products/popular");

    const filtered = products.filter(
      (p: any) => p.seller_id !== currentUserId.value
    );

    popularProducts.value = filtered;

    filtered.forEach((p: any) => {
      const f = parseFeatures(p.features);
      if (f && Array.isArray(f.sizes) && f.sizes.length > 0) {
        selectedSizes[p.id] = "";
      }
    });
  } catch (error) {
    console.error("Popüler ürünler yüklenirken hata:", error);
  }

  await loadCategoryProducts(selectedCategory.value);
  await loadFavoriteIds();
});

async function loadCategoryProducts(categorySlug: string) {
  isLoadingCategory.value = true;
  try {
    const products = await apiGet(`/products?category=${categorySlug}`);

    const filtered = products.filter(
      (p: any) => p.seller_id !== currentUserId.value
    );

    categoryProducts.value = filtered.slice(0, 4);

    filtered.forEach((p: any) => {
      const f = parseFeatures(p.features);
      if (f && Array.isArray(f.sizes) && f.sizes.length > 0) {
        selectedSizes[p.id] = "";
      }
    });
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

function isOwnProduct(product: any) {
  return currentUserId.value && product.seller_id === currentUserId.value;
}

const handleAddToCart = (product: any) => {
  if (isOwnProduct(product)) {
    toast.error("Kendi ürününüzü sepete ekleyemezsiniz!");
    return;
  }

  const selectedSize = selectedSizes[product.id];
  const hasRequiredSize = parseFeatures(product.features)?.sizes;

  if (hasRequiredSize && !selectedSize) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image_url || "https://via.placeholder.com/300x300?text=No+Image",
    sizes: selectedSize ? [selectedSize] : null,
    seller_id: product.seller_id,
  });
  toast.success(`"${product.title}" sepete eklendi!`);
};

const handleToggleFavorite = async (productId: number, productTitle: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Favorilere eklemek için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  try {
    const added = await toggleFavorite(productId);
    if (added) {
      toast.success(`"${productTitle}" favorilere eklendi!`);
    } else {
      toast.success(`"${productTitle}" favorilerden çıkarıldı!`);
    }
  } catch (error) {
    toast.error("Bir hata oluştu!");
  }
};

const handleBuyNow = async (product: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Lütfen satın alma işlemi için giriş yapınız.");
    router.push("/login");
    return;
  }

  if (isOwnProduct(product)) {
    toast.error("Kendi ürününüzü satın alamazsınız!");
    return;
  }

  const quantity = 1;
  const selectedSize = selectedSizes[product.id];
  const hasRequiredSize = parseFeatures(product.features)?.sizes;

  if (hasRequiredSize && !selectedSize) {
    toast.error("Lütfen bir beden seçiniz!");
    return;
  }

  const res = await apiPost("/orders", {
    product_id: product.id,
    quantity: quantity,
    sizes: selectedSize ? [selectedSize] : undefined
  });

  if (res.error) {
    toast.error(`Satın alma işlemi başarısız: ${res.error}`);
    return;
  }

  toast.success(`"${product.title}" başarıyla satın alındı! Siparişlerinizi panelden takip edebilirsiniz.`);

  const products = await apiGet("/products/popular");
  const filtered = products.filter(
    (p: any) => p.seller_id !== currentUserId.value
  );
  popularProducts.value = filtered;
};
</script>


<template>
  <!-- Slider -->
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <div data-hs-carousel='{"loadingClasses": "opacity-0"}' class="relative">
      <div class="hs-carousel relative overflow-hidden w-full h-96 md:h-[500px] bg-gray-100 rounded-xl">
        <div
          class="hs-carousel-body absolute top-0 bottom-0 start-0 flex flex-nowrap transition-transform duration-700 opacity-0">
          <div class="hs-carousel-slide">
            <div
              class="h-96 md:h-[500px] flex flex-col bg-[url('./assets/herodiscountbanner1.png')] bg-cover bg-center bg-no-repeat relative">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              <div class="mt-auto w-2/3 md:max-w-lg ps-6 pb-6 md:ps-12 md:pb-12 relative z-10">
                <span
                  class="block text-white text-sm font-bold mb-3 bg-red-600 px-4 py-2 rounded-lg inline-block shadow-lg">
                  Yılbaşı İndirimleri
                </span>
                <span
                  class="block text-white text-2xl md:text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight">
                  Şuanda mevcut olan yılbaşı indirimlerinden ürünlerimizden satın alarak yararlanabilirsiniz!
                </span>
              </div>
            </div>
          </div>
          <div class="hs-carousel-slide">
            <div
              class="h-96 md:h-[500px] flex flex-col bg-[url('./assets/herobanner2.png')] bg-cover bg-center bg-no-repeat relative">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              <div class="mt-auto w-2/3 md:max-w-lg ps-6 pb-6 md:ps-12 md:pb-12 relative z-10">
                <span
                  class="block text-white text-sm font-bold mb-3 bg-blue-600 px-4 py-2 rounded-lg inline-block shadow-lg">
                  Açılışa Özel İndirim
                </span>
                <span
                  class="block text-white text-2xl md:text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-tight">
                  Açılışa özel uygun ve indirimli fiyatlı ürünler sizi bekliyor!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button"
        class="hs-carousel-prev hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 start-0 inline-flex justify-center items-center w-10 h-full text-white hover:bg-black/20 rounded-s-xl">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
        </svg>
      </button>

      <button type="button"
        class="hs-carousel-next hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 end-0 inline-flex justify-center items-center w-10 h-full text-white hover:bg-black/20 rounded-e-xl">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
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

      <div v-if="popularProducts.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        <div v-for="product in popularProducts" :key="product.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group flex flex-col h-full">

          <div class="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {{ product.total_sales || 0 }} Satış
          </div>



          <button @click.prevent="handleToggleFavorite(product.id, product.title)"
            class="absolute top-2 left-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
            title="Favorilere ekle">
            <svg class="w-5 h-5" :class="isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>


          <!-- Karşılaştırma Butonu -->
          <button @click.prevent="handleToggleCompare(product)"
            :title="isInCompare(product.id) ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'" :class="[
              'absolute top-14 left-2 z-10 p-2 rounded-full shadow-lg transition-all',
              isInCompare(product.id)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white/90 hover:bg-white text-gray-600 hover:text-blue-600'
            ]">
            <svg class="w-5 h-5" :class="{ 'fill-current': isInCompare(product.id) }" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>




          <RouterLink :to="`/urun/${product.id}`" class="relative overflow-hidden aspect-square">
            <img :src="getFirstImage(product.image_url)" :alt="product.title" class="w-full h-full object-cover" />
          </RouterLink>

          <div class="p-3 flex flex-col flex-1">
            <RouterLink :to="`/urun/${product.id}`"
              class="font-semibold text-sm hover:text-blue-600 text-gray-900 mb-1 line-clamp-2 min-h-[40px]">{{
                product.title }}</RouterLink>
            <p class="text-xs text-gray-500 mb-2 line-clamp-1">{{ product.description }}</p>

            <div v-if="parseFeatures(product.features) && featureEntries(product.features).length" class="mb-2">
              <div class="flex flex-wrap gap-1">
                <span v-for="([key, value]) in featureEntries(product.features)" :key="product.id"
                  class="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>



            <div v-if="parseFeatures(product.features) && parseFeatures(product.features).sizes" class="mb-2">
              <label class="text-xs text-gray-600 block mb-1">Beden:</label>
              <div class="flex flex-wrap gap-1">
                <label v-for="s in parseFeatures(product.features).sizes" :key="product.id + s"
                  class="inline-flex items-center text-xs cursor-pointer">
                  <input type="radio" :value="s" v-model="selectedSizes[product.id]" class="w-3 h-3 rounded mr-1" />
                  <span>{{ s }}</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between mb-3 mt-auto">
              <span class="text-lg font-bold text-gray-900">{{ product.price }} TL</span>
              <span class="text-xs text-gray-500">{{ product.category_name }}</span>
            </div>

            <div v-if="!isOwnProduct(product)" class="flex gap-2">
              <button @click="handleAddToCart(product)"
                class="flex-1 bg-gray-900 text-white text-xs font-medium py-2 rounded hover:bg-gray-800 transition">
                Sepete Ekle
              </button>
              <button @click="handleBuyNow(product)"
                class="flex-1 bg-green-600 text-white text-xs font-medium py-2 rounded hover:bg-green-700 transition">
                Satın Al
              </button>
            </div>

            <div v-else class="flex gap-2">
              <button disabled
                class="flex-1 bg-gray-300 text-gray-500 text-xs font-medium py-2 rounded cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız">
                Sepete Ekle
              </button>
              <button disabled
                class="flex-1 bg-gray-300 text-gray-500 text-xs font-medium py-2 rounded cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız">
                Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">Henüz popüler ürün bulunmuyor</p>
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
        <button v-for="category in categories" :key="category.slug" @click="selectCategory(category.slug)" :class="[
          'px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
          selectedCategory === category.slug
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
        ]">
          {{ category.name }}
        </button>
      </div>

      <div v-if="isLoadingCategory" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-900"></div>
        <p class="text-gray-600 mt-3">Ürünler yükleniyor...</p>
      </div>

      <div v-else-if="categoryProducts.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        <div v-for="product in categoryProducts" :key="product.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group flex flex-col h-full">

          <RouterLink :to="`/urun/${product.id}`" class="relative overflow-hidden aspect-square">
            <img :src="getFirstImage(product.image_url)" :alt="product.title" class="w-full h-full object-cover" />
          </RouterLink>

          <button @click.prevent="handleToggleFavorite(product.id, product.title)"
            class="absolute top-2 left-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
            title="Favorilere ekle">
            <svg class="w-5 h-5" :class="isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>


          <!-- Karşılaştırma Butonu -->
          <button @click.prevent="handleToggleCompare(product)"
            :title="isInCompare(product.id) ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'" :class="[
              'absolute top-14 left-2 z-10 p-2 rounded-full shadow-lg transition-all',
              isInCompare(product.id)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white/90 hover:bg-white text-gray-600 hover:text-blue-600'
            ]">
            <svg class="w-5 h-5" :class="{ 'fill-current': isInCompare(product.id) }" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          <div class="p-3 flex flex-col flex-1">
            <RouterLink :to="`/urun/${product.id}`"
              class="font-semibold text-sm hover:text-blue-600 text-gray-900 mb-1 line-clamp-2 min-h-[40px]">{{
                product.title }}</RouterLink>
            <p class="text-xs text-gray-500 mb-2 line-clamp-1">{{ product.description }}</p>

            <div v-if="parseFeatures(product.features) && featureEntries(product.features).length" class="mb-2">
              <div class="flex flex-wrap gap-1">
                <span v-for="([key, value]) in featureEntries(product.features)" :key="product.id"
                  class="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>

            <div v-if="parseFeatures(product.features) && parseFeatures(product.features).sizes" class="mb-2">
              <label class="text-xs text-gray-600 block mb-1">Beden:</label>
              <div class="flex flex-wrap gap-1">
                <label v-for="s in parseFeatures(product.features).sizes" :key="product.id"
                  class="inline-flex items-center text-xs cursor-pointer">
                  <input type="radio" :value="s" v-model="selectedSizes[product.id]" class="w-3 h-3 rounded mr-1" />
                  <span>{{ s }}</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-between mb-3 mt-auto">
              <span class="text-lg font-bold text-gray-900">{{ product.price }} TL</span>
            </div>

            <div v-if="!isOwnProduct(product)" class="flex gap-2">
              <button @click="handleAddToCart(product)"
                class="flex-1 bg-gray-900 text-white text-xs font-medium py-2 rounded hover:bg-gray-800 transition">
                Sepete Ekle
              </button>
              <button @click="handleBuyNow(product)"
                class="flex-1 bg-green-600 text-white text-xs font-medium py-2 rounded hover:bg-green-700 transition">
                Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-gray-500 text-lg">Bu kategoride henüz ürün bulunmuyor</p>
      </div>

      <div v-if="categoryProducts.length > 0" class="text-center mt-8">
        <RouterLink :to="`/kategori/${selectedCategory}`"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition">
          Tümünü Gör
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </RouterLink>
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
        <RouterLink to="/kategori/erkek-giyim" class="group">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative overflow-hidden aspect-video">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="../assets/erkek-giyim.jpeg" alt="Erkek Giyim">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5">Erkek Giyim</h3>
                <p class="text-gray-200 text-sm">Trend erkek kıyafetleri</p>
              </div>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/kategori/kadin-giyim" class="group">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative overflow-hidden aspect-video">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="../assets/kadın-giyim.jpg" alt="Kadın Giyim">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5">Kadın Giyim</h3>
                <p class="text-gray-200 text-sm">Şık ve modern koleksiyon</p>
              </div>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/kategori/ayakkabi" class="group">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative overflow-hidden aspect-video">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="../assets/ayakkabi3.jpg" alt="Ayakkabı">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5">Ayakkabı</h3>
                <p class="text-gray-200 text-sm">Konforlu ve şık modeller</p>
              </div>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/kategori/cocuk-giyim" class="group">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative overflow-hidden aspect-video">
              <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                src="../assets/cocuk-giyim.jpg" alt="Çocuk Giyim">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-3 left-3 right-3">
                <h3 class="text-white font-bold text-lg mb-0.5">Çocuk Giyim</h3>
                <p class="text-gray-200 text-sm">Renkli ve eğlenceli</p>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>