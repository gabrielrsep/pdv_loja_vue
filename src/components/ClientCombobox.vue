<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Trigger Input -->
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        @focus="openDropdown"
        @input="handleInput"
        placeholder="Buscar cliente (Nome ou ID)..."
        class="w-full pl-5 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary-500 shadow-sm transition-all outline-none"
      />
      <div 
        class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-primary-500 transition-colors"
        @click="toggleDropdown"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': isOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>

    <!-- Dropdown Panel -->
    <div 
      v-if="isOpen"
      class="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden max-h-[400px] flex flex-col"
    >
      <!-- Loading State -->
      <div v-if="loading && customers.length === 0" class="p-4 text-center text-slate-400">
        <svg class="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider">Carregando...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="customers.length === 0" class="p-8 text-center text-slate-400">
        <p class="text-sm font-medium">Nenhum cliente encontrado</p>
      </div>

      <!-- List -->
      <ul v-else class="flex-1 overflow-y-auto" ref="listRef">
        
        <!-- "Consumidor Final" Option -->
         <li 
          @click="selectCustomer(null)"
          class="p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col gap-1"
           :class="{ 'bg-primary-50': modelValue === null || modelValue === '' }"
        >
          <div class="flex justify-between items-start">
             <span class="font-bold text-slate-800">Consumidor Final</span>
          </div>
        </li>

        <li 
          v-for="customer in customers" 
          :key="customer.id"
          @click="selectCustomer(customer)"
          class="p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col gap-1"
          :class="{ 'bg-primary-50': modelValue === customer.id, 'bg-red-50': customer.can_sell === 0 }"
        >
          <div class="flex justify-between items-start">
            <span class="font-bold text-slate-800">{{ customer.name }}</span>
            <span class="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">#{{ customer.id }}</span>
          </div>
          
          <div v-if="customer.observations" class="flex items-start gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
             <p class="text-xs text-slate-500 line-clamp-2">{{ customer.observations }}</p>
          </div>
        </li>
        
        <!-- Infinite Scroll Sentinel -->
        <li ref="sentinelRef" class="h-4 w-full"></li>
        
        <!-- Loading More -->
        <li v-if="loading && customers.length > 0" class="p-2 text-center">
           <svg class="animate-spin h-4 w-4 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'select']);

const isOpen = ref(false);
const searchQuery = ref('');
const customers = ref([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);
const containerRef = ref(null);
const sentinelRef = ref(null);
let searchTimeout = null;
let observer = null;

const clearState = () => {
  searchQuery.value = '';
  emit('update:modelValue', '');
  emit('select', null);

}

// Initial Load
onMounted(() => {
  // If there's an initial ID, we might want to fetch that specific user to show their name
  // For now, we'll just load the first page
  //loadCustomers(); 
  
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (observer) observer.disconnect();
});

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

const openDropdown = () => {
  isOpen.value = true;
  if (customers.value.length === 0) {
    loadCustomers(true);
  }
};

const toggleDropdown = () => {
    if (isOpen.value) {
        isOpen.value = false;
    } else {
        openDropdown();
    }
}

const handleInput = () => {
  isOpen.value = true;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCustomers(true);
  }, 300);
};

const loadCustomers = async (reset = false) => {
  if (loading.value) return;
  if (reset) {
    page.value = 1;
    customers.value = [];
    hasMore.value = true;
  }
  
  if (!hasMore.value) return;

  loading.value = true;
  try {
    const result = await window.api.getCustomers({ 
      page: page.value, 
      pageSize: 20, 
      search: searchQuery.value 
    });
    
    if (reset) {
        customers.value = result.data;
    } else {
        customers.value = [...customers.value, ...result.data];
    }
    
    hasMore.value = customers.value.length < result.total;
    if (hasMore.value) {
        page.value++;
        // Re-setup observer after DOM update
        nextTick(() => setupObserver());
    }
    
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
  } finally {
    loading.value = false;
  }
};

const setupObserver = () => {
  if (observer) observer.disconnect();
  
  if (!sentinelRef.value) return;

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading.value && hasMore.value) {
      loadCustomers();
    }
  }, { root: null, rootMargin: '100px' }); // Load a bit before reaching bottom

  observer.observe(sentinelRef.value);
};

const selectCustomer = (customer) => {
  if (customer) {
      searchQuery.value = customer.name;
      emit('update:modelValue', customer.id);
      emit('select', customer, clearState);
  } else {
      clearState();
  }
  isOpen.value = false;
};

// If external modelValue changes (e.g. cleared by parent), update search query if needed
// This is a bit tricky since we only have ID. 
// Ideally, parent passes the whole object or we fetch it. 
// For this 'quick' implementation, we'll assume manual interaction for now.
</script>
