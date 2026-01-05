import { defineStore } from 'pinia';
import { useToastStore } from './toast'
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        authenticated: false,
        setupDone: true,
        loading: false
    }),

    actions: {
        // Migrado do checkSetup do renderer.js original
        async checkInitialSetup() {
            try {
                const result = await window.api.checkSetup();
                this.setupDone = result.hasAdmin;
            } catch (err) {
                console.error('Erro ao verificar configuração:', err);
            }
        },

        // Migrado da função login do renderer.js original
        async login(username, password) {

            this.loading = true;
            try {
                const result = await window.api.login({
                    username,
                    password
                });

                if (result.success) {
                    this.authenticated = true;
                    this.user = result.user;
                    return { success: true };
                } else {
                    return { success: false, error: result.error };
                }
            } catch (err) {
                return { success: false, error: 'Erro na comunicação com o sistema.' };
            } finally {
                this.loading = false;
            }
        },

        // Migrado da função logout do renderer.js original
        logout() {
            this.authenticated = false;
            this.user = null;
            // Aqui você pode redirecionar para a tela de login via router se necessário
        },

        async registerFirstAdmin(userData) {

            try {
                const result = await window.api.registerFirstAdmin({ ...userData });
                return result;
            } catch (err) {
                console.error('Erro ao registrar administrador:', err);
                return { success: false, error: 'Erro ao registrar administrador.' };
            }
        },

        async getRecoveryQuestion(username) {
            try {
                const result = await window.api.getRecoveryQuestion(username.toUpperCase());
                return result; // Retorna { success: true, question: '...' }
            } catch (err) {
                return { success: false, error: 'Erro ao buscar pergunta.' };
            }
        },

        async resetPassword(payload) {
            try {
                const result = await window.api.recoverPassword({
                    username: payload.username.toUpperCase(),
                    answer: payload.answer,
                    newPassword: payload.newPassword
                });
                return result;
            } catch (err) {
                return { success: false, error: 'Erro ao redefinir senha.' };
            }
        },
    },

    getters: {
        // Substitui a lógica de canAccess do código antigo
        userRole: (state) => state.user?.role || 'guest',
        isAdmin: (state) => state.user?.role === 'administrador'
    }
});