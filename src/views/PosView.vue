<script setup>
import { formatCurrency } from '@/utils';
import { ref, computed, onMounted } from 'vue';
import ClientCombobox from '@/components/ClientCombobox.vue';
import { useToastStore } from '@/store/toast';
import { useSettingsStore } from '@/store/settings';

const toastStore = useToastStore();
const settingsStore = useSettingsStore();

const searchQuery = ref('');
const products = ref([]);
const cart = ref([]);
const selectedCustomerId = ref('');
const toAccount = ref(false);
let searchTimeout = null;

onMounted(() => {
  settingsStore.fetchConfig();
});

const calculateDiscount = (price, promotional_price) => {
  return ((1 - (promotional_price / price)) * 100).toFixed(2)
};

const showPrice = price => {
  function truncarDecimais(valor, casas) {
    const multiplicador = Math.pow(10, casas);
    return Math.floor(valor * multiplicador) / multiplicador;
  }
  return formatCurrency(truncarDecimais(price, 1))
}

// Busca de produtos com debounce
const handleSearch = () => {
  if (!searchQuery.value) {
    products.value = [];
    return;
  }
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      products.value = await window.api.searchProducts(searchQuery.value);
    } catch (err) {
      console.error('Erro na busca:', err);
    }
  }, 300);
};

const effectivePrice = product => {
  return product.promotional_price != product.price ? product.promotional_price : product.price;
}

// Adicionar item ao carrinho
const addToCart = product => {
  const effective_price = effectivePrice(product);
  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      toastStore.showToast('Estoque insuficiente!', 'error');
      return;
    }
    existingItem.quantity++;
    existingItem.subtotal = existingItem.quantity * existingItem.price;
  } else {
    if (product.stock <= 0) {
      toastStore.showToast('Produto sem estoque!', 'error');
      return;
    }
    cart.value.push({
      id: product.id,
      name: product.name,
      price: effective_price,
      quantity: 1,
      subtotal: effective_price,
      stock: product.stock
    });
  }
};

