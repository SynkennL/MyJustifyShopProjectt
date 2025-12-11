<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { addToCart } from '../services/cart';
import { isFavorite, toggleFavorite } from '../services/favorites';
import { addToCompare, removeFromCompare, isInCompare, MAX_COMPARE, compareList } from '../services/compare';
import { apiPost } from '../services/api';
import { toast } from 'vue3-toastify';
import Button from './Button.vue';

interface Props {
  product: any;
  selectedSize?: string;
  showActions?: boolean;
  showFavorite?: boolean;
  showCompare?: boolean;
  isOwned?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showFavorite: true,
  showCompare: true,
  isOwned: false
});

const emit = defineEmits<{
  'update:selectedSize': [value: string];
  'refresh': [];
}>();

const router = useRouter();

const firstImage = computed(() => {
  if (!props.product.image_url) return 'https://via.placeholder.com/300';
  try {
    const parsed = JSON.parse(props.product.image_url);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : props.product.image_url;
  } catch {
    return props.product.image_url;
  }
});

const features = computed(() => {
  if (!props.product.features) return null;
  const f = typeof props.product.features === 'string' 
    ? JSON.parse(props.product.features) 
    : props.product.features;
  return f;
});

const displayFeatures = computed(() => {
  if (!features.value) return [];
  const hasSizes = Array.isArray(features.value.sizes) && features.value.sizes.length > 0;
  return Object.entries(features.value).filter(([k]) => {
    const lk = k.toLowerCase();
    return lk !== 'sizes' && !(hasSizes && ['beden', 'bede', 'size'].includes(lk));
  });
});

const handleFavoriteToggle = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.info('Favorilere eklemek için giriş yapmalısınız!');
    router.push('/login');
    return;
  }

  try {
    const added = await toggleFavorite(props.product.id);
    toast.success(added ? 'Favorilere eklendi!' : 'Favorilerden çıkarıldı!');
  } catch {
    toast.error('Bir hata oluştu!');
  }
};

const handleCompareToggle = () => {
  if (isInCompare(props.product.id)) {
    removeFromCompare(props.product.id);
    toast.success('Karşılaştırmadan kaldırıldı!');
  } else {
    if (compareList.value.length >= MAX_COMPARE) {
      toast.error(`En fazla ${MAX_COMPARE} ürün karşılaştırabilirsiniz!`);
      return;
    }
    const success = addToCompare({
      id: props.product.id,
      title: props.product.title,
      price: props.product.price,
      image_url: firstImage.value,
      category_name: props.product.category_name,
      features: props.product.features,
      description: props.product.description
    });
    if (success) toast.success('Karşılaştırmaya eklendi!');
  }
};

const handleAddToCart = () => {
  if (props.isOwned) {
    toast.error('Kendi ürününüzü sepete ekleyemezsiniz!');
    return;
  }

  if (features.value?.sizes && !props.selectedSize) {
    toast.error('Lütfen bir beden seçiniz!');
    return;
  }

  addToCart({
    id: props.product.id,
    title: props.product.title,
    price: props.product.price,
    image: firstImage.value,
    sizes: props.selectedSize ? [props.selectedSize] : null,
    seller_id: props.product.seller_id,
  });
  toast.success(`"${props.product.title}" sepete eklendi!`);
};

const handleBuyNow = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.info('Satın almak için giriş yapmalısınız!');
    router.push('/login');
    return;
  }

  if (props.isOwned) {
    toast.error('Kendi ürününüzü satın alamazsınız!');
    return;
  }

  if (features.value?.sizes && !props.selectedSize) {
    toast.error('Lütfen bir beden seçiniz!');
    return;
  }

  const res = await apiPost('/orders', {
    product_id: props.product.id,
    quantity: 1,
    sizes: props.selectedSize ? [props.selectedSize] : undefined
  });

  if (res.error) {
    toast.error(res.error);
    return;
  }

  toast.success(`"${props.product.title}" başarıyla satın alındı!`);
  emit('refresh');
};
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition relative group flex flex-col h-full">
    <!-- Badges -->
    <div v-if="product.total_sales" class="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
      {{ product.total_sales }} Satış
    </div>

    <!-- Favorite Button -->
    <button 
      v-if="showFavorite"
      @click.prevent="handleFavoriteToggle"
      class="absolute top-2 left-2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
      title="Favorilere ekle"
    >
      <svg 
        class="w-5 h-5" 
        :class="isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>

    <!-- Compare Button -->
    <button 
      v-if="showCompare"
      @click.prevent="handleCompareToggle"
      :title="isInCompare(product.id) ? 'Karşılaştırmadan çıkar' : 'Karşılaştırmaya ekle'"
      :class="[
        'absolute top-14 left-2 z-10 p-2 rounded-full shadow-lg transition-all',
        isInCompare(product.id) 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'bg-white/90 hover:bg-white text-gray-600 hover:text-blue-600'
      ]"
    >
      <svg class="w-5 h-5" :class="{ 'fill-current': isInCompare(product.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </button>

    <!-- Product Image -->
    <RouterLink :to="`/urun/${product.id}`" class="relative overflow-hidden aspect-square">
      <img :src="firstImage" :alt="product.title" class="w-full h-full object-cover" />
    </RouterLink>

    <!-- Product Info -->
    <div class="p-3 flex flex-col flex-1">
      <RouterLink 
        :to="`/urun/${product.id}`" 
        class="font-semibold text-sm hover:text-blue-600 text-gray-900 mb-1 line-clamp-2 min-h-[40px]"
      >
        {{ product.title }}
      </RouterLink>
      
      <p class="text-xs text-gray-500 mb-2 line-clamp-1">{{ product.description }}</p>

      <!-- Features -->
      <div v-if="displayFeatures.length" class="mb-2">
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="[key, value] in displayFeatures" 
            :key="key"
            class="text-xs bg-gray-100 px-2 py-0.5 rounded"
          >
            {{ key }}: {{ value }}
          </span>
        </div>
      </div>

      <!-- Size Selection -->
      <div v-if="features?.sizes" class="mb-2">
        <label class="text-xs text-gray-600 block mb-1">Beden:</label>
        <div class="flex flex-wrap gap-1">
          <label 
            v-for="size in features.sizes" 
            :key="size"
            class="inline-flex items-center text-xs cursor-pointer"
          >
            <input 
              type="radio" 
              :value="size" 
              :checked="selectedSize === size"
              @change="$emit('update:selectedSize', size)"
              class="w-3 h-3 rounded mr-1" 
            />
            <span>{{ size }}</span>
          </label>
        </div>
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between mb-3 mt-auto">
        <span class="text-lg font-bold text-gray-900">{{ product.price }} TL</span>
        <span v-if="product.category_name" class="text-xs text-gray-500">{{ product.category_name }}</span>
      </div>

      <!-- Actions -->
      <div v-if="showActions && !isOwned" class="flex gap-2">
        <Button flex variant="primary" size="md" @click="handleAddToCart">
          Sepete Ekle
        </Button>
        <Button flex variant="success" size="sm" @click="handleBuyNow">
          Satın Al
        </Button>
      </div>
    </div>
  </div>
</template>