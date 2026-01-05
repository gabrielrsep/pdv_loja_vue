<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative p-4">
    <!-- Background Accents -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="max-w-md w-full relative z-10">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/40 transform -rotate-6 hover:rotate-0 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <h2 class="text-4xl font-black text-white tracking-tighter italic">Rangel Modas</h2>
        <p class="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Enterprise Solutions</p>
      </div>

      <!-- Login Card -->
      <div class="glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-500">
        <div class="p-10">
          <div class="mb-8 overflow-hidden">
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">Bem-vindo de volta</h3>
            <p class="text-slate-500 font-medium text-sm">Insira suas credenciais para acessar o painel</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário de Acesso</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input 
                  v-model="form.username" 
                  type="text" 
                  class="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                  placeholder="Ex: ADMIN"
                  required
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Secreta</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  v-model="form.password" 
                  type="password" 
                  class="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-medium text-slate-800 placeholder:text-slate-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center items-center gap-3 py-4 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>{{ loading ? 'Autenticando...' : 'Entrar no Sistema' }}</span>
            </button>
          </form>

          <div class="mt-8 text-center">
            <button 
              @click="showRecovery = true" 
              class="text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest"
            >
              Problemas com a senha de acesso?
            </button>
          </div>
        </div>
      </div>
      
      <p class="text-center mt-10 text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em] opacity-50">
        &copy; 2026 rangel modas &bull; creative engineering
      </p>
    </div>

    <PasswordRecovery v-if="showRecovery" @close="showRecovery = false" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import PasswordRecovery from '../components/PasswordRecovery.vue';
import { useToastStore } from '../store/toast';

const toastStore = useToastStore();
const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);
const showRecovery = ref(false);

const form = reactive({
  username: '',
  password: ''
});

async function handleLogin() {
  loading.value = true;
  // Chama a action do Pinia que migramos do renderer.js
  const result = await authStore.login(form.username, form.password);
  
  if (result.success) {
    // Redireciona para o PDV após sucesso
    router.push('/pos');
  } else {
    toastStore.showToast(result.error || 'Erro ao realizar login.', 'error');
  }
  loading.value = false;
}
</script>