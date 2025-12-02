<script setup lang="ts">
import { cart, clearCart } from "../services/cart";
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Sepetiniz</h1>
    <div v-if="cart.length">
      <div v-for="item in cart" :key="item.id" class="flex items-center gap-4 mb-4">
        <img :src="item.image || 'https://via.placeholder.com/100'" class="w-20 h-20 object-cover rounded"/>
        <div>
          <h2 class="font-semibold">{{ item.title }}</h2>
          <p>{{ item.quantity }} x {{ item.price }} TL</p>
        </div>
      </div>
      <p class="font-bold text-lg mt-4">Toplam: {{ cart.reduce((acc, i) => acc + i.price * i.quantity, 0) }} TL</p>
      <button @click="clearCart" class="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500">Sepeti Temizle</button>
    </div>
    <p v-else>Sepetiniz boş.</p>
  </div>
</template>
