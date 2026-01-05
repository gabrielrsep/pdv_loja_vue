<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Configurações do Sistema</h1>
        <p class="text-sm text-slate-500 font-medium">Ajuste os parâmetros globais e permissões</p>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto pr-2 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Sales Parameters Card -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-800 leading-tight">Parâmetros de Venda</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Defina margens e precificação</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Margem de Lucro Padrão</label>
              <div class="relative">
                <input 
                  v-model.number="localConfig.margin" 
                  type="number" 
                  class="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-black text-lg"
                />
                <span class="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 font-bold text-xl">%</span>
              </div>
              <p class="text-[10px] text-slate-500 font-medium ml-1">Percentual sugerido ao cadastrar novos produtos.</p>
            </div>
          </div>
        </div>

        <!-- Permissions Card -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-800 leading-tight">Permissões de Usuário</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Controle o que cada cargo pode fazer</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:border-amber-100 transition-all cursor-pointer" @click="localConfig.allow_salesperson_undo_sale = !localConfig.allow_salesperson_undo_sale">
              <div class="max-w-[70%]">
                <p class="font-bold text-slate-700">Vendedor pode estornar vendas?</p>
                <p class="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tight">Permite que contas do nível "Vendedor" apaguem registros do histórico.</p>
              </div>
              <div 
                class="w-14 h-8 rounded-full transition-all relative p-1"
                :class="localConfig.allow_salesperson_undo_sale ? 'bg-emerald-500' : 'bg-slate-200'"
              >
                <div 
                  class="w-6 h-6 bg-white rounded-full shadow-sm transition-all transform"
                  :class="localConfig.allow_salesperson_undo_sale ? 'translate-x-6' : 'translate-x-0'"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div v-if="settingsStore.loading" class="w-6 h-6 border-2 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Aguardando confirmação das mudanças</p>
      </div>
      <button 
        @click="handleSave"
        :disabled="settingsStore.loading"
        class="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {{ settingsStore.loading ? 'Processando...' : 'Aplicar Alterações' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useSettingsStore } from '../store/settings';

const settingsStore = useSettingsStore();

// Usamos uma cópia local para não alterar o store global antes de clicar em "Salvar"
const localConfig = reactive({
  margin: 0,
  allow_salesperson_undo_sale: false
});

onMounted(async () => {
  await settingsStore.fetchConfig();
  // Sincroniza a cópia local com o que vem do banco de dados
  Object.assign(localConfig, settingsStore.config);
});

async function handleSave() {
  const result = await settingsStore.saveConfig({ ...localConfig });
  if (result.success) {
    alert('Configurações aplicadas com sucesso!');
  } else {
    alert('Erro: ' + result.error);
  }
}
</script>