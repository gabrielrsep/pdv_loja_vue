<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestão de Estoque</h1>
        <p class="text-sm text-slate-500 font-medium">Controle seus produtos e níveis de estoque</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Novo Produto
      </button>
    </div>

    <!-- Quick Stats & Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        </div>
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Produtos</p>
          <p class="text-2xl font-black text-slate-900 leading-tight">{{ products.length }}</p>
        </div>
      </div>

      <div class="md:col-span-2 bg-white p-3 rounded-3xl shadow-sm border border-slate-100 flex items-center">
        <div class="relative flex-1 group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            v-model="search" 
            @input="fetchProducts"
            type="text" 
            placeholder="Pesquisar por nome ou código..." 
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
              <th class="px-8 py-5">Código</th>
              <th class="px-8 py-5">Produto</th>
              <th class="px-8 py-5">Departamento</th>
              <th class="px-8 py-5">Custo</th>
              <th class="px-8 py-5">Venda</th>
              <th class="px-8 py-5">Estoque</th>
              <th class="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="product in products" :key="product.id" class="group hover:bg-slate-50/50 transition-all">
              <td class="px-8 py-5">
                <span class="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">#{{ product.id }}</span>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <span 
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: product.category_color || '#CBD5E1' }"
                  ></span>
                  <span class="font-bold text-slate-700">{{ product.name }}</span>
                </div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 ml-5">{{ product.category_name || 'Sem Categoria' }}</p>
              </td>
              <td class="px-8 py-5">
                <span v-if="product.gender" class="text-[10px] font-black uppercase tracking-tight px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">
                  {{ product.gender }}
                </span>
                <span v-else class="text-[10px] font-bold text-slate-300 italic uppercase">Não definido</span>
              </td>
              <td class="px-8 py-5 font-bold text-slate-400 text-xs">{{ formatCurrency(product.cost_price) }}</td>
              <td class="px-8 py-5 font-black text-slate-900">{{ formatCurrency(product.price) }}</td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500" 
                      :class="product.stock <= 5 ? 'bg-red-500' : 'bg-green-500'"
                      :style="{ width: Math.min(product.stock * 10, 100) + '%' }"
                    ></div>
                  </div>
                  <span :class="[
                    'text-xs font-black uppercase tracking-tight px-2 py-1 rounded-lg',
                    product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  ]">
                    {{ product.stock }} un
                  </span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                  <button @click="openModal(product)" class="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button @click="generateProductQr(product)" class="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" title="Gerar Etiqueta QR">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                  </button>
                  <button @click="deleteProduct(product.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Excluir">
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
        <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Página {{ page }}</span>
        <div class="flex gap-2">
          <button @click="changePage(-1)" :disabled="page === 1" class="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button @click="changePage(1)" :disabled="products.length < pageSize" class="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Redesign -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">{{ editingId ? 'Editar Produto' : 'Novo Produto' }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ editingId ? 'Identificador #' + editingId : 'Preencha os campos abaixo' }}</p>
          </div>
          <button @click="showModal = false" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
        </div>
        
        <form @submit.prevent="saveProduct" class="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
              <input v-model="form.name" type="text" placeholder="Ex: Camiseta Oversized" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm" />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
              <select v-model="form.category_id" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                <option :value="null">Sem Categoria</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tamanho (Opcional)</label>
              <input v-model="form.size" type="text" placeholder="Ex: M, 42, Único" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm" />
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gênero / Departamento (Opcional)</label>
              <select v-model="form.gender" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm appearance-none cursor-pointer">
                <option :value="null">Não especificado</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Unissex">Unissex</option>
                <option value="Infantil">Infantil</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço de Custo</label>
              <div class="relative flex gap-2">
                <div class="relative flex-1">
                  <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xs">R$</span>
                  <input v-model.number="form.cost_price" type="number" step="0.01" required class="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-bold text-sm" />
                </div>
                <button 
                  type="button"
                  @click="applyMargin"
                  class="px-4 bg-primary-50 text-primary-600 rounded-2xl border border-primary-100 font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  title="Aplicar Margem do Sistema"
                >
                  +{{ settingsStore.config.margin }}%
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preço de Venda</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-xs">R$</span>
                <input v-model.number="form.price" type="number" step="0.01" required class="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-black text-sm" />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estoque Inicial</label>
            <input v-model.number="form.stock" type="number" placeholder="0" required class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-black text-sm text-center" />
          </div>

          <div class="flex flex-col gap-3 pt-4">
            <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]">
              {{ editingId ? 'Atualizar Produto' : 'Cadastrar Produto' }}
            </button>
            <button type="button" @click="showModal = false" class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
              Descartar alterações
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQrModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Etiqueta do Produto</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Visualização de Impressão</p>
          </div>
          <button @click="closeQrModal" class="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
        </div>
        
        <div class="p-8 flex flex-col items-center gap-6 bg-white" id="printable-label">
          <div class="text-center space-y-1">
            <h3 class="font-black text-slate-900 text-lg leading-tight">{{ selectedProductForQr?.name }}</h3>
            <p v-if="selectedProductForQr?.size" class="font-bold text-slate-500 text-sm">Tamanho: {{ selectedProductForQr?.size }}</p>
          </div>
          
          <div class="p-4 bg-white rounded-xl border-2 border-slate-900">
             <img :src="qrCodeUrl" class="w-32 h-32 object-contain" style="image-rendering: pixelated" />
          </div>
          
          <p class="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">#{{ selectedProductForQr?.id }}</p>
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button @click="printLabel" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useSettingsStore } from '@/store/settings';
import { formatCurrency } from '@/utils';

