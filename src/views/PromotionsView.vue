<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Promoções e Descontos</h1>
        <p class="text-sm text-slate-500 font-medium">Gerencie campanhas de descontos temporários</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
      >
        <TicketPercentIcon class="w-5 h-5" />
        Nova Promoção
      </button>
    </div>

    <!-- Stats & Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
          <CheckCircle2Icon class="w-6 h-6" />
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativas</p>
          <p class="text-2xl font-black text-slate-900 leading-tight">{{ activeCount }}</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
          <ClockIcon class="w-6 h-6" />
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiradas</p>
          <p class="text-2xl font-black text-slate-900 leading-tight">{{ expiredCount }}</p>
        </div>
      </div>
    </div>

    <!-- Promotions List -->
    <div class="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
              <th class="px-8 py-5">Promoção</th>
              <th class="px-8 py-5">Desconto</th>
              <th class="px-8 py-5">Vigência</th>
              <th class="px-8 py-5">Alvos</th>
              <th class="px-8 py-5">Status</th>
              <th class="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="promo in promotions" :key="promo.id" class="group hover:bg-slate-50/50 transition-all">
              <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                    <TicketIcon class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="font-bold text-slate-700 block">{{ promo.name }}</span>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID #{{ promo.id }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <span class="font-black text-slate-900">{{ formatDiscount(promo) }}</span>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-bold text-slate-600">{{ formatDate(promo.start_date) }}</span>
                  <div class="flex items-center gap-2">
                    <div class="h-px bg-slate-200 w-4"></div>
                    <span class="text-xs font-bold text-slate-400">{{ formatDate(promo.end_date) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <span class="text-[10px] font-black uppercase tracking-tight px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg">
                  {{ promo.target_count }} item(ns)
                </span>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <span 
                    :class="[
                      'w-2 h-2 rounded-full',
                      isPromoActive(promo) ? 'bg-green-500' : 'bg-slate-300'
                    ]"
                  ></span>
                  <span :class="[
                    'text-[10px] font-black uppercase tracking-widest',
                    isPromoActive(promo) ? 'text-green-600' : 'text-slate-400'
                  ]">
                    {{ isPromoActive(promo) ? 'Ativa' : (isExpired(promo) ? 'Expirada' : 'Inativa') }}
                  </span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                  <button @click="toggleStatus(promo)" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" :title="promo.active ? 'Desativar' : 'Ativar'">
                    <PowerIcon class="w-4 h-4" />
                  </button>
                  <button @click="openModal(promo)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Editar">
                    <Edit3Icon class="w-4 h-4" />
                  </button>
                  <button @click="deletePromotion(promo.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir">
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="promotions.length === 0">
              <td colspan="6" class="px-8 py-20 text-center">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                    <TicketPercentIcon class="w-8 h-8" />
                  </div>
                  <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma promoção cadastrada</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Promotion Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ editingId ? 'Editar Promoção' : 'Nova Promoção' }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure os detalhes do desconto</p>
          </div>
          <button @click="showModal = false" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
        </div>
        
        <form @submit.prevent="savePromotion" class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2 md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome da Campanha</label>
              <input v-model="form.name" type="text" placeholder="Ex: Black Friday 2024" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm" />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Desconto</label>
              <select v-model="form.discount_type" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Valor do Desconto</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xs">{{ form.discount_type === 'percentage' ? '%' : 'R$' }}</span>
                <input v-model.number="form.value" type="number" step="0.01" required class="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-black text-sm" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
              <input v-model="form.start_date" type="date" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm" />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data de Expiração</label>
              <input v-model="form.end_date" type="date" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm text-red-600" />
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Alvos da Promoção</label>
              <div class="flex gap-2">
                <button type="button" @click="targetTab = 'products'" :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all', targetTab === 'products' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400']">Produtos</button>
                <button type="button" @click="targetTab = 'categories'" :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all', targetTab === 'categories' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400']">Categorias</button>
              </div>
            </div>

            <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
              <!-- Selection Area for Products -->
              <div v-if="targetTab === 'products'" class="space-y-4">
                <div class="relative">
                  <input v-model="prodSearch" type="text" placeholder="Filtrar produtos..." class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500" />
                  <SearchIcon class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="prod in filteredProducts" 
                    :key="prod.id"
                    type="button"
                    @click="toggleTarget('product', prod.id)"
                    :class="[
                      'flex items-center gap-3 p-3 rounded-2xl border transition-all text-left',
                      isTargetSelected('product', prod.id) 
                        ? 'bg-primary-50 border-primary-200 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    ]"
                  >
                    <div :class="['w-4 h-4 rounded-md border flex items-center justify-center transition-all', isTargetSelected('product', prod.id) ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300']">
                      <CheckIcon v-if="isTargetSelected('product', prod.id)" class="w-3 h-3" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-slate-700 truncate">{{ prod.name }}</p>
                      <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ prod.category_name || 'Geral' }}</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Selection Area for Categories -->
              <div v-if="targetTab === 'categories'" class="grid grid-cols-2 gap-4">
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  type="button"
                  @click="toggleTarget('category', cat.id)"
                  :class="[
                    'flex items-center gap-3 p-4 rounded-2xl border transition-all text-left',
                    isTargetSelected('category', cat.id) 
                      ? 'bg-primary-50 border-primary-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  ]"
                >
                  <div :class="['w-5 h-5 rounded-lg border flex items-center justify-center transition-all', isTargetSelected('category', cat.id) ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300']">
                    <CheckIcon v-if="isTargetSelected('category', cat.id)" class="w-3 h-3" />
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: cat.color }"></div>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-tight">{{ cat.name }}</span>
                  </div>
                </button>
              </div>
            </div>
            
            <p v-if="form.targets.length > 0" class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] text-center">
              {{ form.targets.length }} item(ns) selecionado(s)
            </p>
          </div>
        </form>

        <div class="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          <button @click="savePromotion" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]">
            {{ editingId ? 'Atualizar Promoção' : 'Criar Promoção Ativa' }}
          </button>
          <button @click="showModal = false" class="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-center"> Cancelar </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { 
  TicketPercentIcon, 
  TicketIcon, 
  CheckCircle2Icon, 
  ClockIcon, 
  SearchIcon,
  CheckIcon,
  Trash2Icon,
  Edit3Icon,
  PowerIcon
} from 'lucide-vue-next';

