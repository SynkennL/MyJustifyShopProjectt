<script setup lang="ts">
interface Props {
    title: string;
    description?: string;
}

const props = withDefaults(defineProps<Props>(), {
});

</script>

<template>
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">{{ title }}</h1>
        <p v-if="description" class="text-gray-600">{{ description }}</p>
    </div>
</template>