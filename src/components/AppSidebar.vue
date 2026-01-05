<template>
  <aside 
    :class="[
      'bg-white flex flex-col h-screen transition-all duration-300 ease-in-out border-r border-slate-200 relative',
      collapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Toggle Button -->
    <button 
      @click="collapsed = !collapsed"
      class="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-50"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        :class="['w-4 h-4 text-slate-500 transition-transform duration-300', collapsed ? 'rotate-180' : '']" 
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>

    <div class="p-6 pb-2">
      <div class="flex items-center space-x-3 mb-1 overflow-hidden whitespace-nowrap">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
        </div>
        <h1 v-show="!collapsed" class="text-lg font-bold tracking-tight text-slate-800 transition-opacity">Rangel Modas</h1>
      </div>
      <p v-show="!collapsed" class="text-[10px] text-slate-400 font-semibold tracking-widest uppercase ml-11 transition-opacity">{{ authStore.user?.role }}</p>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
      <!-- Seção Operacional -->
      <div class="space-y-1">
        <p v-show="!collapsed" class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Operacional</p>
        
        <router-link 
          to="/pos" 
          class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200"
          active-class="bg-primary-50 text-primary-600 shadow-sm"
          class-inactive="text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Ponto de Venda</span>
        </router-link>

        <router-link 
          to="/customers" 
          class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          active-class="bg-primary-50 text-primary-600 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Clientes / Crédito</span>
        </router-link>

        <router-link 
          to="/sales" 
          class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          active-class="bg-primary-50 text-primary-600 shadow-sm"
        >
          <HistoryIcon />
          <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Vendas / Histórico</span>
        </router-link>
      </div>

      <!-- Seção Gerenciamento -->
      <div class="space-y-1">
        <p v-show="!collapsed" class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gerenciamento</p>

        <router-link 
          to="/inventory" 
          class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          active-class="bg-primary-50 text-primary-600 shadow-sm"
        >
          <PackageIcon />
          <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Estoque / Produtos</span>
        </router-link>

        <template v-if="authStore.isAdmin">
          <router-link 
            to="/stats" 
            class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            active-class="bg-primary-50 text-primary-600 shadow-sm"
          >
            <ChartLineIcon />
            <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Estatísticas</span>
          </router-link>

          <router-link 
            to="/financial" 
            class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            active-class="bg-primary-50 text-primary-600 shadow-sm"
          >
            <DollarSignIcon />
            <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Financeiro / Gastos</span>
          </router-link>
        </template>
      </div>

      <!-- Seção Sistema -->
      <div v-if="authStore.isAdmin" class="space-y-1">
        <p v-show="!collapsed" class="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sistema</p>
        
        <router-link 
          to="/settings" 
          class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          active-class="bg-primary-50 text-primary-600 shadow-sm"
        >
          <SettingsIcon />
          <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Configurações</span>
        </router-link>
        <router-link
          to='/users'
          class="group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          active-class="bg-primary-50 text-primary-600 shadow-sm"
        >
          <UsersRoundIcon />
          <span v-show="!collapsed" class="font-medium text-sm whitespace-nowrap">Usuários</span>
        </router-link>
      </div>
    </nav>

    <div class="p-4 border-t border-slate-100">
      <div 
        :class="[
          'flex items-center p-2 rounded-xl hover:bg-slate-50 transition-colors group relative',
          collapsed ? 'justify-center' : 'justify-between'
        ]"
      >
        <div v-show="!collapsed" class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-slate-800 truncate">{{ authStore.user?.username }}</span>
          <button @click="handleLogout" class="text-[10px] text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider text-left">
            Logout
          </button>
        </div>
        
        <button 
          v-show="collapsed" 
          @click="handleLogout"
          class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Sair"
        >
          <span class="text-[8px]">×</span>
        </button>

        <div class="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { UsersRoundIcon, SettingsIcon, ChartLineIcon, DollarSignIcon, PackageIcon, HistoryIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const collapsed = ref(false);

const handleLogout = () => {
  if (confirm('Deseja realmente sair?')) {
    authStore.logout();
    router.push('/');
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>