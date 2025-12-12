<template>
  <div>
    <Announcement />
    <Navbar />
    <router-view />
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