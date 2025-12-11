<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullScreen: false
});

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16'
};
</script>

<template>
  <div :class="[
    'flex flex-col justify-center items-center',
    fullScreen ? 'min-h-screen' : 'py-16'
  ]">
    <div 
      :class="[
        'animate-spin rounded-full border-4 border-gray-300 border-t-gray-900',
        sizeClasses[size]
      ]"
    ></div>
    <p v-if="text" class="text-gray-600 mt-4">{{ text }}</p>
  </div>
</template>