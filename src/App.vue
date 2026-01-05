<template>
  <SetupView v-if="!authStore.setupDone" />
  <div v-else class="min-h-screen bg-slate-50">
    <div v-if="authStore.authenticated" class="flex h-screen overflow-hidden">
      <AppSidebar />
      <main class="flex-1 overflow-hidden p-6 relative">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <div v-else>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <AppToast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './store/auth';
import AppSidebar from './components/AppSidebar.vue';
import SetupView from './views/SetupView.vue';
import AppToast from './components/AppToast.vue';
const authStore = useAuthStore();

onMounted(async () => {
  // Verifica se já existe um admin configurado ao abrir o app
  await authStore.checkInitialSetup();

  // adicione efeitos de transição
  const toast = document.createElement('div');
  toast.classList.add('bg-blue-500', 'text-white', 'p-4', 'rounded', 'fixed', 'bottom-4', 'right-4', 'animate-bounce');
  toast.textContent = 'Bem-vindo ao PDV Loja!';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);  
});
</script>