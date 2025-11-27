<style scoped>
</style>

<template>
    <div class="p-4 mx-auto max-w-xl bg-white">
        <h2 class="text-3xl text-slate-900 font-bold">Bizimle İletişime Geç</h2>
        <form action="https://api.web3forms.com/submit" method="POST" class="mt-8 space-y-5">
         <input type="hidden" name="access_key" value="76c70e8f-bd3a-44bc-a215-cb30fe03d068">
          <div>
            <label class='text-sm text-slate-900 font-medium mb-2 block'>İsim (Zorunlu)</label>
            <input type='text' placeholder='İsim Giriniz.' required
              class="w-full py-2.5 px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 transition-all" />
          </div>
          <div>
            <label class='text-sm text-slate-900 font-medium mb-2 block'>E-Posta (Zorunlu)</label>
            <input type='email' placeholder='E-Posta Giriniz.' required
              class="w-full py-2.5 px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 transition-all" />
          </div>
          <div>
            <label class='text-sm text-slate-900 font-medium mb-2 block'>Konu (Zorunlu)</label>
            <input type='text' placeholder='Konu Giriniz.' required
              class="w-full py-2.5 px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm outline-0 transition-all" />
          </div>
          <div>
            <label class='text-sm text-slate-900 font-medium mb-2 block'>Mesaj (Zorunlu)</label>
            <textarea placeholder='Mesaj Giriniz.' rows="6" required
              class="w-full px-4 text-slate-800 bg-gray-100 border border-gray-200 focus:border-slate-900 focus:bg-transparent text-sm pt-3 outline-0 transition-all"></textarea>
          </div>
          <button type="submit"
            class="text-white bg-slate-900 font-medium hover:bg-slate-800 tracking-wide text-sm px-4 py-2.5 w-full border-0 outline-0 cursor-pointer">Gönder</button>
        </form>
      </div>

</template>

<script lang="ts">
</script>