<template>
  <Announcement />
  <Navbar />
  <div class="pt-15 min-h-screen">
    <router-view />
  </div>
  <Footer />
  <CookieConsent />
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Announcement from './components/Announcement.vue'
import CookieConsent from './components/CookieConsent.vue'
</script>
