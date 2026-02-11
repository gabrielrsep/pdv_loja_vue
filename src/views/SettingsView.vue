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

        <!-- GitHub Updates Configuration Card -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-800 leading-tight">Atualizações Automáticas</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Configure o acesso ao GitHub</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Check on Startup Toggle -->
            <div class="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:border-purple-100 transition-all cursor-pointer" @click="localConfig.checkOnStartup = !localConfig.checkOnStartup">
              <div class="max-w-[70%]">
                <p class="font-bold text-slate-700">Verificar ao iniciar</p>
                <p class="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tight">Busca atualizações automaticamente quando o app abre</p>
              </div>
              <div 
                class="w-14 h-8 rounded-full transition-all relative p-1"
                :class="localConfig.checkOnStartup ? 'bg-purple-500' : 'bg-slate-200'"
              >
                <div 
                  class="w-6 h-6 bg-white rounded-full shadow-sm transition-all transform"
                  :class="localConfig.checkOnStartup ? 'translate-x-6' : 'translate-x-0'"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Printer Configuration Card -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-800 leading-tight">Impressão de Recibos</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Selecione o dispositivo padrão</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Impressora Selecionada</label>
              <div class="relative">
                <select 
                  v-model="localConfig.printer_device_name" 
                  class="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none"
                >
                  <option value="">Nenhuma</option>
                  <option v-for="printer in availablePrinters" :key="printer.name" :value="printer.name">
                    {{ printer.name }}
                  </option>
                </select>
                <span class="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </span>
              </div>
              <p class="text-[10px] text-slate-500 font-medium ml-1">Dispositivo usado para imprimir cupons fiscais e recibos.</p>
            </div>
          </div>
        </div>

        <!-- System Info & Updates Card -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-800 leading-tight">Sobre o Sistema</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Versão e atualizações</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Current Version -->
            <div class="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Versão Atual</p>
              <p class="text-2xl font-black text-slate-800">{{ appVersion }}</p>
              <p class="text-xs text-slate-500 font-medium mt-1">PDV Rangel Modas</p>
            </div>

            <!-- Check for Updates Button -->
            <button
              @click="handleCheckUpdates"
              :disabled="checkingUpdates"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black text-base shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg v-if="checkingUpdates" class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ checkingUpdates ? 'Verificando...' : 'Verificar Atualizações' }}
            </button>

            <p v-if="lastUpdateCheck" class="text-xs text-slate-500 font-medium text-center">
              Última verificação: {{ lastUpdateCheck }}
            </p>
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
  allow_salesperson_undo_sale: false,
  checkOnStartup: true,
  autoDownload: false,
  printer_device_name: ''
});

// Update-related state
const appVersion = ref('...');
const checkingUpdates = ref(false);
const lastUpdateCheck = ref(null);

const availablePrinters = ref([]);

onMounted(async () => {
  await settingsStore.fetchConfig();
  // Sincroniza a cópia local com o que vem do arquivo de configuração
  Object.assign(localConfig, settingsStore.config);
  
  // Get app version
  const versionResult = await window.api.getAppVersion();
  if (versionResult.success) {
    appVersion.value = versionResult.version;
  }

  // Get printers
  try {
    availablePrinters.value = await window.api.getPrinters();
  } catch (err) {
    console.error('Erro ao buscar impressoras:', err);
  }
});

async function handleSave() {
  const result = await settingsStore.saveConfig({ ...localConfig });
  if (result.success) {
    alert('Configurações aplicadas com sucesso!');
  } else {
    alert('Erro: ' + result.error);
  }
}

async function handleCheckUpdates() {
  checkingUpdates.value = true;
  await window.api.checkForUpdates();
  checkingUpdates.value = false;
  
  // Update last check time
  const now = new Date();
  lastUpdateCheck.value = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // The UpdateNotification component will handle showing the result
}
</script>