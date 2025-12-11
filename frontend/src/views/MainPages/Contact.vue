<style scoped></style>

<template>
  <div class="p-4 mx-auto max-w-xl bg-white">
    <h2 class="text-3xl text-slate-900 font-bold">Bizimle İletişime Geç</h2>
    <form action="https://api.web3forms.com/submit" method="POST" class="mt-8 space-y-5">
      <input type="hidden" name="access_key" value="76c70e8f-bd3a-44bc-a215-cb30fe03d068">
      <div>
        <label class='text-sm text-slate-900 font-medium mb-2 block'>İsim (Zorunlu)</label>
        <input type='text' name="İsim Ve Soyisim" placeholder='İsim ve Soyisim Giriniz.' required
          class="w-full py-2.5 px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 transition-all" />
      </div>
      <div>
        <label class='text-sm text-slate-900 font-medium mb-2 block'>E-Posta (Zorunlu)</label>
        <input type='email' name="E-posta" placeholder='E-Posta Giriniz.' required
          class="w-full py-2.5 px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 transition-all" />
      </div>
      <div>
        <label class='text-sm text-slate-900 font-medium mb-2 block'>Konu (Zorunlu)</label>
        <select type='text' name="Konu" placeholder='Konu Giriniz.' required
          class="w-full py-2.5 px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 transition-all">
          <option value="" disabled selected>Konu Seçiniz</option>
          <option value="Şikayet & Öneri">Şikayet & Öneri</option>
          <option value="Sipariş Takibi">Sipariş Takibi</option>
          <option value="Ürün Bilgisi">Ürün Bilgisi</option>
          <option value="Diğer">Diğer</option>
        </select>
      </div>
      <div>
        <label class='text-sm text-slate-900 font-medium mb-2 block'>Mesaj (Zorunlu)</label>
        <textarea placeholder='Mesajınız' name="Mesaj" rows="6" required
          class="w-full px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm pt-3 outline-0 transition-all"></textarea>
      </div>
      <Button full-width  variant="primary" size="lg" type="submit">Gönder</Button>
    </form>
    <div
      class="flex items-start sm:items-center p-4 mb-4 mt-3 text-sm rounded-xl bg-blue-700 hover:scale-105 transition duration-500 ease-in-out"
      role="alert">
      <svg class="w-5 h-5 me-2 shrink-0 mt-0.5 sm:mt-0.5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <p class="font-bold text-gray-200"><span class="font-bold me-2 text-black">Bilgilendirme!</span>Formu doldururken
        bilgilerin eksiksiz olduğundan ve kesinliğinden emin olunuz.</p>
    </div>
  </div>

</template>

<script setup lang="ts">
import Button from '../../components/Button.vue';
</script>