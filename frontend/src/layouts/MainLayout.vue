<template>
    <div>
        <Announcement />
        <Navbar />
        <div class="max-w-7xl mx-auto px-4 py-6">
            <router-view />
        </div>
        <Footer />
        <CookieConsent />
    </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import Announcement from '../components/Announcement.vue'
import CookieConsent from '../components/CookieConsent.vue'
</script>