const updateQuantity = (index, change) => {
  const item = cart.value[index];
  const newQuantity = item.quantity + change;
  if (newQuantity > 0 && newQuantity <= item.stock) {
    item.quantity = newQuantity;
    item.subtotal = item.quantity * item.price;
  } else if (newQuantity <= 0) {
    cart.value.splice(index, 1);
  } else {
    toastStore.showToast('Limite de estoque atingido!', 'error');
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const total = computed(() => {
  return cart.value.reduce((acc, item) => acc + item.subtotal, 0);
});

const checkout = async () => {
  if (cart.value.length === 0) return;
  try {
    const cleanCart = JSON.parse(JSON.stringify(cart.value));
    const result = await window.api.createSale({
      total: total.value,
      items: cleanCart,
      customer_id: selectedCustomerId.value || null,
      to_account: toAccount.value
    });
    
    if (result.success) {
      toastStore.showToast('Venda realizada com sucesso!');
      const printDevice = settingsStore.config.printer_device_name
      if(printDevice) {
        window.api.printCart({
          items: cleanCart,
          total: total.value,
          customer_id: selectedCustomerId.value,
          date: result.date,
          sale_id: result.saleId
        }, printDevice);
      }
      
      cart.value = [];
      selectedCustomerId.value = null;
      toAccount.value = false;
      handleSearch(); // Atualiza estoque na lista
    } else {
      toastStore.showToast('Erro ao finalizar venda: ' + result.error, 'error');
    }
  } catch (err) {
    toastStore.showToast('Erro ao finalizar venda: ' + err.message, 'error');
  }
};

const handleCustomerSelected = (customer, clearState) => {
  if(customer.can_sell === 0) {
    toastStore.showToast('Não é possível vender para este cliente por conta de restrições do estabelecimento', 'error');
    clearState();
  }
};
</script>

<template>
  <div class="flex h-full gap-6 overflow-hidden">
    <!-- Left Column: Products -->
    <div class="flex-1 flex flex-col gap-6 min-w-0">
      <!-- Search Bar -->
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400 group-focus-within:text-primary-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Buscar produtos (Nome ou Código)..." 
          class="w-full pl-16 pr-6 py-5 bg-white border-0 rounded-[2rem] shadow-sm focus:ring-2 focus:ring-primary-500 outline-none text-xl font-medium placeholder:text-slate-400 transition-all focus:shadow-xl focus:shadow-primary-600/5"
        />
      </div>

      <!-- Product List -->
      <div class="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 class="font-black text-slate-900 text-xl tracking-tight">Catálogo de Produtos</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Selecione itens para o carrinho</p>
          </div>
          <span class="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest shadow-sm">{{ products.length }} itens encontrados</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-8">
          <div v-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            <div v-for="product in products" :key="product.id" class="group bg-white rounded-[2.5rem] border border-slate-100 p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-600/10 hover:border-primary-100 flex flex-col justify-between relative overflow-hidden h-full">
              <!-- Decorative Background Gradient -->
              <div class="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="relative z-10">
                <div class="flex justify-between items-start mb-6">
                  <span 
                    :class="[
                      'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm',
                      product.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                    ]"
                  >
                    {{ product.stock }} EM ESTOQUE
                  </span>
                  <span class="text-[11px] font-black text-slate-200 uppercase tracking-widest group-hover:text-primary-200 transition-colors">#{{ product.id }}</span>
                </div>
                
                <h4 class="font-black text-slate-800 text-xl leading-tight mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3.5rem]">{{ product.name }}</h4>
                <div class="flex items-center gap-2 flex-wrap">
                  <div class="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-primary-50 transition-all">
                    <span 
                      v-if="product.category_color" 
                      class="w-2.5 h-2.5 rounded-full shadow-sm" 
                      :style="{ backgroundColor: product.category_color }"
                    ></span>
                    <p class="text-[10px] font-black text-slate-500 uppercase tracking-wider">{{ product.category_name || 'Geral' }}</p>
                  </div>
                  <span v-if="product.gender" class="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-widest group-hover:bg-primary-50 group-hover:text-primary-400 transition-all">
                    {{ product.gender }}
                  </span>
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div class="flex flex-col">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">Preço</span>
                  
                  <!-- Sem promoção -->
                  <div v-if="product.promotional_price == product.price" class="flex items-baseline gap-1">
                    <span class="text-xs font-black text-slate-900">R$</span>
                    <span class="font-black text-slate-900 text-2xl tracking-tighter">{{ product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                  </div>
                  
                  <!-- Com promoção -->
                  <div v-else class="space-y-1">
                    <div class="flex items-center gap-2">
                      <div class="flex items-baseline gap-1 opacity-60">
                        <span class="text-[10px] font-black text-slate-500">DE R$</span>
                        <span class="font-black text-slate-500 text-sm line-through tracking-tighter">{{ showPrice(product.price) }}</span>
                      </div>
                      <span class="px-2 py-0.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg">
                        -{{ calculateDiscount(product.price, product.promotional_price) }}%
                      </span>
                    </div>
                    <div class="flex items-baseline gap-1">
                      <span class="text-xs font-black text-primary-600">POR R$</span>
                      <span class="font-black text-primary-600 text-2xl tracking-tighter">{{ showPrice(product.promotional_price) }}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="addToCart(product)"
                  class="w-14 h-14 bg-primary-600 text-white rounded-[1.25rem] flex items-center justify-center hover:bg-primary-700 transition-all duration-300 shadow-xl shadow-primary-600/30 active:scale-90 transform hover:-translate-y-1 group-hover:rotate-6"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="products.length === 0" class="h-full flex flex-col items-center justify-center py-24 opacity-30">
            <div class="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <p class="text-xl font-black text-slate-500 tracking-tight uppercase">Pronto para vender</p>
            <p class="text-sm font-medium text-slate-400 mt-2">Busque um produto para começar</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Cart -->
    <div class="w-[420px] flex flex-col gap-6">
      <div class="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col overflow-hidden relative">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-20">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-primary-600/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black text-slate-900 tracking-tight">Meu Carrinho</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{{ cart.length }} itens no total</p>
            </div>
          </div>
          <button v-if="cart.length > 0" @click="cart = []" class="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">Limpar</button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-for="(item, index) in cart" :key="item.id" class="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:border-primary-200 hover:shadow-md">
            <div class="flex justify-between items-start">
              <div>
                <span class="font-bold text-slate-800 text-lg leading-tight">{{ item.name }}</span>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-tight mt-1">{{ showPrice(item.price) }} / cada</p>
              </div>
              <button @click="removeFromCart(index)" class="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-slate-100/50">
              <div class="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                <button @click="updateQuantity(index, -1)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary-600 transition-all font-black text-xl">-</button>
                <span class="w-10 text-center font-black text-slate-900 text-lg">{{ item.quantity }}</span>
                <button @click="updateQuantity(index, 1)" class="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary-600 transition-all font-black text-xl">+</button>
              </div>
              <span class="font-black text-slate-900 text-xl">{{ showPrice(item.subtotal) }}</span>
            </div>
          </div>
          
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center py-24 opacity-20">
            <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <p class="text-sm font-black uppercase tracking-widest text-slate-400">Sacola vazia</p>
          </div>
        </div>

        <div class="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identificar Cliente</label>
              <ClientCombobox v-model="selectedCustomerId" @select="handleCustomerSelected" />
            </div>

            <label class="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm cursor-pointer hover:border-orange-200 transition-all group">
              <input type="checkbox" v-model="toAccount" id="toAccount" class="w-6 h-6 rounded-lg text-orange-600 border-slate-300 transition-all focus:ring-orange-500 bg-slate-50" />
              <div>
                <span class="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Venda em Crédito Interno</span>
                <p class="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Adicionar ao saldo do cliente</p>
              </div>
            </label>
          </div>

          <div class="flex justify-between items-center py-4 border-t border-slate-200/50">
            <span class="text-slate-400 font-black uppercase tracking-widest text-xs">Total a Pagar</span>
            <span class="text-4xl font-black text-primary-600 tracking-tighter">{{ showPrice(total) }}</span>
          </div>

          <button 
            @click="checkout"
            :disabled="cart.length === 0"
            class="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-primary-700 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl shadow-primary-600/30 active:scale-[0.98] transform hover:scale-[1.01]"
          >
            Confirmar e Finalizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>