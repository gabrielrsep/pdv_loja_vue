<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Categorias de Produtos</h1>
        <p class="text-sm text-slate-500 font-medium">Organize seus produtos por categorias coloridas</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nova Categoria
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div v-if="categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="group bg-white rounded-[2.5rem] border border-slate-100 p-8 transition-all hover:shadow-2xl hover:shadow-primary-600/5 hover:-translate-y-1 relative overflow-hidden"
        >
          <!-- Accent Background -->
          <div 
            class="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 group-hover:opacity-10 transition-all duration-500"
            :style="{ backgroundColor: category.color }"
          ></div>

          <div class="relative flex flex-col h-full">
            <div class="flex justify-between items-start mb-6">
              <div 
                class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
                :style="{ backgroundColor: category.color, boxShadow: `0 10px 20px -5px ${category.color}44` }"
              >
                <!-- Dynamic Icon (Placeholder for now, using a tag icon as default) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                  <path d="M7 7h.01"/>
                </svg>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                <button 
                  @click="openModal(category)"
                  class="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button 
                  @click="confirmDelete(category)"
                  class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Excluir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>

            <h3 class="text-xl font-black text-slate-900 leading-tight mb-2">{{ category.name }}</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: category.color }"></span>
              {{ category.color }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="h-full flex flex-col items-center justify-center py-24 opacity-30">
        <div class="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
            <path d="M7 7h.01"/>
          </svg>
        </div>
        <p class="text-2xl font-black text-slate-500 tracking-tight uppercase">Nenhuma categoria encontrada</p>
        <p class="text-base font-medium text-slate-400 mt-2">Crie sua primeira categoria para organizar o estoque</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div class="glass border border-white/20 rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-10 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ editingId ? 'Editar Categoria' : 'Nova Categoria' }}</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{{ editingId ? 'ID #' + editingId : 'Defina os detalhes da categoria' }}</p>
          </div>
          <button @click="showModal = false" class="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold">✕</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-10 space-y-8">
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Categoria</label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Ex: Primavera/Verão" 
              required 
              autofocus
              class="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none font-bold text-lg" 
            />
          </div>
          
          <div class="space-y-4">
            <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cor de Destaque</label>
            <div class="flex flex-wrap gap-3">
              <button 
                v-for="color in presetColors" 
                :key="color"
                type="button"
                @click="form.color = color"
                class="w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-90"
                :class="{ 'ring-4 ring-offset-2 ring-slate-200 scale-110': form.color === color }"
                :style="{ backgroundColor: color }"
              ></button>
              <div class="relative w-10 h-10">
                <input 
                  v-model="form.color" 
                  type="color" 
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  class="w-full h-full rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 transition-all"
                  :style="{ backgroundColor: form.color }"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4 pt-4">
            <button 
              type="submit" 
              class="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-primary-600/20 transition-all active:scale-[0.98]"
            >
              {{ editingId ? 'Salvar Alterações' : 'Criar Categoria' }}
            </button>
            <button 
              type="button" 
              @click="showModal = false" 
              class="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Cancelar e voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';

const categories = ref([]);
const showModal = ref(false);
const editingId = ref(null);

const presetColors = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#4B5563', // slate-600
];

const form = reactive({
  name: '',
  color: '#3B82F6',
  icon: 'tag'
});

const loadCategories = async () => {
  try {
    categories.value = await window.api.getCategories();
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
  }
};

const openModal = (category = null) => {
  if (category) {
    editingId.value = category.id;
    form.name = category.name;
    form.color = category.color;
    form.icon = category.icon;
  } else {
    editingId.value = null;
    form.name = '';
    form.color = presetColors[0];
    form.icon = 'tag';
  }
  showModal.value = true;
};

const handleSubmit = async () => {
  try {
    const result = await window.api.saveCategory({
      id: editingId.value,
      ...form
    });

    if (result.success) {
      showModal.value = false;
      await loadCategories();
      // TODO: Show success toast
    } else {
      alert(result.error);
    }
  } catch (err) {
    alert('Erro ao salvar categoria: ' + err.message);
  }
};

const confirmDelete = async (category) => {
  if (confirm(`Deseja realmente excluir a categoria "${category.name}"?`)) {
    try {
      const result = await window.api.deleteCategory(category.id);
      if (result.success) {
        await loadCategories();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert('Erro ao excluir categoria: ' + err.message);
    }
  }
};

onMounted(loadCategories);
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #CBD5E0;
}
</style>
