<template>
  <div class="h-full flex flex-col gap-6 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Histórico de Vendas</h1>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gerencie e visualize as vendas recentes do sistema</p>
      </div>
      <button 
        @click="loadSales" 
        class="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
        Atualizar
      </button>
    </div>

    <!-- Sales Table -->
    <div class="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <table class="w-full border-separate border-spacing-0">
          <thead>
            <tr class="text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <th class="px-8 py-5">Cliente</th>
              <th class="px-8 py-5">Data / Hora</th>
              <th class="px-8 py-5 text-right">Total</th>
              <th class="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="sale in sales" :key="sale.id" class="group hover:bg-slate-50/50 transition-all">
              <td class="px-8 py-5 text-sm font-bold text-slate-700">
                {{ sale.customer_name || 'Consumidor Final' }}
              </td>
              <td class="px-8 py-5 text-sm font-medium text-slate-500">
                {{ formatDateTime(sale.date) }}
              </td>
              <td class="px-8 py-5 text-right font-black text-slate-900 text-lg">
                {{ formatCurrency(sale.total) }}
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="viewDetails(sale)"
                    class="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                    title="Ver Detalhes"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button 
                    @click="confirmUndo(sale)"
                    class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Desfazer Venda"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="sales.length === 0" class="h-full flex flex-col items-center justify-center py-24 opacity-30">
          <div class="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <p class="text-xl font-black text-slate-500 tracking-tight uppercase">Nenhuma venda encontrada</p>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="detailsModal.show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in duration-300">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"/><path d="M7 6h10"/><path d="M7 10h10"/><path d="M7 14h10"/><path d="M7 18h6"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">Detalhes da Venda #{{ detailsModal.sale?.id }}</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Itens e valores da transação</p>
            </div>
          </div>
          <button @click="detailsModal.show = false" class="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div class="p-8">
          <table class="w-full">
            <thead>
              <tr class="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th class="py-3">Produto</th>
                <th class="py-3 text-center">Quantidade</th>
                <th class="py-3 text-right">Preço</th>
                <th class="py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in detailsModal.items" :key="item.id">
                <td class="py-4 text-sm font-bold text-slate-700">{{ item.product_name }}</td>
                <td class="py-4 text-sm font-medium text-slate-500 text-center">{{ item.quantity }}</td>
                <td class="py-4 text-sm font-medium text-slate-500 text-right">{{ formatCurrency(item.subtotal / item.quantity) }}</td>
                <td class="py-4 text-sm font-black text-slate-900 text-right">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-slate-200">
                <td colspan="3" class="py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Total da Venda</td>
                <td class="py-6 text-right text-2xl font-black text-primary-600 tracking-tighter">{{ formatCurrency(detailsModal.sale?.total || 0) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            @click="detailsModal.show = false"
            class="w-full py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Undo Modal -->
    <div v-if="undoModal.show" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in duration-300">
        <div class="p-8 border-b border-slate-50 flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">Desfazer Venda #{{ undoModal.sale?.id }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Confirmação de Segurança</p>
          </div>
        </div>

        <form @submit.prevent="handleUndo" class="p-8 space-y-6">
          <div class="space-y-4">
            <p class="text-sm text-slate-500 font-medium leading-relaxed">
              Para estornar esta venda de <span class="text-slate-900 font-bold">{{ formatCurrency(undoModal.sale?.total || 0) }}</span>, confirme suas credenciais de acesso.
            </p>
            
            <div v-if="undoModal.requireManager" class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário Autorizador (Admin/Gerente)</label>
              <input 
                v-model="undoModal.managerUsername"
                type="text" 
                required
                placeholder="Ex: admin"
                class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Autorização</label>
              <input 
                v-model="undoModal.password"
                type="password" 
                required
                placeholder="••••••••"
                class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="undoModal.show = false"
              class="flex-1 py-4 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {{ loading ? 'Processando...' : 'Confirmar Estorno' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { formatCurrency } from '@/utils';

const authStore = useAuthStore();
const sales = ref([]);
const loading = ref(false);
const config = ref(null);

const detailsModal = ref({
  show: false,
  sale: null,
  items: []
});

const undoModal = ref({
  show: false,
  sale: null,
  password: '',
  requireManager: false,
  managerUsername: ''
});

const loadSales = async () => {
  try {
    const result = await window.api.getRecentSales();
    sales.value = result;
  } catch (err) {
    console.error('Erro ao carregar vendas:', err);
  }
};

const viewDetails = async (sale) => {
  try {
    const items = await window.api.getSaleItems(sale.id);
    detailsModal.value = {
      show: true,
      sale: sale,
      items: items
    };
  } catch (err) {
    alert('Erro ao carregar itens da venda: ' + err.message);
  }
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('pt-BR').slice(0, -3);
};

const confirmUndo = (sale) => {
  const isVendedor = authStore.user.role === 'vendedor';
  const canUndo = !isVendedor || (config.value?.allow_salesperson_undo_sale);

  undoModal.value = {
    show: true,
    sale: sale,
    password: '',
    requireManager: !canUndo,
    managerUsername: ''
  };
};

const handleUndo = async () => {
  if (loading.value) return;
  loading.value = true;

  const authData = undoModal.value.requireManager 
    ? { username: undoModal.value.managerUsername, password: undoModal.value.password }
    : { username: authStore.user.username, password: undoModal.value.password };

  if (undoModal.value.requireManager && !authData.username) {
    alert('Por favor, informe o usuário do gerente/administrador.');
    loading.value = false;
    return;
  }

  try {
    const result = await window.api.undoSale(undoModal.value.sale.id, authData);

    if (result.success) {
      alert('Venda desfeita com sucesso! O estoque e o saldo do cliente foram atualizados.');
      undoModal.value.show = false;
      await loadSales();
    } else {
      alert('Erro: ' + result.error);
    }
  } catch (err) {
    alert('Erro ao desfazer venda: ' + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadSales();
  config.value = await window.api.getConfig();
});
</script>
