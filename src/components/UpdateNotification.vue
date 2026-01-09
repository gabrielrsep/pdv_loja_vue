<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isVisible" 
        class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
        @click.self="handleDismiss"
      >
        <div class="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 max-w-md w-full overflow-hidden">
          <!-- Gradient Accent -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
          
          <!-- Content -->
          <div class="p-8 space-y-6">
            <!-- Icon & Title -->
            <div class="flex items-start gap-4">
              <div 
                class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                :class="iconBgClass"
              >
                <component :is="iconComponent" class="w-7 h-7" :class="iconColorClass" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-black text-slate-900 leading-tight">{{ title }}</h3>
                <p class="text-sm text-slate-500 font-medium mt-1">{{ subtitle }}</p>
              </div>
              <button 
                v-if="canDismiss"
                @click="handleDismiss" 
                class="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Progress Bar (for downloading) -->
            <div v-if="state === 'downloading'" class="space-y-2">
              <div class="flex justify-between text-xs font-bold text-slate-600">
                <span>Baixando atualização...</span>
                <span>{{ Math.round(downloadProgress) }}%</span>
              </div>
              <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out rounded-full"
                  :style="{ width: `${downloadProgress}%` }"
                ></div>
              </div>
              <p class="text-xs text-slate-500 font-medium">{{ formatBytes(transferred) }} / {{ formatBytes(total) }}</p>
            </div>

            <!-- Version Info (when available) -->
            <div v-if="newVersion && state === 'available'" class="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <p class="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Nova Versão</p>
              <p class="text-2xl font-black text-primary-700">v{{ newVersion }}</p>
            </div>

            <!-- Error Message -->
            <div v-if="state === 'error' && errorMessage" class="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p class="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Erro</p>
              <p class="text-sm font-medium text-red-700">{{ errorMessage }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                v-if="state === 'available'"
                @click="handleDownload"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-black text-base shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Baixar Atualização
              </button>
              
              <button
                v-if="state === 'downloaded'"
                @click="handleInstall"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Instalar e Reiniciar
              </button>
              
              <button
                v-if="canDismiss"
                @click="handleDismiss"
                class="px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                {{ state === 'downloaded' ? 'Lembrar Depois' : 'Fechar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue';

// State
const isVisible = ref(false);
const state = ref('idle'); // idle, checking, available, downloading, downloaded, not-available, error
const newVersion = ref(null);
const errorMessage = ref(null);
const downloadProgress = ref(0);
const transferred = ref(0);
const total = ref(0);

// Computed
const title = computed(() => {
  switch (state.value) {
    case 'checking': return 'Verificando Atualizações';
    case 'available': return 'Atualização Disponível';
    case 'downloading': return 'Baixando Atualização';
    case 'downloaded': return 'Pronto para Instalar';
    case 'not-available': return 'Tudo Atualizado';
    case 'error': return 'Erro na Atualização';
    default: return 'Atualizações';
  }
});

const subtitle = computed(() => {
  switch (state.value) {
    case 'checking': return 'Aguarde enquanto verificamos por novas versões...';
    case 'available': return 'Uma nova versão está disponível para download';
    case 'downloading': return 'O download está em andamento, não feche o aplicativo';
    case 'downloaded': return 'A atualização foi baixada e está pronta para ser instalada';
    case 'not-available': return 'Você está usando a versão mais recente';
    case 'error': return 'Ocorreu um problema ao verificar atualizações';
    default: return '';
  }
});

const iconComponent = computed(() => {
  const icons = {
    checking: () => h('svg', { class: 'animate-spin', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24' }, [
      h('circle', { class: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '4' }),
      h('path', { class: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' })
    ]),
    available: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10' })
    ]),
    downloading: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' })
    ]),
    downloaded: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    'not-available': () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    error: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  };
  return icons[state.value] || icons.checking;
});

const iconBgClass = computed(() => {
  const classes = {
    checking: 'bg-blue-50',
    available: 'bg-primary-50',
    downloading: 'bg-blue-50',
    downloaded: 'bg-emerald-50',
    'not-available': 'bg-emerald-50',
    error: 'bg-red-50'
  };
  return classes[state.value] || 'bg-slate-50';
});

const iconColorClass = computed(() => {
  const classes = {
    checking: 'text-blue-600',
    available: 'text-primary-600',
    downloading: 'text-blue-600',
    downloaded: 'text-emerald-600',
    'not-available': 'text-emerald-600',
    error: 'text-red-600'
  };
  return classes[state.value] || 'text-slate-600';
});

const canDismiss = computed(() => {
  return !['downloading'].includes(state.value);
});

// Methods
function showNotification(newState, data = {}) {
  state.value = newState;
  if (data.version) newVersion.value = data.version;
  if (data.error) errorMessage.value = data.error;
  isVisible.value = true;

  // Auto-hide for non-critical states
  if (['not-available', 'error'].includes(newState)) {
    setTimeout(() => {
      if (canDismiss.value) isVisible.value = false;
    }, 5000);
  }
}

function handleDismiss() {
  if (canDismiss.value) {
    isVisible.value = false;
    state.value = 'idle';
    errorMessage.value = null;
  }
}

async function handleDownload() {
  const result = await window.api.downloadUpdate();
  if (!result.success) {
    showNotification('error', { error: result.error });
  }
}

async function handleInstall() {
  await window.api.installUpdate();
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Event Listeners
onMounted(() => {
  window.api.onUpdateChecking(() => {
    showNotification('checking');
  });

  window.api.onUpdateAvailable((data) => {
    showNotification('available', data);
  });

  window.api.onUpdateNotAvailable((data) => {
    showNotification('not-available', data);
  });

  window.api.onUpdateDownloadProgress((data) => {
    state.value = 'downloading';
    downloadProgress.value = data.percent || 0;
    transferred.value = data.transferred || 0;
    total.value = data.total || 0;
    isVisible.value = true;
  });

  window.api.onUpdateDownloaded((data) => {
    showNotification('downloaded', data);
  });

  window.api.onUpdateError((data) => {
    showNotification('error', data);
  });
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
  opacity: 0;
}
</style>
