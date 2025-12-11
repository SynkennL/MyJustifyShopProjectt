<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { apiGet } from "../../services/api";
import { toast } from "vue3-toastify";
import ProductCard from "../../components/ProductCard.vue";
import EmptyState from "../../components/EmptyState.vue";
import LoadingSpinner from "../../components/LoadingSpinner.vue";
import PageHeader from "../../components/PageHeader.vue";
import Button from "../../components/Button.vue";

const router = useRouter();
const favorites = ref<any[]>([]);
const loading = ref(true);
const selectedSizes = reactive<Record<number, string>>({});
const currentUserId = ref<number | null>(null);

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.info("Favorileri görmek için giriş yapmalısınız!");
    router.push("/login");
    return;
  }

  const userStr = localStorage.getItem("user");
  if (userStr) {
    currentUserId.value = JSON.parse(userStr).id;
  }

  await loadFavorites();
});

async function loadFavorites() {
  try {
    loading.value = true;
    const data = await apiGet("/favorites");
    favorites.value = data;
  } catch (error) {
    console.error("Favoriler yüklenemedi:", error);
    toast.error("Favoriler yüklenirken bir hata oluştu!");
  } finally {
    loading.value = false;
  }
}

function isOwnProduct(product: any): boolean {
  if (!currentUserId.value || !product?.seller_id) return false;
  return product.seller_id === currentUserId.value;
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <PageHeader 
      title="Favorilerim" 
      description="Beğendiğiniz ürünleri buradan takip edebilirsiniz"
    >
      <template #actions>
        <div class="flex justify-end mt-4">
          <Button @click="router.push('/')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Alışverişe Devam
          </Button>
        </div>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="loading" />

    <EmptyState
      v-else-if="favorites.length === 0"
      title="Henüz favori ürününüz yok"
      description="Beğendiğiniz ürünleri favorilere ekleyerek kolayca takip edebilirsiniz"
      icon="favorite"
      action-text="Ürünleri Keşfet"
      action-to="/"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in favorites"
        :key="product.id"
        :product="product"
        :selected-size="selectedSizes[product.id]"
        @update:selected-size="selectedSizes[product.id] = $event"
        :is-owned="isOwnProduct(product)"
        @refresh="loadFavorites"
      />
    </div>
  </div>
</template>