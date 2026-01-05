<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
    <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
      <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
        <h2 class="text-xl font-black text-slate-900 tracking-tight">Recuperar Acesso</h2>
        <button @click="$emit('close')" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
      </div>

      <div class="p-8">
        <div v-if="step === 1" class="space-y-6">
          <p class="text-sm text-slate-500 font-medium leading-relaxed">Informe seu usuário para identificarmos sua pergunta de segurança.</p>
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome de Usuário</label>
            <input 
              v-model="username" 
              type="text" 
              placeholder="Ex: ADMIN" 
              class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold uppercase text-sm"
            />
          </div>
          <button 
            @click="handleFetchQuestion" 
            :disabled="!username"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-30"
          >
            Verificar Usuário
          </button>
        </div>

        <div v-if="step === 2" class="space-y-6">
          <div class="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50 relative overflow-hidden">
            <div class="absolute top-[-10px] right-[-10px] opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p class="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] mb-2">Pergunta de Segurança</p>
            <p class="text-slate-800 font-bold text-lg leading-tight">{{ question }}</p>
          </div>
          
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sua Resposta</label>
            <input v-model="answer" type="text" placeholder="Escreva aqui..." class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
            <input v-model="newPassword" type="password" placeholder="••••••••" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium" />
          </div>

          <div class="flex flex-col gap-3">
            <button 
              @click="handleReset" 
              class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]"
            >
              Mudar Senha
            </button>
            <button @click="step = 1" class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';

const emit = defineEmits(['close']);
const authStore = useAuthStore();

const step = ref(1);
const username = ref('');
const question = ref('');
const answer = ref('');
const newPassword = ref('');

async function handleFetchQuestion() {
  const result = await authStore.getRecoveryQuestion(username.value);
  if (result.success) {
    question.value = result.question;
    step.value = 2;
  } else {
    alert(result.error);
  }
}

async function handleReset() {
  const result = await authStore.resetPassword({
    username: username.value,
    answer: answer.value,
    newPassword: newPassword.value
  });

  if (result.success) {
    alert('Senha alterada com sucesso! Já pode fazer login.');
    emit('close');
  } else {
    alert(result.error);
  }
}
</script>