<script setup lang="ts">
interface Props {
  title?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  border?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hover: false,
  border: true
});

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};
</script>

<template>
  <div :class="[
    'bg-white rounded-lg',
    border ? 'border border-gray-200' : '',
    hover ? 'hover:shadow-lg transition-shadow' : '',
    paddingClasses[padding]
  ]">
    <h3 v-if="title" class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
    </h3>
    
    <slot />
  </div>
</template>