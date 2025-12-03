<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";
import { addToCart } from "../services/cart";

const router = useRouter();
const popularProducts = ref<any[]>([]);
const currentUserId = ref<number | null>(null);
const selectedCategory = ref<string>("erkek-giyim");
const categoryProducts = ref<any[]>([]);
const isLoadingCategory = ref<boolean>(false);

const categories = [
  { name: "Erkek Giyim", slug: "erkek-giyim", icon: "👔" },
  { name: "Kadın Giyim", slug: "kadin-giyim", icon: "👗" },
  { name: "Ayakkabı", slug: "ayakkabi", icon: "👟" },
  { name: "Çocuk Giyim", slug: "cocuk-giyim", icon: "👶" }
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

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }
  
  try {
    const products = await apiGet("/products/popular");
    popularProducts.value = products;
  } catch (error) {
    console.error("Popüler ürünler yüklenirken hata:", error);
  }

  await loadCategoryProducts(selectedCategory.value);
});

async function loadCategoryProducts(categorySlug: string) {
  isLoadingCategory.value = true;
  try {
    const products = await apiGet(`/products?category=${categorySlug}`);
    categoryProducts.value = products.slice(0, 4);
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
    alert("Kendi ürününüzü sepete ekleyemezsiniz!");
    return;
  }
  
  addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image_url || "https://via.placeholder.com/300x300?text=No+Image",
  });
  alert(`${product.title} sepete eklendi!`);
};

