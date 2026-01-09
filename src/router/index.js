import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import LoginView from '../views/LoginView.vue';

// Lazy-loading para performance
const PosView = () => import('../views/PosView.vue');
const InventoryView = () => import('../views/InventoryView.vue');
const UsersView = () => import('../views/UsersView.vue');
const StatsView = () => import('../views/StatsView.vue');
const SettingsView = () => import('../views/SettingsView.vue');
const CustomersView = () => import('../views/CustomersView.vue');
const FinancialView = () => import('../views/FinancialView.vue');
const SalesView = () => import('../views/SalesView.vue');
const CategoriesView = () => import('../views/CategoriesView.vue');
const PromotionsView = () => import('../views/PromotionsView.vue');

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false }
    },
    {
        path: '/pos',
        name: 'pos',
        component: PosView,
        meta: { requiresAuth: true }
    },
    {
        path: '/inventory',
        name: 'inventory',
        component: InventoryView,
        meta: { requiresAuth: true }
    },
    // Rotas protegidas apenas para Administradores
    {
        path: '/users',
        name: 'users',
        component: UsersView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/stats',
        name: 'stats',
        component: StatsView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/customers',
        name: 'customers',
        component: CustomersView,
        meta: { requiresAuth: true }
    },
    {
        path: '/financial',
        name: 'financial',
        component: FinancialView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/sales',
        name: 'sales',
        component: SalesView,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/categories',
        name: 'categories',
        component: CategoriesView,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/promotions',
        name: 'promotions',
        component: PromotionsView,
        meta: { requiresAuth: true, requiresAdmin: true }
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation Guard: O "Segurança" do App
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // 1. Verifica se a rota exige login e o utilizador não está autenticado
    if (to.meta.requiresAuth && !authStore.authenticated) {
        return next({ name: 'login' });
    }

    // 2. Bloqueio por cargo: Se a rota exige Admin e o utilizador é Vendedor
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        console.warn("Acesso negado: Redirecionando para o PDV.");
        return next({ name: 'pos' });
    }

    // 3. Se o utilizador já está logado e tenta ir para o login, manda para o PDV
    if (to.name === 'login' && authStore.authenticated) {
        return next({ name: 'pos' });
    }

    next();
});