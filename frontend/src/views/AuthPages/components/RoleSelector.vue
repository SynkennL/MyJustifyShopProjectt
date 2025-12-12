<script setup lang="ts">
interface Props {
  modelValue: 'customer' | 'admin';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: 'customer' | 'admin'];
}>();

const roles = [
  {
    value: 'customer',
    label: 'Müşteri',
    description: 'Ürün satın al & Ürün satışı yap',
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    color: 'blue'
  },
  {
    value: 'admin',
    label: 'Yönetici',
    description: 'Ürün sat & Ürünleri yönet',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    color: 'purple'
  }
];

const colorClasses:any = {
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500'
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500'
  }
};

const updateRole = (value: 'customer' | 'admin') => {
  emit('update:modelValue', value);
};
</script>

<template>
  <div>
    <label class="block text-sm font-semibold text-gray-700 mb-3">
      Hesap Türü
    </label>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="role in roles"
        :key="role.value"
        type="button"
        @click="updateRole(role.value as 'customer' | 'admin')"
        :class="[
          'relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all',
          modelValue === role.value
            ? `${colorClasses[role.color].border} ${colorClasses[role.color].bg} shadow-md`
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        ]"
      >
        <!-- Check Icon -->
        <svg
          v-if="modelValue === role.value"
          class="w-6 h-6 absolute top-3 right-3"
          :class="colorClasses[role.color].icon"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>

        <!-- Icon -->
        <svg
          class="w-12 h-12 mx-auto mb-3"
          :class="
            modelValue === role.value
              ? colorClasses[role.color].icon
              : 'text-gray-400'
          "
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" :d="role.icon" />
        </svg>

        <!-- Label -->
        <span
          class="font-bold text-lg block mb-1"
          :class="
            modelValue === role.value
              ? colorClasses[role.color].text
              : 'text-gray-700'
          "
        >
          {{ role.label }}
        </span>

        <!-- Description -->
        <span class="text-xs text-gray-500">
          {{ role.description }}
        </span>
      </button>
    </div>

    <!-- Info Box -->
    <div class="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="text-sm text-gray-600">
          <strong class="text-gray-700">
            {{ modelValue === 'admin' ? 'Yönetici:' : 'Müşteri:' }}
          </strong>
          {{
            modelValue === 'admin'
              ? 'Müşterilerin mevcut ilanlarını yönetebilir, ürün satabilir, ürün satın alabilirsiniz.'
              : 'Ürün satın alabilir, ürün satabilir, mevcut ürünleri görüntüleyebilirsiniz.'
          }}
        </div>
      </div>
    </div>
  </div>
</template>