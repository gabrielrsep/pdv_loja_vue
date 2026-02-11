import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        config: {
            margin: 0,
            allow_salesperson_undo_sale: false,
            githubToken: '',
            checkOnStartup: true,
            autoDownload: false,
            printer_device_name: ''
        },
        loading: false
    }),

    actions: {
        async fetchConfig() {
            try {
                const data = await window.api.getConfig();
                this.config = data;
            } catch (err) {
                console.error('Erro ao carregar configurações:', err);
            }
        },

        async saveConfig(newConfig) {
            this.loading = true;
            try {
                const result = await window.api.saveConfig(newConfig);
                if (result.success) {
                    this.config = result.config;
                    return { success: true };
                }
                return { success: false, error: result.error };
            } catch (err) {
                return { success: false, error: err.message };
            } finally {
                this.loading = false;
            }
        }
    }
});