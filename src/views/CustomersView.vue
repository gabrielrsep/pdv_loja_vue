<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToastStore } from '@/store/toast'
import { formatCurrency } from '@/utils';

const customers = ref([]);
const totalItems = ref(0);
const search = ref('');
const page = ref(1);
const pageSize = 8;
const showModal = ref(false);
const statsModal = ref(false);
const loadingStats = ref(false);
const editingId = ref(null);
const selectedCustomer = ref(null);
const currentStats = ref({});

const toastStore = useToastStore();

const form = reactive({
  name: '',
  phone: '',
  age: null,
  address: '',
  balance: 0,
  observations: '',
  can_sell: 1
});

const fetchCustomers = async () => {
  try {
    const result = await window.api.getCustomers({
      page: page.value,
      pageSize,
      search: search.value
    });
    customers.value = result.data;
    totalItems.value = result.total;
  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
  }
};

const openModal = (c = null) => {
  if (c) {
    editingId.value = c.id;
    form.name = c.name;
    form.phone = c.phone || '';
    form.age = c.age;
    form.address = c.address || '';
    form.balance = c.balance;
    form.observations = c.observations || '';
    form.can_sell = c.can_sell;
  } else {
    editingId.value = null;
    form.name = '';
    form.phone = '';
    form.age = null;
    form.address = '';
    form.balance = 0;
    form.observations = '';
    form.can_sell = 1;
  }
  showModal.value = true;
};

const showStats = async (c) => {
  selectedCustomer.value = c;
  loadingStats.value = true;
  statsModal.value = true;
  try {
    currentStats.value = await window.api.getCustomerStats(c.id);
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
  } finally {
    loadingStats.value = false;
  }
};

const saveCustomer = async () => {
  try {
    const result = await window.api.saveCustomer({
      id: editingId.value,
      ...form
    });

    if (result.success) {
      showModal.value = false;
      fetchCustomers();
    } else {
      alert(result.error || 'Erro ao salvar cliente');
    }
  } catch (err) {
    alert('Erro na comunicação com o sistema');
  }
};

const deleteCustomer = async (id) => {
  if (confirm('Deseja excluir permanentemente este cliente? Esta ação não afetará vendas passadas, mas o cliente será removido da base.')) {
    const result = await window.api.deleteCustomer(id);
    if (result.success) fetchCustomers();
    else alert(result.error);
  }
};

const changePage = (delta) => {
  page.value += delta;
  fetchCustomers();
};

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const subtractBalance = event => {
  form.balance = form.balance - event.target.value;
  if (form.balance < 0) {
    toastStore.addToast({
      type: 'error',
      message: 'O saldo não pode ser negativo'
    });
    form.balance = 0;
  }
  event.target.value = '';
};

onMounted(fetchCustomers);
</script>


