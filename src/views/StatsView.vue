<template>
  <div class="flex flex-col h-full gap-6 overflow-hidden">
    <!-- Header Area -->
    <div class="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Painel de Estatísticas</h1>
        <p class="text-sm text-slate-500 font-medium">Análise de desempenho e fluxo financeiro</p>
      </div>
      
      <div class="flex items-center gap-3 bg-white/60 p-2 rounded-2xl border border-white/60 shadow-inner">
        <div class="flex items-center gap-2">
            <select v-model="selectedMonth" @change="fetchData" class="pl-4 pr-10 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer shadow-sm">
            <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}</option>
            </select>
            <select v-model="selectedYear" @change="fetchData" class="pl-4 pr-10 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer shadow-sm">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
        </div>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Faturamento -->
      <div class="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white group hover:border-blue-200 transition-all duration-300">
        <div class="flex flex-col gap-4">
          <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento Total</p>
            <h3 class="text-2xl font-black text-slate-900">{{ formatCurrency(summary.totalSales) }}</h3>
          </div>
        </div>
      </div>

      <!-- Lucro Estimado -->
      <div class="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white group hover:border-emerald-200 transition-all duration-300">
        <div class="flex flex-col gap-4">
          <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3v14l5 3 5-3V5Z"/><path d="m7 19 5-3 5 3"/></svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Bruto</p>
            <h3 class="text-2xl font-black text-emerald-600">{{ formatCurrency(summary.balance) }}</h3>
          </div>
        </div>
      </div>

      <!-- Vendas Realizadas -->
      <div class="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white group hover:border-orange-200 transition-all duration-300">
        <div class="flex flex-col gap-4">
          <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nº de Vendas</p>
            <h3 class="text-2xl font-black text-slate-900">{{ summary.orderCount }}</h3>
          </div>
        </div>
      </div>

      <!-- Contas Pendentes -->
      <div class="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white group hover:border-rose-200 transition-all duration-300">
        <div class="flex flex-col gap-4">
          <div class="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendências (Mês)</p>
            <h3 class="text-2xl font-black text-rose-600">{{ formatCurrency(summary.totalChecksToExpire) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
      <!-- Main Chart Section -->
      <div class="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
        <div class="mb-8">
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Tendência de Vendas</h2>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Evolução diária do faturamento</p>
        </div>
        
        <div class="flex-1 relative">
          <Line v-if="loaded" :data="chartData" :options="chartOptions" />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3">
              <div class="w-10 h-10 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin"></div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Processando dados</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables Side -->
      <div class="flex flex-col gap-6 overflow-hidden">
        <!-- Top Products -->
        <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-1/2">
          <div class="mb-4">
            <h2 class="text-lg font-black text-slate-800 tracking-tight">Produtos + Vendidos</h2>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ranking por quantidade</p>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <table class="w-full">
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(product, index) in topProducts" :key="index" class="group">
                  <td class="py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        #{{ index + 1 }}
                      </div>
                      <span class="text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors">{{ product.name }}</span>
                    </div>
                  </td>
                  <td class="py-3 text-right">
                    <span class="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">{{ product.totalSold }} un</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Customers -->
        <div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-1/2">
          <div class="mb-4">
            <h2 class="text-lg font-black text-slate-800 tracking-tight">Melhores Clientes</h2>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ranking por valor gasto</p>
          </div>
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <table class="w-full">
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(customer, index) in topCustomers" :key="index" class="group">
                  <td class="py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        {{ customer.name.charAt(0) }}
                      </div>
                      <span class="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{{ customer.name }}</span>
                    </div>
                  </td>
                  <td class="py-3 text-right">
                    <span class="text-xs font-black text-emerald-600">{{ formatCurrency(customer.totalSpent) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { Line } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, LineElement, 
  CategoryScale, LinearScale, PointElement, Filler 
} from 'chart.js';
import { formatCurrency } from '@/utils';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler);

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const loaded = ref(false);

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const years = ref([]);
for (let y = 2024; y <= new Date().getFullYear() + 1; y++) {
  years.value.push(y);
}

const summary = reactive({
  balance: 0,
  totalSales: 0,
  orderCount: 0,
  totalChecksToExpire: 0
});

const topProducts = ref([]);
const topCustomers = ref([]);

const chartData = reactive({
  labels: [],
  datasets: [
    {
      label: 'Vendas (R$)',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: '#3b82f6',
      borderWidth: 3,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      data: [],
      fill: true,
      tension: 0.4
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      titleFont: { size: 10, weight: 'bold' },
      bodyFont: { size: 13, weight: '900' },
      cornerRadius: 12,
      displayColors: false,
      callbacks: {
        label: (context) => formatCurrency(context.parsed.y)
      }
    }
  },
  scales: {
    y: { 
      beginAtZero: true,
      grid: { display: true, color: '#f1f5f9' },
      ticks: {
        font: { size: 10, weight: 'bold' },
        color: '#94a3b8',
        callback: (value) => value === 0 ? 'R$ 0' : `R$ ${value}`
      }
    },
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10, weight: 'bold' },
        color: '#94a3b8'
      }
    }
  }
};

async function fetchData() {
  loaded.value = false;
  try {
    const data = await window.api.getStatistics({ 
      month: selectedMonth.value, 
      year: selectedYear.value 
    });
    
    // Atualizar Summary
    Object.assign(summary, data.summary);

    // Atualizar Top Lists
    topProducts.value = data.topProducts;
    topCustomers.value = data.topCustomers;

    // Atualizar Gráfico
    // Processar tendência diária para preencher todos os dias do mês
    const daysInMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
    const labels = [];
    const values = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const trend = data.dailyTrend.find(t => t.day === dateStr);
      labels.push(day);
      values.push(trend ? trend.dailyTotal : 0);
    }

    chartData.labels = labels;
    chartData.datasets[0].data = values;
    
    loaded.value = true;
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
  }
}

onMounted(fetchData);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}
</style>