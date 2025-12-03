<style scoped></style>

<template>
  <!-- Popüler Ürünler Bölümü -->
  <div class="px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-white to-gray-50">
    <div class="max-w-7xl mx-auto">
      <!-- Başlık -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-slate-900 mb-2">🔥 Popüler Ürünler</h2>
        <p class="text-gray-600">En çok satın alınan ürünlerimiz</p>
      </div>

      <!-- Ürünler Grid -->
      <div v-if="popularProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div v-for="product in popularProducts" :key="product.id" 
             class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group">
          
          <!-- Satış Badge -->
          <div class="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {{ product.total_sales || 0 }} Satış
          </div>

          <!-- Kendi ürünü badge -->
          <div v-if="isOwnProduct(product)" class="absolute top-3 left-3 z-10">
            <span class="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Sizin Ürününüz
            </span>
          </div>
          
          <!-- Ürün Görseli -->
          <div class="relative overflow-hidden h-48">
            <img 
              :src="product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'" 
              :alt="product.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <!-- Ürün Bilgileri -->
          <div class="p-4">
            <h3 class="font-semibold text-slate-900 mb-2 line-clamp-2 h-12">{{ product.title }}</h3>
            <p class="text-sm text-gray-500 mb-2 line-clamp-2">{{ product.description }}</p>
            
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl font-bold text-slate-900">{{ product.price }} TL</span>
              <span class="text-xs text-gray-500">{{ product.category_name }}</span>
            </div>

            <!-- Butonlar -->
            <div v-if="!isOwnProduct(product)" class="flex gap-2">
              <button 
                @click="handleAddToCart(product)"
                class="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded hover:bg-gray-800 transition"
              >
                Sepete Ekle
              </button>
              <button 
                @click="handleBuyNow(product)"
                class="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded hover:bg-green-700 transition"
              >
                Satın Al
              </button>
            </div>

            <!-- Kendi ürünü için devre dışı butonlar -->
            <div v-else class="flex gap-2">
              <button 
                disabled
                class="flex-1 bg-gray-300 text-gray-500 text-sm font-medium py-2 rounded cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız"
              >
                Sepete Ekle
              </button>
              <button 
                disabled
                class="flex-1 bg-gray-300 text-gray-500 text-sm font-medium py-2 rounded cursor-not-allowed"
                title="Kendi ürününüzü satın alamazsınız"
              >
                Satın Al
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ürün Yoksa -->
      <div v-else class="text-center py-10">
        <p class="text-gray-500">Henüz popüler ürün bulunmuyor</p>
      </div>
    </div>
  </div>
  <!-- Slider -->
  <div class="px-4 sm:px-6 lg:px-8 py-10">
    <div data-hs-carousel='{
      "loadingClasses": "opacity-0"
    }' class="relative">
      <div
        class="hs-carousel relative overflow-hidden w-full h-120 md:h-[calc(100vh-106px)]  bg-gray-100 rounded-2xl dark:bg-neutral-800">
        <div
          class="hs-carousel-body absolute top-0 bottom-0 start-0 flex flex-nowrap transition-transform duration-700 opacity-0">
          <!-- Item -->
          <div class="hs-carousel-slide">
            <div
              class="h-120 md:h-[calc(100vh-106px)]  flex flex-col bg-[url('./assets/herodiscountbanner1.png')] bg-cover bg-center bg-no-repeat">
              <div class="mt-auto w-2/3 md:max-w-lg ps-5 pb-5 md:ps-10 md:pb-10">
                <span class="block text-white">Yılbaşı İndirimleri</span>
                <span class="block text-white text-xl md:text-3xl">Şuanda mevcut olan yılbaşı indirimlerinden
                  ürünlerimizden satın alarak yararlanabilirsiniz!</span>
              </div>
            </div>
          </div>
          <!-- End Item -->

          <!-- Item -->
          <div class="hs-carousel-slide">
            <div class="h-72 sm:h-96 md:h-[calc(100vh-106px)]
  flex flex-col bg-[url('./assets/herobanner2.png')] bg-cover bg-center bg-no-repeat">
              <div class="mt-auto w-2/3 md:max-w-lg ps-5 pb-5 md:ps-10 md:pb-10">
                <span class="block text-white">Açılışa Özel İndirim</span>
                <span class="block text-white text-xl md:text-3xl">Açılışa özel uygun ve indirimli fiyatlı ürünler sizi
                  bekliyor!</span>
              </div>
            </div>
          </div>
          <!-- End Item -->
        </div>
      </div>

      <!-- Arrows -->
      <button type="button"
        class="hs-carousel-prev hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 start-0 inline-flex justify-center items-center w-12 h-full text-black hover:bg-white/20 rounded-s-2xl focus:outline-hidden focus:bg-white/20">
        <span class="text-2xl" aria-hidden="true">
          <svg class="shrink-0 size-3.5 md:size-4 text-white hover:scale-115" xmlns="http://www.w3.org/2000/svg"
            width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z">
            </path>
          </svg>
        </span>
        <span class="sr-only">Önceki</span>
      </button>

      <button type="button"
        class="hs-carousel-next hs-carousel-disabled:opacity-50 disabled:pointer-events-none absolute inset-y-0 end-0 inline-flex justify-center items-center w-12 h-full text-black hover:bg-white/20 rounded-e-2xl focus:outline-hidden focus:bg-white/20">
        <span class="sr-only">Sonraki</span>
        <span class="text-2xl" aria-hidden="true">
          <svg class="shrink-0 size-3.5 md:size-4 text-white hover:scale-115" xmlns="http://www.w3.org/2000/svg"
            width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
            </path>
          </svg>
        </span>
      </button>
      <!-- End Arrows -->
    </div>
  </div>
  <!-- End Slider -->
   <div class="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5">

  <!-- Card Template -->
  <div class="rounded overflow-hidden shadow-lg h-full flex flex-col">
    <img class="w-full h-60 object-cover" src="../assets/erkek-giyim.jpeg" alt="Erkek Giyim">
    <div class="px-6 py-4 flex-grow">
      <div class="font-bold text-xl mb-2">Erkek-Giyim Kategorisi</div>
      <p class="text-gray-700 text-base">
        Erkek Giyim ürünlerimizde indirimler mevcuttur.
      </p>
    </div>
    <div class="px-6 pt-4 pb-2">
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#erkek-giyim</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#erkek</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#erkek-kıyafetleri</span>
    </div>
  </div>

  <!-- Card 2 -->
  <div class="rounded overflow-hidden shadow-lg h-full flex flex-col">
    <img class="w-full h-60 object-cover" src="../assets/kadın-giyim.jpg" alt="Kadın Giyim">
    <div class="px-6 py-4 flex-grow">
      <div class="font-bold text-xl mb-2">Kadın-Giyim Kategorisi</div>
      <p class="text-gray-700 text-base">
        Kadın Giyim ürünlerimizde indirimler mevcuttur.
      </p>
    </div>
    <div class="px-6 pt-4 pb-2">
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#kadın-giyim</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#kadın</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#kadın-kıyafetleri</span>
    </div>
  </div>

  <!-- Card 3 -->
  <div class="rounded overflow-hidden shadow-lg h-full flex flex-col">
    <img class="w-full h-60 object-cover" src="../assets/ayakkabi3.jpg" alt="Ayakkabi">
    <div class="px-6 py-4 flex-grow">
      <div class="font-bold text-xl mb-2">Ayakkabı Kategorisi</div>
      <p class="text-gray-700 text-base">
        Ayakkabı ürünlerimizde indirimler mevcuttur.
      </p>
    </div>
    <div class="px-6 pt-4 pb-2">
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#ayakkabı-ürünleri</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#ayakkabı</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#ayakkabılar</span>
    </div>
  </div>

  <!-- Card 4 -->
  <div class="rounded overflow-hidden shadow-lg h-full flex flex-col">
    <img class="w-full h-60 object-cover" src="../assets/cocuk-giyim.jpg" alt="Çocuk Giyim">
    <div class="px-6 py-4 flex-grow">
      <div class="font-bold text-xl mb-2">Çocuk-Giyim Kategorisi</div>
      <p class="text-gray-700 text-base">
        Çocuk Giyim ürünlerimizde indirimler mevcuttur.
      </p>
    </div>
    <div class="px-6 pt-4 pb-2">
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#çocuk-giyim</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#çocuk</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#çocuk-kıyafetleri</span>
    </div>
  </div>
