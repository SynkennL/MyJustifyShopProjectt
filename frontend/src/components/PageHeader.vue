<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Props {
  title: string;
  description?: string;
  showBack?: boolean;
  backText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  backText: 'Geri'
});

const router = useRouter();
</script>

<template>
  <div class="mb-8">
    <button 
      v-if="showBack"
      @click="router.back()"
      class="text-gray-600 hover:text-gray-900 mb-4 text-sm flex items-center gap-1 transition"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {{ backText }}
    </button>
    
    <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
    <p v-if="description" class="text-gray-600 mt-2">{{ description }}</p>
    
    <slot name="actions" />
  </div>
</template>