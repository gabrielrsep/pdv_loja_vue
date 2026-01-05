import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
    state: () => ({
        show: false,
        message: '',
        type: 'info', // 'success', 'error', 'info'
        timeout: null
    }),
    actions: {
        /**
         * Exibe uma notificação toast.
         * 
         * @param {string} message 
         * @param {'success' | 'error' | 'info'} type 
         */
        showToast(message, type = 'success') {
            // Limpa timeout anterior se existir
            if (this.timeout) clearTimeout(this.timeout);

            this.message = message;
            this.type = type;
            this.show = true;

            this.timeout = setTimeout(() => {
                this.show = false;
            }, 3000);
        }
    }
});