<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestão de Clientes</h1>
        <p class="text-sm text-slate-500 font-medium">Controle sua base de clientes e históricos de crédito</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
        Novo Cliente
      </button>
    </div>

    <!-- Quick Stats & Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Clientes</p>
          <p class="text-2xl font-black text-slate-900 leading-tight">{{ totalItems }}</p>
        </div>
      </div>

      <div class="md:col-span-3 bg-white p-3 rounded-3xl shadow-sm border border-slate-100 flex items-center">
        <div class="relative flex-1 group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            v-model="search" 
            @input="fetchCustomers"
            type="text" 
            placeholder="Pesquisar por nome, ou ID..." 
            class="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 outline-none text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
              <th class="px-8 py-5">Cliente</th>
              <th class="px-8 py-5">Contato</th>
              <th class="px-8 py-5">Endereço</th>
              <th class="px-8 py-5 text-right">Saldo Devedor</th>
              <th class="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="c in customers" :key="c.id" class="group hover:bg-slate-50/50 transition-all">
              <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors font-bold text-xs uppercase">
                    {{ c.name.substring(0, 2) }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-700">{{ c.name }}</p>
                    <p class="text-[10px] text-slate-400 font-medium tracking-tight">ID #{{ c.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 text-sm text-slate-600 font-medium">{{ c.phone || 'Sem telefone' }}</td>
              <td class="px-8 py-5 text-sm text-slate-500 truncate max-w-[200px]">{{ c.address || 'Sem endereço' }}</td>
              <td class="px-8 py-5 text-right">
                <span :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-black border',
                  c.balance > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                ]">
                  {{ formatCurrency(c.balance) }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                  <button @click="showStats(c)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Estatísticas">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  </button>
                  <button @click="openModal(c)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button @click="deleteCustomer(c.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Página {{ page }} de {{ Math.ceil(totalItems / pageSize) || 1 }}</span>
        <div class="flex gap-2">
          <button @click="changePage(-1)" :disabled="page === 1" class="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button @click="changePage(1)" :disabled="page * pageSize >= totalItems" class="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cadastro/Edição -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ editingId ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ editingId ? 'ID #' + editingId : 'Preencha os dados cadastrais' }}</p>
          </div>
          <button @click="showModal = false" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
        </div>
        
        <form @submit.prevent="saveCustomer" class="p-8 space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input v-model="form.name" type="text" placeholder="Ex: Roberto Carlos" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-sm" />
            </div>
            
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                <input v-model="form.phone" type="text" placeholder="(00) 00000-0000" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-bold text-sm" />
              </div>
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Idade</label>
                <input v-model.number="form.age" type="number" placeholder="Ex: 30" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-black text-sm text-center" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endereço Residencial</label>
              <input v-model="form.address" type="text" placeholder="Rua, Número, Bairro, Cidade" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-sm" />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observações</label>
              <textarea v-model="form.observations" placeholder="Observações sobre o cliente..." rows="3" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium text-sm resize-none"></textarea>
            </div>

            <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input type="checkbox" id="can_sell" v-model="form.can_sell" :true-value="1" :false-value="0" class="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300" />
              <label for="can_sell" class="text-sm font-bold text-slate-700 cursor-pointer select-none">Pode vender para este cliente</label>
            </div>

            <div class="space-y-2">

              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Saldo em Aberto (R$)</label>
              <p class="font-bold text-red-600 uppercase tracking-widest ml-1">{{ formatCurrency(form.balance) }}</p>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subtrair Saldo</label>
              
              <input @keydown.enter.prevent="subtractBalance" type="number" step="0.01" class="w-full pl-5 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-black text-sm" />
              <p v-if="editingId" class="text-[9px] text-slate-400 italic">Ao diminuir o saldo, a data de último pagamento será atualizada automaticamente.</p>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-4 border-t border-slate-50">
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
              {{ editingId ? 'Atualizar Cliente' : 'Cadastrar Cliente' }}
            </button>
            <button type="button" @click="showModal = false" class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Estatísticas -->
    <div v-if="statsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ selectedCustomer?.name }}</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Painel de Comportamento do Cliente</p>
            </div>
          </div>
          <button @click="statsModal = false" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all font-bold">✕</button>
        </div>

        <div v-if="loadingStats" class="p-20 flex flex-col items-center justify-center gap-4">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando histórico...</p>
        </div>

        <div v-else class="p-8 space-y-8">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Compras</p>
              <p class="text-lg font-black text-slate-900">{{ currentStats.totalOrders || 0 }}</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gasto</p>
              <p class="text-lg font-black text-slate-900">{{ formatCurrency(currentStats.totalSpent || 0) }}</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
              <p class="text-lg font-black text-slate-900">{{ formatCurrency(currentStats.averageTicket || 0) }}</p>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Atual</p>
              <p class="text-lg font-black text-orange-600">{{ formatCurrency(selectedCustomer?.balance || 0) }}</p>
            </div>
          </div>

          <!-- Timeline / Dates -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Compra</p>
              <p class="text-sm font-bold text-slate-700">{{ currentStats.lastPurchase ? formatDate(currentStats.lastPurchase) : 'Nenhuma' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Pagamento</p>
              <p class="text-sm font-bold text-emerald-600">{{ currentStats.lastPayment ? formatDate(currentStats.lastPayment) : 'Nenhum registro' }}</p>
            </div>
            <div class="space-y-1 col-span-2" v-if="currentStats.observations">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações</p>
              <p class="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{{ currentStats.observations }}</p>
            </div>
          </div>

          <!-- Top Products -->
          <div class="space-y-4">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Principais Produtos</h3>
            <div class="space-y-2">
              <div v-for="(p, idx) in currentStats.topProducts" :key="idx" class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md text-[10px] font-black text-slate-400">#{{ idx + 1 }}</span>
                  <span class="font-bold text-sm text-slate-700">{{ p.name }}</span>
                </div>
                <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{{ p.totalQty }} un</span>
              </div>
              <div v-if="!currentStats.topProducts?.length" class="text-center py-4 text-slate-400 text-xs italic">
                Nenhum produto adquirido ainda.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

