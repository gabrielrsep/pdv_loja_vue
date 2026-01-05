<template>
  <transition name="toast">
    <div 
      v-if="toast.show" 
      class="fixed bottom-10 right-10 z-[100] flex items-center p-5 rounded-[2rem] shadow-2xl glass border border-white/20 min-w-[340px] backdrop-blur-xl"
      :class="{
        'shadow-green-500/10': toast.type === 'success',
        'shadow-red-500/10': toast.type === 'error',
        'shadow-primary-500/10': toast.type === 'info'
      }"
    >
      <div class="mr-4 flex-shrink-0">
        <div v-if="toast.type === 'success'" class="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div v-else-if="toast.type === 'error'" class="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </div>
        <div v-else class="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
      </div>
      <div class="flex-1 pr-2">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 leading-none">{{ toast.type }}</p>
        <p class="text-sm font-bold text-slate-800 leading-tight">{{ toast.message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useToastStore } from '../store/toast';
const toast = useToastStore();
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: opacity 0.5s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
}

.glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
</style>