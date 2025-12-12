<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    flex?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
    loading: false,
    type: 'button',
    flex: false
});

const emit = defineEmits<{
    click: [event: MouseEvent]
}>();

const buttonClasses = computed(() => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-500'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const width = props.fullWidth ? 'w-full' : props.flex ? 'flex-1' : '';

    return `${base} ${variants[props.variant]} ${sizes[props.size]} ${width}`;
});

const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event);
    }
};
</script>

<template>
    <button :type="type" :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
        <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <slot />
    </button>
</template>