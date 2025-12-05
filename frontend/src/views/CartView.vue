<script setup lang="ts">
import { useRouter } from "vue-router";
import { cart, clearCart } from "../services/cart";
import { apiPost } from "../services/api";
import { toast } from "vue3-toastify";

const router = useRouter();

const updateQuantity = (productId: number, delta: number, sizes?: string[] | null) => {
  const sizesKey = (sizes || []).sort().join('|');
  const item = cart.value.find(i => {
    const existingSizesKey = (i.sizes || []).sort().join('|');
    return i.id === productId && existingSizesKey === sizesKey;
  });
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId, sizes);
    } else {
      saveCart();
    }
  }
};

const removeFromCart = (productId: number, sizes?: string[] | null) => {
  const sizesKey = (sizes || []).sort().join('|');
  const index = cart.value.findIndex(i => {
    const existingSizesKey = (i.sizes || []).sort().join('|');
    return i.id === productId && existingSizesKey === sizesKey;
  });
  if (index > -1) {
    cart.value.splice(index, 1);
    saveCart();
  }
};

const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cart.value));
};

const totalPrice = () => {
  return cart.value.reduce((acc, i) => acc + i.price * i.quantity, 0);
};

const buyProduct = async (product: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  try {
    const res = await apiPost("/orders", {
      product_id: product.id,
      quantity: product.quantity,
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : undefined
    });

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success(`"${product.title}" başarıyla satın alındı!`);
    removeFromCart(product.id, product.sizes);
    window.location.href = "/customer-panel";
  } catch (error) {
    console.error("Satın alma hatası:", error);
    toast.error("Satın alma sırasında bir hata oluştu!");
  }
};

const buyAll = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Satın almak için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  if (cart.value.length === 0) {
    toast.info("Sepetiniz boş!");
    return;
  }

  if (!confirm(`"${cart.value.length}" ürünü toplam ${totalPrice().toFixed(2)} TL'ye satın almak istediğinize emin misiniz?`)) {
    return;
  }

  let successCount = 0;
  let errorMessages: string[] = [];
  const itemsToRemove: any[] = [];

  for (const item of cart.value) {
    try {
      const res = await apiPost("/orders", {
        product_id: item.id,
        quantity: item.quantity,
        sizes: item.sizes && item.sizes.length > 0 ? item.sizes : undefined
      });

      if (res.error) {
        errorMessages.push(`${item.title}: ${res.error}`);
      } else {
        successCount++;
        itemsToRemove.push(item);
      }
    } catch (error) {
      errorMessages.push(`${item.title}: Satın alma hatası`);
    }
  }

  for (const item of itemsToRemove) {
    removeFromCart(item.id, item.sizes);
  }

  if (errorMessages.length > 0) {
    toast.error("Bazı ürünler satın alınamadı:\n" + errorMessages.join("\n"));
  }

  if (successCount > 0) {
    toast.success(`${successCount} ürün başarıyla satın alındı!`);
  }
};
</script>

<template>
  <div class="p-4 mx-auto max-w-4xl bg-white">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl text-slate-900 font-bold">Alışveriş Sepetim</h2>
      <button 
        v-if="cart.length > 0"
        @click="clearCart" 
        class="text-sm text-red-600 hover:underline font-medium"
      >
        Sepeti Temizle
      </button>
    </div>

    <!-- Boş Sepet -->
    <div v-if="cart.length === 0" class="text-center py-16">
      <p class="text-gray-500 text-lg mb-4">Sepetiniz boş</p>
      <button 
        @click="router.push('/')" 
        class="text-white bg-slate-900 font-medium hover:bg-slate-800 text-sm px-6 py-3 rounded transition-all"
      >
        Alışverişe Başla
      </button>
    </div>

    <!-- Sepet Ürünleri -->
    <div v-else class="space-y-4">
      <!-- Ürün Listesi -->
      <div v-for="item in cart" :key="item.id + '-' + (item.sizes || []).join('|')" class="border border-gray-200 rounded p-4">
        <div class="flex gap-4">
          <img 
            :src="item.image || 'https://via.placeholder.com/150'" 
            :alt="item.title"
            class="w-24 h-24 object-cover rounded"
          />
          
            <div class="flex-1">
            <h3 class="font-semibold text-lg text-slate-900 mb-1">{{ item.title }}</h3>
            <p class="text-slate-900 font-bold text-xl mb-3">{{ item.price }} TL</p>

            <p v-if="item.sizes && item.sizes.length" class="text-sm text-gray-600 mb-2">Seçilen Bedenler: <span class="font-semibold">{{ item.sizes.join(", ") }}</span></p>
            
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <button 
                  @click="updateQuantity(item.id, -1, item.sizes)"
                  class="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100"
                >
                  -
                </button>
                <span class="w-12 text-center font-medium">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.id, 1, item.sizes)"
                  class="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              <button 
                @click="buyProduct(item)"
                class="text-white bg-green-600 hover:bg-green-700 text-sm px-4 py-2 rounded font-medium"
              >
                Satın Al
              </button>
              
              <button 
                @click="removeFromCart(item.id, item.sizes)"
                class="text-red-600 hover:underline text-sm font-medium"
              >
                Kaldır
              </button>
            </div>
            
            <p class="text-sm text-gray-600 mt-3">
              Ara Toplam: <span class="font-semibold">{{ (item.price * item.quantity).toFixed(2) }} TL</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Sepet Özeti -->
      <div class="border-t-2 border-gray-300 pt-6 mt-6">
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-gray-700">
            <span>Toplam Ürün:</span>
            <span class="font-semibold">{{ cart.reduce((acc, i) => acc + i.quantity, 0) }} adet</span>
          </div>
          <div class="flex justify-between text-slate-900 text-2xl font-bold pt-2 border-t border-gray-300">
            <span>Toplam:</span>
            <span>{{ totalPrice().toFixed(2) }} TL</span>
          </div>
        </div>

        <button 
          @click="buyAll"
          class="w-full text-white bg-slate-900 font-medium hover:bg-slate-800 text-sm px-4 py-3 rounded transition-all mb-3"
        >
          Tümünü Satın Al ({{ cart.length }} Ürün)
        </button>

        <button 
          @click="router.push('/')"
          class="w-full bg-gray-100 text-slate-900 font-medium hover:bg-gray-200 text-sm px-4 py-3 rounded transition-all"
        >
          Alışverişe Devam Et
        </button>
      </div>
    </div>
  </div>
</template>