const promotions = ref([]);
const categories = ref([]);
const allProducts = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const targetTab = ref('products');
const prodSearch = ref('');

const form = reactive({
  name: '',
  discount_type: 'percentage',
  value: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  active: 1,
  targets: [] // { target_type, target_id }
});

const loadData = async () => {
  try {
    const [promos, cats, prods] = await Promise.all([
      window.api.getPromotions(),
      window.api.getCategories(),
      window.api.getProducts({ pageSize: 1000 }) // Load all for selection
    ]);
    promotions.value = promos;
    categories.value = cats;
    allProducts.value = prods.data || [];
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
};

const activeCount = computed(() => promotions.value.filter(p => isPromoActive(p)).length);
const expiredCount = computed(() => promotions.value.filter(p => isExpired(p)).length);

const filteredProducts = computed(() => {
  if (!prodSearch.value) return allProducts.value;
  const q = prodSearch.value.toLowerCase();
  return allProducts.value.filter(p => p.name.toLowerCase().includes(q));
});

const isPromoActive = (promo) => {
  if (!promo.active) return false;
  return !isExpired(promo);
};

const isExpired = (promo) => {
  const end = new Date(promo.end_date);
  const now = new Date();
  now.setHours(0,0,0,0);
  return end < now;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDiscount = (promo) => {
  if (promo.discount_type === 'percentage') return `${promo.value}% OFF`;
  return `- ${promo.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
};

const openModal = async (promo = null) => {
  if (promo) {
    editingId.value = promo.id;
    const fullPromo = await window.api.getPromotion(promo.id);
    form.name = fullPromo.name;
    form.discount_type = fullPromo.discount_type;
    form.value = fullPromo.value;
    form.start_date = fullPromo.start_date;
    form.end_date = fullPromo.end_date;
    form.active = fullPromo.active;
    form.targets = fullPromo.targets.map(t => ({ target_type: t.target_type, target_id: t.target_id }));
  } else {
    editingId.value = null;
    form.name = '';
    form.discount_type = 'percentage';
    form.value = 0;
    form.start_date = new Date().toISOString().split('T')[0];
    form.end_date = '';
    form.active = 1;
    form.targets = [];
  }
  showModal.value = true;
};

const toggleTarget = (type, id) => {
  const index = form.targets.findIndex(t => t.target_type === type && t.target_id === id);
  if (index >= 0) {
    form.targets.splice(index, 1);
  } else {
    form.targets.push({ target_type: type, target_id: id });
  }
};

const isTargetSelected = (type, id) => {
  return form.targets.some(t => t.target_type === type && t.target_id === id);
};

const savePromotion = async () => {
  if (form.targets.length === 0) {
    alert('Selecione pelo menos um produto ou categoria alvo!');
    return;
  }
  if (!form.end_date) {
    alert('Defina uma data de expiração!');
    return;
  }

  try {
    const rawForm = JSON.parse(JSON.stringify(form));
    const result = await window.api.savePromotion({ id: editingId.value, ...rawForm });
    if (result.success) {
      showModal.value = false;
      loadData();
    }
  } catch (err) {
    console.error('Erro ao salvar promoção:', err);
  }
};

const toggleStatus = async (promo) => {
  try {
    await window.api.togglePromotionStatus(promo.id);
    loadData();
  } catch (err) {
    console.error('Erro ao alternar status:', err);
  }
};

const deletePromotion = async (id) => {
  if (confirm('Deseja realmente excluir esta promoção?')) {
    try {
      await window.api.deletePromotion(id);
      loadData();
    } catch (err) {
      console.error('Erro ao excluir promoção:', err);
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

.glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}
</style>