</div>
  <div class="sm:flex items-center max-w-screen-xl mb-10">
    <div class="sm:w-1/2 p-10">
      <div class="image object-center text-center">
        <img src="https://i.imgur.com/WbQnbas.png">
      </div>
    </div>
    <div class="sm:w-1/2 p-5">
      <div class="text">
        <span class="text-gray-500 border-b-4 p-2 font-bold border-indigo-600">BİLGİLENDİRME</span>
        <h2 class="my-4 font-bold text-3xl  sm:text-4xl ">Biz Kimiz? <span class="text-indigo-600"></span>
        </h2>
        <p class="text-gray-700 leading-relaxed">
          Bizim işimiz uygun ve güvenilir bir şekilde ürün sunmaktır. JustifyShop olarak, müşterilerimize en
          trend ürünleri, güvenli alışveriş deneyimini ve hızlı teslimat hizmetini sunmayı amaçlıyoruz.
          Müşteri memnuniyeti bizim için her şeyden önce gelir ve bu nedenle her adımda kaliteyi ön planda
          tutuyoruz.
        </p>
      </div>
    </div>
  </div>
  <!-- Testimonials -->
  <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Grid -->
    <div class="md:grid md:grid-cols-2 md:gap-10 lg:gap-16 md:items-center">
      <div class="hidden md:block mb-24 md:mb-0 sm:px-6">
        <div class="relative">
          <img class="rounded-xl" src="../assets/contactbanner1.png" alt="Avatar">
          <!-- End SVG Element -->
        </div>
      </div>
      <!-- End Col -->

      <div>
        <!-- Div -->
        <div class="relative">
          <svg
            class="absolute top-0 start-0 transform -translate-x-8 -translate-y-4 size-24 text-gray-200 dark:text-neutral-700"
            width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true">
            <path
              d="M7.39762 10.3C7.39762 11.0733 7.14888 11.7 6.6514 12.18C6.15392 12.6333 5.52552 12.86 4.76621 12.86C3.84979 12.86 3.09047 12.5533 2.48825 11.94C1.91222 11.3266 1.62421 10.4467 1.62421 9.29999C1.62421 8.07332 1.96459 6.87332 2.64535 5.69999C3.35231 4.49999 4.33418 3.55332 5.59098 2.85999L6.4943 4.25999C5.81354 4.73999 5.26369 5.27332 4.84476 5.85999C4.45201 6.44666 4.19017 7.12666 4.05926 7.89999C4.29491 7.79332 4.56983 7.73999 4.88403 7.73999C5.61716 7.73999 6.21938 7.97999 6.69067 8.45999C7.16197 8.93999 7.39762 9.55333 7.39762 10.3ZM14.6242 10.3C14.6242 11.0733 14.3755 11.7 13.878 12.18C13.3805 12.6333 12.7521 12.86 11.9928 12.86C11.0764 12.86 10.3171 12.5533 9.71484 11.94C9.13881 11.3266 8.85079 10.4467 8.85079 9.29999C8.85079 8.07332 9.19117 6.87332 9.87194 5.69999C10.5789 4.49999 11.5608 3.55332 12.8176 2.85999L13.7209 4.25999C13.0401 4.73999 12.4903 5.27332 12.0713 5.85999C11.6786 6.44666 11.4168 7.12666 11.2858 7.89999C11.5215 7.79332 11.7964 7.73999 12.1106 7.73999C12.8437 7.73999 13.446 7.97999 13.9173 8.45999C14.3886 8.93999 14.6242 9.55333 14.6242 10.3Z"
              fill="currentColor" />
          </svg>

          <div class="relative z-10">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3 dark:text-neutral-200">

            </p>

            <p
              class="text-xl font-medium italic text-gray-800 md:text-2xl md:leading-normal xl:text-3xl xl:leading-normal dark:text-neutral-200">
              Ürünlerimiz hakkında şikayetiniz ve sorularınız için bize aşağıdaki iletişim sayfası butonunu
              ulaşabilirsiniz.
            </p>
          </div>

          <div class="flex items-center">
            <div class="md:hidden shrink-0 mt-5">
              <img class="size-12 rounded-full" src="../assets/justifylogo.png" alt="Avatar">
            </div>
          </div>

          <div class="mt-8 lg:mt-14">
            <RouterLink to="/iletisim">
            <a class="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-bold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-gray-900 focus:outline-hidden focus:bg-gray-900 hover:scale-115 transition-transform duration-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-white dark:text-neutral-800"
              href="/iletisim">
              İletişim Sayfası
            </a>
            </RouterLink>
          </div>
        </div>
        <!-- End Div -->
      </div>
      <!-- End Col -->
    </div>
    <!-- End Grid -->
  </div>
  <!-- End Testimonials -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";
import { addToCart } from "../services/cart";

const router = useRouter();
const popularProducts = ref<any[]>([]);
const currentUserId = ref<number | null>(null);

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
});

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
  
  // Popüler ürünleri yeniden yüklemek için
  const products = await apiGet("/products/popular");
  popularProducts.value = products;
};
</script>