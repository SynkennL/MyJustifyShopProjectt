<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
  icon?: 'cart' | 'favorite' | 'search' | 'product' | 'compare';
  actionText?: string;
  actionTo?: string;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'product'
});

const emit = defineEmits<{
  action: [];
}>();

</script>

<template>
  <div class="text-center py-16 bg-white rounded-xl shadow-sm">
    <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h2>
    <p v-if="description" class="text-gray-600 mb-6">{{ description }}</p>
    
    <RouterLink v-if="actionTo && actionText" :to="actionTo">
      <button class="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium">
        {{ actionText }}
      </button>
    </RouterLink>
    
    <button 
      v-else-if="actionText"
      @click="emit('action')"
      class="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
    >
      {{ actionText }}
    </button>
  </div>
</template>