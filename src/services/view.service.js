import { ipcMain } from 'electron';
import { readFileSync } from 'fs-extra';

function registerViewHandlers() {
    let currentView = null;

    ipcMain.handle('view:get-current', () => {
        return currentView;
    });

    ipcMain.handle('view:set-current', (_, view) => {
        currentView = view;
    });

    ipcMain.handle('view:get-html', () => {
        return readFileSync(`renderer/views/${currentView}.html`, 'utf-8');
    });
}

export { registerViewHandlers };
