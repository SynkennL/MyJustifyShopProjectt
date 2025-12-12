<script setup lang="ts">
interface Props {
    type: 'login' | 'register';
}

const props = defineProps<Props>();

const footerConfig = {
    login: {
        text: 'Hesabınız yok mu?',
        linkText: 'Kayıt Olun',
        linkTo: '/register'
    },
    register: {
        text: 'Zaten hesabınız var mı?',
        linkText: 'Giriş Yapın',
        linkTo: '/login'
    }
};
</script>

<template>
    <div class="space-y-4">
        <div class="border-t border-gray-200 pt-6"></div>

        <p class="text-center text-sm text-gray-600">
            {{ footerConfig[type].text }}
            <RouterLink :to="footerConfig[type].linkTo" class="font-semibold text-slate-900 hover:underline ml-1">
                {{ footerConfig[type].linkText }}
            </RouterLink>
        </p>

        <div v-if="$slots.extraLinks" class="text-center text-xs text-gray-500">
            <slot name="extraLinks" />
        </div>
    </div>
</template>