const handleBuyNow = async (product: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  if (isOwnProduct(product)) {
    alert("Kendi ürününüzü satın alamazsınız!");
    return;
  }

  const quantity = 1;
  const res = await apiPost("/orders", {
    product_id: product.id,
    quantity: quantity
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert(`${product.title} başarıyla satın alındı! Siparişlerinizi panelden takip edebilirsiniz.`);
  
  const products = await apiGet("/products/popular");
  popularProducts.value = products;
};
</script>

<template>
  <!-- Popüler Ürünler -->
  <div class="px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-white to-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-slate-900 mb-2">Popüler Ürünler</h2>
        <p class="text-gray-600">En çok satın alınan ürünlerimiz</p>
      </div>

      <div v-if="popularProducts.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div v-for="product in popularProducts" :key="product.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group">

          <div class="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {{ product.total_sales || 0 }} Satış
          </div>

          <div v-if="isOwnProduct(product)" class="absolute top-3 left-3 z-10">
            <span class="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Sizin Ürününüz
            </span>
          </div>

          <div class="relative overflow-hidden h-48">
            <img :src="product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'" :alt="product.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          </div>

          <div class="p-4">
            <h3 class="font-semibold text-slate-900 mb-2 line-clamp-2 h-12">{{ product.title }}</h3>
            <p class="text-sm text-gray-500 mb-2 line-clamp-2">{{ product.description }}</p>

            <div v-if="parseFeatures(product.features)" class="mb-3">
              <div class="flex flex-wrap gap-1">
                <span v-for="(value, key) in Object.entries(parseFeatures(product.features)).slice(0, 2)" 
                      :key="key"
                      class="inline-flex items-center gap-1 text-black text-xs font-medium px-2 py-1 border rounded-full">
                  {{ value[1] }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl font-bold text-slate-900">{{ product.price }} TL</span>
              <span class="text-xs text-gray-500">{{ product.category_name }}</span>
            </div>

            <div v-if="!isOwnProduct(product)" class="flex gap-2">
              <button @click="handleAddToCart(product)"
                class="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded hover:bg-gray-800 transition">
                Sepete Ekle
              </button>
              <button @click="handleBuyNow(product)"
                class="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded hover:bg-green-700 transition">
                Satın Al
              </button>
            </div>

            <div v-else class="flex gap-2">
              <button disabled
                class="flex-1 bg-gray-300 text-gray-500 text-sm font-medium py-2 rounded cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız">
                Sepete Ekle
              </button>
              <button disabled
                class="flex-1 bg-gray-300 text-gray-500 text-sm font-medium py-2 rounded cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız">
                Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-10">
        <p class="text-gray-500">Henüz popüler ürün bulunmuyor</p>
      </div>
    </div>
  </div>

  <!-- Slider - Aynı kalacak -->
  <div class="px-4 sm:px-6 lg:px-8 py-10">
    <div data-hs-carousel='{"loadingClasses": "opacity-0"}' class="relative">
      <div class="hs-carousel relative overflow-hidden w-full h-120 md:h-[calc(100vh-106px)] bg-gray-100 rounded-2xl dark:bg-neutral-800">
        <div class="hs-carousel-body absolute top-0 bottom-0 start-0 flex flex-nowrap transition-transform duration-700 opacity-0">
          <div class="hs-carousel-slide">
            <div class="h-120 md:h-[calc(100vh-106px)] flex flex-col bg-[url('./assets/herodiscountbanner1.png')] bg-cover bg-center bg-no-repeat">
              <div class="mt-auto w-2/3 md:max-w-lg ps-5 pb-5 md:ps-10 md:pb-10">
                <span class="block text-white">Yılbaşı İndirimleri</span>
                <span class="block text-white text-xl md:text-3xl">Şuanda mevcut olan yılbaşı indirimlerinden ürünlerimizden satın alarak yararlanabilirsiniz!</span>
              </div>
            </div>
          </div>
          <div class="hs-carousel-slide">
            <div class="h-72 sm:h-96 md:h-[calc(100vh-106px)] flex flex-col bg-[url('./assets/herobanner2.png')] bg-cover bg-center bg-no-repeat">
              <div class="mt-auto w-2/3 md:max-w-lg ps-5 pb-5 md:ps-10 md:pb-10">
                <span class="block text-white">Açılışa Özel İndirim</span>
                <span class="block text-white text-xl md:text-3xl">Açılışa özel uygun ve indirimli fiyatlı ürünler sizi bekliyor!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="hs-carousel-prev hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 start-0 inline-flex justify-center items-center w-12 h-full text-black hover:bg-white/20 rounded-s-2xl focus:outline-hidden focus:bg-white/20">
        <span class="text-2xl" aria-hidden="true">
          <svg class="shrink-0 size-3.5 md:size-4 text-white hover:scale-115" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"></path>
          </svg>
        </span>
        <span class="sr-only">Önceki</span>
      </button>

      <button type="button" class="hs-carousel-next hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 end-0 inline-flex justify-center items-center w-12 h-full text-black hover:bg-white/20 rounded-e-2xl focus:outline-hidden focus:bg-white/20">
        <span class="sr-only">Sonraki</span>
        <span class="text-2xl" aria-hidden="true">
          <svg class="shrink-0 size-3.5 md:size-4 text-white hover:scale-115" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"></path>
          </svg>
        </span>
      </button>
    </div>
  </div>

  <!-- Keşfedilebilir Ürünler -->
  <div class="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-4xl font-bold text-slate-900 mb-3">Keşfedebileceğin Ürünler</h2>
        <p class="text-gray-600 text-lg">İlgini çeken kategorideki ürünleri keşfet</p>
      </div>

      <div class="flex flex-wrap justify-center gap-4 mb-10">
        <button v-for="category in categories" :key="category.slug" @click="selectCategory(category.slug)" :class="[
          'px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 transform hover:scale-105 shadow-lg',
          selectedCategory === category.slug
            ? 'bg-green-600 text-white hover:scale-115 scale-105'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        ]">
          <span class="mr-2">{{ category.icon }}</span>
          {{ category.name }}
        </button>
      </div>

      <div v-if="isLoadingCategory" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p class="text-gray-600 mt-4">Ürünler yükleniyor...</p>
      </div>

      <div v-else-if="categoryProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="product in categoryProducts" :key="product.id"
          class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative group">

          <div v-if="isOwnProduct(product)" class="absolute top-3 left-3 z-10">
            <span class="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Sizin Ürününüz
            </span>
          </div>

          <div class="relative overflow-hidden h-56">
            <img :src="product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'" :alt="product.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div class="p-4">
            <h3 class="font-semibold text-slate-900 mb-2 line-clamp-2 h-12 text-base">{{ product.title }}</h3>
            <p class="text-sm text-gray-500 mb-3 line-clamp-2 truncate">{{ product.description }}</p>

            <!-- ÖZELLİKLER -->
            <div v-if="parseFeatures(product.features)" class="mb-3">
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(value, key) in Object.entries(parseFeatures(product.features)).slice(0, 3)" 
                      :key="key"
                      class="inline-flex items-center gap-1 text-black text-xs font-medium px-2.5 py-1 rounded-full border">
                  {{ value[0] }}: {{ value[1] }}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <span class="text-2xl font-bold text-slate-900">{{ product.price }} TL</span>
            </div>

            <div v-if="!isOwnProduct(product)" class="flex gap-2">
              <button @click="handleAddToCart(product)"
                class="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
                Sepete Ekle
              </button>
              <button @click="handleBuyNow(product)"
                class="flex-1 bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                Satın Al
              </button>
            </div>

            <div v-else class="flex gap-2">
              <button disabled
                class="flex-1 bg-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-lg cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız">
               Sepete Ekle
              </button>
              <button disabled
                class="flex-1 bg-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-lg cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız">
                 Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">📦</div>
        <p class="text-gray-500 text-lg">Bu kategoride henüz ürün bulunmuyor</p>
      </div>

      <div v-if="categoryProducts.length > 0" class="text-center mt-10">
        <RouterLink :to="`/kategori/${selectedCategory}`"
          class="inline-flex items-center gap-2 px-8 py-3 bg-blue-700 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          Tümünü Gör
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- Popüler Kategoriler -->
  <div class="px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-slate-900 mb-2">Popüler Kategoriler</h2>
        <p class="text-gray-600">En çok tercih edilen kategorilerimizi keşfedin</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RouterLink to="/kategori/erkek-giyim" class="group">
          <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div class="relative overflow-hidden h-56">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="../assets/erkek-giyim.jpeg" alt="Erkek Giyim">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-white font-bold text-xl mb-1">Erkek Giyim</h3>
                <p class="text-gray-200 text-sm">Trend erkek kıyafetleri</p>
              </div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#erkek-giyim</span>
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#erkek-kıyafetleri</span>
              </div>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/kategori/kadin-giyim" class="group">
          <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div class="relative overflow-hidden h-56">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="../assets/kadın-giyim.jpg" alt="Kadın Giyim">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-white font-bold text-xl mb-1">Kadın Giyim</h3>
                <p class="text-gray-200 text-sm">Şık ve modern koleksiyon</p>
              </div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#kadın-giyim</span>
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#kadın-kıyafetleri</span>
              </div>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/kategori/ayakkabi" class="group">
          <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div class="relative overflow-hidden h-56">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="../assets/ayakkabi3.jpg" alt="Ayakkabı">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-white font-bold text-xl mb-1">Ayakkabı</h3>
                <p class="text-gray-200 text-sm">Konforlu ve şık modeller</p>
              </div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#ayakkabı</span>
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#ayakkabı-modelleri</span>
              </div>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/kategori/cocuk-giyim" class="group">
          <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
            <div class="relative overflow-hidden h-56">
              <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src="../assets/cocuk-giyim.jpg" alt="Çocuk Giyim">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-white font-bold text-xl mb-1">Çocuk Giyim</h3>
                <p class="text-gray-200 text-sm">Renkli ve eğlenceli</p>
              </div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap gap-2">
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#çocuk-giyim</span>
                <span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">#çocuk-kıyafetleri</span>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>