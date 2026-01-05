<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Controle de Acesso</h1>
        <p class="text-sm text-slate-500 font-medium">Gerencie usuários e permissões do sistema</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
        Novo Usuário
      </button>
    </div>

    <!-- Main Table Card -->
    <div class="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
              <th class="px-8 py-5">Identificação</th>
              <th class="px-8 py-5">Cargo / Nível</th>
              <th class="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="u in users" :key="u.id" class="group hover:bg-slate-50/50 transition-all">
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span class="font-bold text-slate-700">{{ u.username }}</span>
                  <span v-if="u.id === authStore.user.id" class="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Você</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                    u.role === 'administrador' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                    u.role === 'gerente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  ]"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                  <button @click="openModal(u)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button 
                    @click="deleteUser(u)" 
                    :disabled="u.id === authStore.user.id"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                    title="Excluir"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Redesign -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ editingId ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ editingId ? 'ID #' + editingId : 'Crie um novo acesso' }}</p>
          </div>
          <button @click="showModal = false" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
        </div>
        
        <form @submit.prevent="saveUser" class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Login do Usuário</label>
            <input v-model="form.username" type="text" placeholder="Nome de acesso" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold uppercase text-sm" />
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <input v-model="form.password" type="password" :required="!editingId" placeholder="••••••••" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium" />
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cargo</label>
              <div class="relative">
                <select v-model="form.role" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-bold text-sm bg-white cursor-pointer appearance-none">
                  <option value="vendedor">Vendedor</option>
                  <option value="gerente">Gerente</option>
                  <option value="administrador">Administrador</option>
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-50 space-y-4">
            <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Segurança Extra</p>
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pergunta Secreta</label>
                <input v-model="form.recovery_question" type="text" placeholder="Ex: Nome da sua mãe" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
              </div>
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Resposta</label>
                <input v-model="form.recovery_answer" type="text" placeholder="Sua resposta" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4">
            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]">
              {{ editingId ? 'Atualizar Acesso' : 'Criar Usuário' }}
            </button>
            <button type="button" @click="showModal = false" class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const users = ref([]);
const showModal = ref(false);
const editingId = ref(null);

const form = reactive({
  username: '',
  password: '',
  role: 'vendedor',
  recovery_question: '',
  recovery_answer: ''
});

const loadUsers = async () => {
  try {
    // window.api.getUsers é a ponte com o seu arquivo main do Electron
    users.value = await window.api.getUsers();
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
  }
};

const openModal = (user = null) => {
  if (user) {
    editingId.value = user.id;
    form.username = user.username;
    form.role = user.role;
    form.recovery_question = user.recovery_question || '';
    form.password = ''; // Não carregamos a senha por segurança
    form.recovery_answer = '';
  } else {
    editingId.value = null;
    form.username = '';
    form.password = '';
    form.role = 'vendedor';
    form.recovery_question = '';
    form.recovery_answer = '';
  }
  showModal.value = true;
};

const saveUser = async () => {
  try {
    const userData = { ...form, username: form.username.toUpperCase() };
    let result;

    if (editingId.value) {
      result = await window.api.updateUser({ id: editingId.value, ...userData });
    } else {
      result = await window.api.createUser(userData);
    }

    if (result.success) {
      showModal.value = false;
      loadUsers();
    } else {
      alert(result.error);
    }
  } catch (err) {
    alert('Erro ao processar solicitação.');
  }
};

const deleteUser = async (user) => {
  if (user.id === authStore.user.id) {
    return alert('Você não pode excluir seu próprio usuário!');
  }
  
  if (confirm(`Tem certeza que deseja excluir o usuário ${user.username}?`)) {
    const result = await window.api.deleteUser(user.id);
    if (result.success) loadUsers();
    else alert(result.error);
  }
};

onMounted(loadUsers);
</script>