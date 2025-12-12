<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { cart, clearCart } from "../../services/cart";
import { apiPost } from "../../services/api";
import { toast } from "vue3-toastify";
import Button from "../../components/common/Button.vue";
import EmptyState from "../../components/common/EmptyState.vue";
import Card from "../../components/common/Card.vue";
import PageHeader from "../../components/layout/PageHeader.vue";

const router = useRouter();

const totalPrice = computed(() => {
  return cart.value.reduce((acc, i) => acc + i.price * i.quantity, 0);
});

const totalItems = computed(() => {
  return cart.value.reduce((acc, i) => acc + i.quantity, 0);
});

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

  if (!confirm(`"${cart.value.length}" ürünü toplam ${totalPrice.value} TL'ye satın almak istediğinize emin misiniz?`)) {
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
  <div class="max-w-4xl mx-auto p-4">
    <PageHeader title="Alışveriş Sepetim">
      <template #actions>
        <div class="flex justify-end mt-4">
          <Button 
            v-if="cart.length > 0"
            variant="danger"
            @click="clearCart"
          >
            Sepeti Temizle
          </Button>
        </div>
      </template>
    </PageHeader>

    <EmptyState
      v-if="cart.length === 0"
      title="Sepetiniz boş"
      description="Alışverişe başlamak için ürünleri keşfedin"
      icon="cart"
      action-text="Alışverişe Başla"
      action-to="/"
    />

    <div v-else class="space-y-4">
      <!-- Ürün Listesi -->
      <Card v-for="item in cart" :key="item.id + '-' + (item.sizes || []).join('|')" padding="md">
        <div class="flex gap-4">
          <img 
            :src="getFirstImage(item.image)" 
            :alt="item.title"
            class="w-24 h-24 object-cover rounded"
          />
          
          <div class="flex-1">
            <h3 class="font-semibold text-lg text-slate-900 mb-1">{{ item.title }}</h3>
            <p class="text-slate-900 font-bold text-xl mb-3">{{ item.price }} TL</p>

            <p v-if="item.sizes && item.sizes.length" class="text-sm text-gray-600 mb-2">
              Seçilen Bedenler: <span class="font-semibold">{{ item.sizes.join(", ") }}</span>
            </p>
            
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  @click="updateQuantity(item.id, -1, item.sizes)"
                >
                  -
                </Button>
                <span class="w-12 text-center font-medium">{{ item.quantity }}</span>
                <Button 
                  variant="outline"
                  size="sm"
                  @click="updateQuantity(item.id, 1, item.sizes)"
                >
                  +
                </Button>
              </div>
              
              <Button 
                variant="primary"
                size="sm"
                @click="buyProduct(item)"
              >
                Satın Al
              </Button>
              
              <Button 
                variant="danger"
                size="sm"
                @click="removeFromCart(item.id, item.sizes)"
              >
                Kaldır
              </Button>
            </div>
            
            <p class="text-sm text-gray-600 mt-3">
              Ara Toplam: <span class="font-semibold">{{ (item.price * item.quantity).toFixed(2) }} TL</span>
            </p>
          </div>
        </div>
      </Card>

      <!-- Sepet Özeti -->
      <Card padding="lg">
        <div class="space-y-2 mb-4">
          <div class="flex justify-between text-gray-700">
            <span>Toplam Ürün:</span>
            <span class="font-semibold">{{ totalItems }} adet</span>
          </div>
          <div class="flex justify-between text-slate-900 text-2xl font-bold pt-2 border-t border-gray-300">
            <span>Toplam:</span>
            <span>{{ totalPrice.toFixed(2) }} TL</span>
          </div>
        </div>

        <div class="flex gap-3">
          <Button 
            variant="primary"
            size="lg"
            @click="buyAll"
          >
            Tümünü Satın Al ({{ cart.length }} Ürün)
          </Button>

          <Button
            variant="secondary"
            size="lg"
            @click="router.push('/')"
          >
            Alışverişe Devam Et
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>