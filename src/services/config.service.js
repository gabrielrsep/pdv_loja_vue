import { ipcMain } from 'electron';
import { saveConfig, getConfig } from '../config.js';

function registerConfigHandlers(db) {
    ipcMain.handle('config:get', () => {
        return getConfig();
    });

    ipcMain.handle('config:save', (_, newConfig) => {
        try {
            const updated = saveConfig(newConfig);
            return { success: true, config: updated };
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            return { success: false, error: error.message };
        }
    });
}

export { registerConfigHandlers };
