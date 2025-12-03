<script setup lang="ts">
import { useRouter } from "vue-router";
import { cart, clearCart } from "../services/cart";
import { apiPost } from "../services/api";

const router = useRouter();

// Sepetteki her ürünün miktarını güncelleme
const updateQuantity = (productId: number, delta: number) => {
  const item = cart.value.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
    }
  }
};

// Sepetten ürün kaldırma
const removeFromCart = (productId: number) => {
  const index = cart.value.findIndex(i => i.id === productId);
  if (index > -1) {
    cart.value.splice(index, 1);
    saveCart();
  }
};

// LocalStorage'a kaydetme
const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cart.value));
};

// Toplam fiyat hesaplama
const totalPrice = () => {
  return cart.value.reduce((acc, i) => acc + i.price * i.quantity, 0);
};

// Tek ürün satın alma
const buyProduct = async (product: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  try {
    const res = await apiPost("/orders", {
      product_id: product.id,
      quantity: product.quantity
    });

    if (res.error) {
      alert(res.error);
      return;
    }

    alert(`${product.title} başarıyla satın alındı!`);
    removeFromCart(product.id);
  } catch (error) {
    console.error("Satın alma hatası:", error);
    alert("Satın alma sırasında bir hata oluştu!");
  }
};

// Tüm sepeti satın alma
const buyAll = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  if (cart.value.length === 0) {
    alert("Sepetiniz boş!");
    return;
  }

  if (!confirm(`${cart.value.length} ürünü toplam ${totalPrice().toFixed(2)} TL'ye satın almak istediğinize emin misiniz?`)) {
    return;
  }

  let successCount = 0;
  let errorMessages: string[] = [];

  for (const item of cart.value) {
    try {
      const res = await apiPost("/orders", {
        product_id: item.id,
        quantity: item.quantity
      });

      if (res.error) {
        errorMessages.push(`${item.title}: ${res.error}`);
      } else {
        successCount++;
      }
    } catch (error) {
      errorMessages.push(`${item.title}: Satın alma hatası`);
    }
  }

  if (successCount > 0) {
    alert(`${successCount} ürün başarıyla satın alındı!`);
    clearCart();
  }

  if (errorMessages.length > 0) {
    alert("Bazı ürünler satın alınamadı:\n" + errorMessages.join("\n"));
  }

  if (successCount > 0) {
    router.push("/customer-panel");
  }
};
</script>

<template>
 <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Alışveriş Sepetim</h1>
              <p class="text-gray-500 text-sm mt-1">{{ cart.length }} ürün sepetinizde</p>
            </div>
          </div>
          <button 
            v-if="cart.length > 0"
            @click="clearCart" 
            class="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition font-medium flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Sepeti Temizle
          </button>
        </div>
      </div>

      <!-- Boş Sepet -->
      <div v-if="cart.length === 0" class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="bg-gray-100 p-6 rounded-full">
            <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h3>
            <p class="text-gray-500 mb-6">Alışverişe başlamak için kategorilerimize göz atın</p>
            <button 
              @click="router.push('/')" 
              class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-bold shadow-lg"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>

      <!-- Sepet Ürünleri -->
      <div v-else class="space-y-4">
        <!-- Ürün Kartları -->
        <div v-for="item in cart" :key="item.id" class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div class="p-6">
            <div class="flex gap-6">
              <!-- Ürün Görseli -->
              <div class="flex-shrink-0">
                <img 
                  :src="item.image || 'https://via.placeholder.com/150'" 
                  :alt="item.title"
                  class="w-32 h-32 object-cover rounded-xl shadow-md"
                />
              </div>

              <!-- Ürün Bilgileri -->
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ item.title }}</h3>
                  <p class="text-2xl font-bold text-indigo-600">{{ item.price }} TL</p>
                </div>

                <div class="flex items-center justify-between mt-4">
                  <!-- Miktar Kontrolü -->
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-500 font-medium">Adet:</span>
                    <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button 
                        @click="updateQuantity(item.id, -1)"
                        class="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-200 transition shadow-sm"
                      >
                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-12 text-center font-bold text-gray-900">{{ item.quantity }}</span>
                      <button 
                        @click="updateQuantity(item.id, 1)"
                        class="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-200 transition shadow-sm"
                      >
                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- İşlem Butonları -->
                  <div class="flex items-center gap-3">
                    <button 
                      @click="buyProduct(item)"
                      class="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-bold shadow-md flex items-center gap-2"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Satın Al
                    </button>
                    <button 
                      @click="removeFromCart(item.id)"
                      class="bg-red-100 text-red-600 p-2.5 rounded-lg hover:bg-red-200 transition"
                      title="Sepetten Kaldır"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Ara Toplam -->
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">Ara Toplam:</span>
                    <span class="text-lg font-bold text-gray-900">{{ (item.price * item.quantity).toFixed(2) }} TL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Özet ve Satın Alma -->
        <div class="bg-white rounded-2xl shadow-lg p-6 sticky bottom-4">
          <div class="space-y-4">
            <!-- Toplam Bilgileri -->
            <div class="space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>Toplam Ürün:</span>
                <span class="font-semibold">{{ cart.reduce((acc, i) => acc + i.quantity, 0) }} adet</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Ara Toplam:</span>
                <span class="font-semibold">{{ totalPrice().toFixed(2) }} TL</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>KDV (%20):</span>
                <span class="font-semibold">{{ (totalPrice() * 0.20).toFixed(2) }} TL</span>
              </div>
              <div class="border-t-2 border-gray-200 pt-2 flex justify-between items-center">
                <span class="text-xl font-bold text-gray-900">Genel Toplam:</span>
                <span class="text-3xl font-bold text-indigo-600">{{ (totalPrice() * 1.20).toFixed(2) }} TL</span>
              </div>
            </div>

            <!-- Satın Alma Butonu -->
            <button 
              @click="buyAll"
              class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tümünü Satın Al ({{ cart.length }} Ürün)
            </button>

            <button 
              @click="router.push('/')"
              class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Alışverişe Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
