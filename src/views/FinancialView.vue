<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Controle Financeiro</h1>
        <p class="text-sm text-slate-500 font-medium">Gestão de custos, boletos e compromissos</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Novo Lançamento
      </button>
    </div>

    <!-- Stats & Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Balance Card -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total no Mês</p>
          <p class="text-2xl font-black text-slate-900 leading-tight">{{ formatCurrency(totalMonth) }}</p>
        </div>
      </div>

      <!-- Month Selector -->
      <div class="md:col-span-3 bg-white p-3 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="flex items-center gap-2 pl-4 border-r border-slate-100 pr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <input 
            v-model="currentDate" 
            @change="fetchData"
            type="month" 
            class="bg-transparent border-0 outline-none text-slate-700 font-bold uppercase text-sm cursor-pointer"
          />
        </div>
        <div class="flex-1 flex items-center gap-2 max-w-xs">
          <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Agendados:</span>
          <div class="flex -space-x-2 overflow-hidden">
             <div v-for="n in 3" :key="n" class="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100"></div>
          </div>
          <span class="text-[10px] font-bold text-slate-400">{{ futureChecks.length }} vindo aí</span>
        </div>
      </div>
    </div>

    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Main List -->
      <div class="flex-[2] bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto pt-4">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                <th class="px-8 py-5">Vencimento</th>
                <th class="px-8 py-5">Tipo / Descrição</th>
                <th class="px-8 py-5 text-right">Valor</th>
                <th class="px-8 py-5">Status</th>
                <th class="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in items" :key="item.id" class="group hover:bg-slate-50/50 transition-all">
                <td class="px-8 py-5">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-700">{{ formatDay(item.due_date) }}</span>
                    <span class="text-[10px] text-slate-400 uppercase font-black">{{ formatMonthName(item.due_date) }}</span>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div :class="[
                      'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase',
                      getTypeStyles(item.type)
                    ]">
                      {{ item.type ? item.type[0] : 'C' }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-700 text-sm">{{ item.description || 'Sem descrição' }}</p>
                      <p class="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{{ item.type || 'cheque' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5 text-right font-black text-slate-900">{{ formatCurrency(item.amount) }}</td>
                <td class="px-8 py-5">
                  <button 
                    @click="toggleStatus(item)"
                    :class="[
                      'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border',
                      item.status === 'pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse-slow'
                    ]"
                  >
                    {{ item.status }}
                  </button>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                    <button @click="openModal(item)" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button @click="deleteItem(item.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="5" class="py-20 text-center">
                  <p class="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhum lançamento encontrado para este período</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sidebar Dashboard -->
      <div class="flex-1 flex flex-col gap-6">
        <div class="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div class="relative z-10">
            <h3 class="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Próximos Pagamentos</h3>
            <div class="space-y-4">
              <div v-for="f in futureChecks" :key="f.id" class="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <div>
                  <p class="text-xs font-bold">{{ f.description || 'Sem descrição' }}</p>
                  <p class="text-[9px] text-indigo-200 uppercase font-black">{{ formatDateSimple(f.due_date) }}</p>
                </div>
                <p class="text-sm font-black">{{ formatCurrency(f.amount) }}</p>
              </div>
              <p v-if="futureChecks.length === 0" class="text-xs text-indigo-200 italic">Tudo em dia!</p>
            </div>
          </div>
        </div>

        <div class="flex-1 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <h3 class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Ações Rápidas</h3>
          <div class="space-y-2">
            <button @click="currentDate = getNowMonth(); fetchData()" class="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-3 group">
               <div class="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
               <span class="text-xs font-bold text-slate-700">Ir para o Mês Atual</span>
            </button>
            <div class="p-4 bg-orange-50 rounded-2xl border border-orange-100 mt-4">
              <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Atenção</p>
              <p class="text-[11px] text-orange-700 font-medium leading-relaxed">Você possui lançamentos pendentes que vencem hoje.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ editingId ? 'Editar Lançamento' : 'Novo Lançamento' }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ editingId ? 'ID #' + editingId : 'Registre uma nova conta' }}</p>
          </div>
          <button @click="showModal = false" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all font-bold">✕</button>
        </div>
        
        <form @submit.prevent="saveItem" class="p-8 space-y-5">
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
            <input v-model="form.description" type="text" placeholder="Ex: Aluguel da Loja" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-bold text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Valor</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xs">R$</span>
                <input v-model.number="form.amount" type="number" step="0.01" required class="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-black text-sm" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
              <select v-model="form.type" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                <option value="cheque">Cheque</option>
                <option value="boleto">Boleto</option>
                <option value="fixo">Gasto Fixo</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
              <input v-model="form.due_date" type="date" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-bold text-sm" />
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status Inicial</label>
              <select v-model="form.status" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4 border-t border-slate-50">
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]">
              {{ editingId ? 'Salvar Alterações' : 'Confirmar Lançamento' }}
            </button>
            <button type="button" @click="showModal = false" class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
              Descartar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';

const getNowMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const items = ref([]);
const futureChecks = ref([]);
const currentDate = ref(getNowMonth());
const showModal = ref(false);
const editingId = ref(null);

const form = reactive({
  description: '',
  amount: 0,
  type: 'cheque',
  due_date: new Date().toISOString().split('T')[0],
  status: 'pendente'
});

const totalMonth = computed(() => {
    return items.value.reduce((acc, curr) => acc + curr.amount, 0);
});

const fetchData = async () => {
    try {
        items.value = await window.api.getChecks(currentDate.value);
        futureChecks.value = await window.api.getFutureChecks();
    } catch (err) {
        console.error('Erro ao buscar dados financeiros:', err);
    }
}

const openModal = (item = null) => {
    if (item) {
        editingId.value = item.id;
        form.description = item.description || '';
        form.amount = item.amount;
        form.type = item.type || 'cheque';
        form.due_date = item.due_date;
        form.status = item.status;
    } else {
        editingId.value = null;
        form.description = '';
        form.amount = 0;
        form.type = 'cheque';
        form.due_date = new Date().toISOString().split('T')[0];
        form.status = 'pendente';
    }
    showModal.value = true;
}

const saveItem = async () => {
    try {
        const result = await window.api.saveCheck({
            id: editingId.value,
            ...form
        });
        if (result.success) {
            showModal.value = false;
            fetchData();
        }
    } catch (err) {
        console.error('Erro ao salvar item:', err);
    }
}

const toggleStatus = async (item) => {
    const newStatus = item.status === 'pago' ? 'pendente' : 'pago';
    try {
        const result = await window.api.toggleCheckStatus({ id: item.id, status: newStatus });
        if (result.success) fetchData();
    } catch (err) {
        console.error('Erro ao alternar status:', err);
    }
}

const deleteItem = async (id) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
        const result = await window.api.deleteCheck(id);
        if (result.success) fetchData();
    }
}

const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDay = (dateStr) => {
    return new Date(dateStr + 'T12:00:00').getDate();
}

const formatMonthName = (dateStr) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' });
}

const formatDateSimple = (dateStr) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const getTypeStyles = (type) => {
    switch(type) {
        case 'boleto': return 'bg-orange-100 text-orange-600';
        case 'fixo': return 'bg-purple-100 text-purple-600';
        case 'cheque': return 'bg-blue-100 text-blue-600';
        default: return 'bg-slate-100 text-slate-600';
    }
}

onMounted(fetchData);
</script>

<style scoped>
.animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
</style>
