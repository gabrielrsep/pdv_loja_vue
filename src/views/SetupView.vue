<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative p-4">
    <!-- Background Accents -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="max-w-2xl w-full relative z-10">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/40 transform rotate-3 hover:rotate-0 transition-all">
          <span class="text-white font-black text-2xl">1</span>
        </div>
        <h2 class="text-3xl font-black text-white tracking-tighter italic">Configuração do Sistema</h2>
        <p class="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Primeiro Passo: Conta de Administrador</p>
      </div>

      <div class="glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-500">
        <div class="p-10">
          <form @submit.prevent="handleSetup" class="space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
              <!-- Column 1: Auth -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-slate-900 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Segurança
                  </h3>
                  <div class="space-y-4">
                    <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário Master</label>
                      <input v-model="form.username" type="text" placeholder="ADMIN" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold uppercase text-sm" />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                      <input v-model="form.password" type="password" placeholder="••••••••" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium" />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                      <input v-model="form.confirmPassword" type="password" placeholder="••••••••" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Column 2: Recovery -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-slate-900 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    Recuperação
                  </h3>
                  <div class="space-y-4">
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p class="text-[10px] text-slate-500 leading-relaxed font-bold italic">Estes dados servirão para recuperar seu acesso caso esqueça a senha.</p>
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pergunta Secreta</label>
                      <input v-model="form.recoveryQuestion" type="text" placeholder="Ex: Nome da sua mãe" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
                    </div>
                    <div class="space-y-2">
                      <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Resposta</label>
                      <input v-model="form.recoveryAnswer" type="text" placeholder="Sua resposta" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
              Concluir e Acessar Painel
            </button>
          </form>
        </div>
      </div>
      
      <p class="text-center mt-10 text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
        rangel modas enterprise solutions &bull; welcome aboard
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '../store/auth';
import { useToastStore } from '../store/toast';
import { useRouter } from 'vue-router';

const toast = useToastStore();
const authStore = useAuthStore();
const router = useRouter();
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  recoveryQuestion: '',
  recoveryAnswer: ''
});

async function handleSetup() {
  if (form.password !== form.confirmPassword) {
    return alert('As senhas não coincidem!'); // Lógica migrada do renderer.js
  }

  const result = await authStore.registerFirstAdmin(form);
  if (!result.success) {
    alert(result.error);
  } else {
    authStore.setupDone = true;
    toast.showToast('Usuário administrador criado com sucesso!', 'success');
  }
}
</script>