const settingsStore = useSettingsStore();

const products = ref([]);
const search = ref('');
const page = ref(1);
const pageSize = 10;
const showModal = ref(false);
const editingId = ref(null);

const form = reactive({
  name: '',
  price: 0,
  cost_price: 0,
  stock: 0,
  category_id: null,
  gender: null,
  size: ''
});

const categories = ref([]);

const loadCategories = async () => {
  try {
    categories.value = await window.api.getCategories();
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
  }
};

const fetchProducts = async () => {
  try {
    const result = await window.api.getProducts({ 
      page: page.value, 
      pageSize, 
      search: search.value 
    });
    products.value = result.data;
  } catch (err) {
    console.error('Erro ao carregar estoque:', err);
  }
};

const openModal = (product = null) => {
  if (product) {
    editingId.value = product.id;
    form.name = product.name;
    form.price = product.price;
    form.cost_price = product.cost_price || 0;
    form.stock = product.stock;
    form.category_id = product.category_id;
    form.gender = product.gender;
    form.size = product.size || '';
  } else {
    editingId.value = null;
    form.name = '';
    form.price = 0;
    form.cost_price = 0;
    form.stock = 0;
    form.category_id = null;
    form.gender = null;
    form.size = '';
  }
  showModal.value = true;
};

// QR Code Logic
const showQrModal = ref(false);
const qrCodeUrl = ref('');
const selectedProductForQr = ref(null);

const generateProductQr = async (product) => {
  try {
    selectedProductForQr.value = product;
    const result = await window.api.generateQR(product.id.toString());
    if (result.success) {
      qrCodeUrl.value = result.url;
      showQrModal.value = true;
    } else {
      alert('Erro ao gerar QRCode: ' + result.error);
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao gerar QRCode');
  }
};

const closeQrModal = () => {
  showQrModal.value = false;
  qrCodeUrl.value = '';
  selectedProductForQr.value = null;
};

const printLabel = () => {
  const content = document.getElementById('printable-label').innerHTML;
  const win = window.open('', '', 'height=500,width=500');
  win.document.write('<html><head><title>Imprimir Etiqueta</title>');
  win.document.write('<style>');
  win.document.write(`
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .label-container { display: flex; flex-col; align-items: center; text-align: center; width: 100%; max-width: 300px; padding: 20px; }
    h3 { margin: 0 0 5px 0; font-size: 16px; font-weight: 900; }
    p { margin: 0; font-size: 14px; font-weight: 700; color: #64748B; }
    img { width: 150px; height: 150px; margin: 10px 0; image-rendering: pixelated; }
    .code { font-family: monospace; font-size: 12px; font-weight: 700; color: #000; background: #F1F5F9; padding: 4px 8px; border-radius: 4px; }
  `);
  win.document.write('</style></head><body>');
  win.document.write('<div class="label-container">' + content + '</div>');
  win.document.write('</body></html>');
  win.document.close();
  win.print();
};

const applyMargin = () => {
  if (!form.cost_price) return;
  const margin = settingsStore.config.margin || 0;
  form.price = Number((form.cost_price * (1 + margin / 100)).toFixed(2));
};

const saveProduct = async () => {
  try {
    const result = await window.api.saveProduct({ id: editingId.value, ...form });

    if (result.success) {
      showModal.value = false;
      fetchProducts();
    } else {
      alert(result.error);
    }
  } catch (err) {
    alert('Erro ao salvar produto');
  }
};

const deleteProduct = async (id) => {
  if (confirm('Deseja realmente excluir este produto?')) {
    const result = await window.api.deleteProduct(id);
    if (result.success) fetchProducts();
  }
};

const changePage = (delta) => {
  page.value += delta;
  fetchProducts();
};

onMounted(async () => {
  await settingsStore.fetchConfig();
  fetchProducts();
  loadCategories();
});
</script>