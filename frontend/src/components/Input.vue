<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  maxlength?: number;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputClasses = computed(() => {
  const base = 'w-full py-3 px-4 text-sm outline-0 rounded-lg transition-all border-2';
  const state = props.error 
    ? 'border-red-300 focus:border-red-500 bg-red-50' 
    : 'border-gray-200 focus:border-slate-900 bg-gray-50 focus:bg-white';
  const disabled = props.disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return `${base} ${state} ${disabled}`;
});
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-600">*</span>
    </label>
    
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :class="inputClasses"
      />
      <slot name="icon" />
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>