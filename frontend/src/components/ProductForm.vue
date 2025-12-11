<script setup lang="ts">
import { ref } from 'vue';
import Button from './Button.vue';
import Input from './Input.vue';
import Card from './Card.vue';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category_id: number | null;
  image_urls: string[];
  features: {
    renk: string;
    malzeme: string;
    marka: string;
  };
}

interface Props {
  categories: any[];
  predefinedSizes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  predefinedSizes: () => ["XS","S","M","L","XL","XXL","36","38","40","42","44"]
});

const emit = defineEmits<{
  submit: [data: ProductFormData, sizes: string[]];
}>();

const formData = ref<ProductFormData>({
  title: "",
  description: "",
  price: 0,
  category_id: null,
  image_urls: [],
  features: { renk: "", malzeme: "", marka: "" }
});

const newImageUrl = ref("");
const selectedSizes = ref<string[]>([]);

const featureFields = [
  { key: 'renk', label: 'Renk', placeholder: 'Örn: Siyah, Mavi' },
  { key: 'malzeme', label: 'Malzeme', placeholder: 'Örn: %100 Pamuk' },
  { key: 'marka', label: 'Marka', placeholder: 'Örn: Nike, Adidas' }
];

function addImageUrl() {
  if (newImageUrl.value.trim()) {
    formData.value.image_urls.push(newImageUrl.value.trim());
    newImageUrl.value = "";
  }
}

function removeImageUrl(index: number) {
  formData.value.image_urls.splice(index, 1);
}

function resetForm() {
  formData.value = {
    title: "",
    description: "",
    price: 0,
    category_id: null,
    image_urls: [],
    features: { renk: "", malzeme: "", marka: "" }
  };
  selectedSizes.value = [];
}

function handleSubmit() {
  emit('submit', formData.value, selectedSizes.value);
  resetForm();
}

defineExpose({ resetForm });
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input v-model="formData.title" placeholder="Ürün başlığı" />
      <Input v-model.number="formData.price" type="number" placeholder="Fiyat" />
    </div>

    <textarea 
      v-model="formData.description" 
      placeholder="Açıklama" 
      rows="3"
      class="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none"
    />

    <select 
      v-model="formData.category_id" 
      class="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:border-slate-900 focus:outline-none"
    >
      <option :value="null">Kategori seç</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
    </select>

    <!-- Resim URL'leri -->
    <Card padding="md" border>
      <h4 class="font-semibold mb-3 text-gray-700">📷 Ürün Resimleri</h4>
      <div class="flex gap-2 mb-3">
        <Input 
          v-model="newImageUrl" 
          placeholder="Resim URL'si ekle (https://...)" 
          @keyup.enter="addImageUrl"
        />
        <Button @click="addImageUrl">Ekle</Button>
      </div>
      
      <div v-if="formData.image_urls.length > 0" class="grid grid-cols-3 gap-3">
        <div v-for="(url, index) in formData.image_urls" :key="index" class="relative group aspect-square border-2 border-gray-200 rounded-lg overflow-hidden">
          <img :src="url" alt="Ürün resmi" class="w-full h-full object-cover" />
          <button type="button" @click="removeImageUrl(index)" class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <p v-else class="text-sm text-gray-500 text-center py-4">Henüz resim eklenmedi</p>
    </Card>

    <!-- Özellikler -->
    <Card padding="md" border>
      <h4 class="font-semibold mb-3 text-gray-700">Ürün Özellikleri</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Beden:</label>
          <div class="flex flex-wrap gap-2">
            <label v-for="s in predefinedSizes" :key="s" class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" :value="s" v-model="selectedSizes" class="w-4 h-4" />
              <span class="text-xs">{{ s }}</span>
            </label>
          </div>
        </div>
        <Input 
          v-for="field in featureFields" 
          :key="field.key"
          v-model="formData.features[field.key as keyof typeof formData.features]" 
          :label="field.label" 
          :placeholder="field.placeholder" 
        />
      </div>
    </Card>

    <Button variant="primary" full-width size="md" @click="handleSubmit">
      Ürün Ekle
    </Button>
  </div>
</template>