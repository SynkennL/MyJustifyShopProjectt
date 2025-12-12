<script setup lang="ts">
interface Props {
    maxWidth?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
    maxWidth: 'lg'
});

const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
};
</script>

<template>
    <div class="flex items-center justify-center min-h-[80vh] px-4 py-8">
        <div :class="['w-full', widthClasses[maxWidth]]">
            <!-- Card -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <slot />
            </div>

            <div v-if="$slots.extra" class="mt-6">
                <slot name="extra" />
            </div>
        </div>
    </div>
</template>