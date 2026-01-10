import { ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';


// Configure logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Disable auto-download - we'll control it manually
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow = null;
let updateStatus = {
    checking: false,
    available: false,
    downloaded: false,
    version: null,
    error: null,
    downloadProgress: 0
};

/**
 * Initialize the update service with the main window reference
 * @param {BrowserWindow} window - The main application window
 */
export function initializeUpdateService(window) {
    mainWindow = window;

    // Configure feed URL for public repository
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'gabrielrsep',
        repo: 'pdv_loja_vue',
        private: false
    });
    log.info('Auto-updater configured for public repository');

    setupAutoUpdaterEvents();
}

/**
 * Setup event listeners for autoUpdater
 */
function setupAutoUpdaterEvents() {
    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for updates...');
        updateStatus.checking = true;
        updateStatus.error = null;
        sendStatusToRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
        log.info('Update available:', info.version);
        updateStatus.checking = false;
        updateStatus.available = true;
        updateStatus.version = info.version;
        sendStatusToRenderer('update-available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    });

    autoUpdater.on('update-not-available', (info) => {
        log.info('Update not available. Current version:', info.version);
        updateStatus.checking = false;
        updateStatus.available = false;
        sendStatusToRenderer('update-not-available', {
            version: info.version
        });
    });

    autoUpdater.on('error', (err) => {
        log.error('Error in auto-updater:', err);
        updateStatus.checking = false;
        updateStatus.error = err.message;
        sendStatusToRenderer('update-error', {
            error: err.message
        });
    });

    autoUpdater.on('download-progress', (progressObj) => {
        updateStatus.downloadProgress = progressObj.percent;
        sendStatusToRenderer('update-download-progress', {
            percent: progressObj.percent,
            bytesPerSecond: progressObj.bytesPerSecond,
            transferred: progressObj.transferred,
            total: progressObj.total
        });
    });

    autoUpdater.on('update-downloaded', (info) => {
        log.info('Update downloaded:', info.version);
        updateStatus.downloaded = true;
        updateStatus.downloadProgress = 100;
        sendStatusToRenderer('update-downloaded', {
            version: info.version
        });
    });
}

/**
 * Send update status to renderer process
 * @param {string} channel - Event channel name
 * @param {object} data - Event data
 */
function sendStatusToRenderer(channel, data = {}) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send(channel, data);
    }
}

/**
 * Register IPC handlers for update functionality
 */
export function registerUpdateHandlers() {
    // Check for updates
    ipcMain.handle('update:check-for-updates', async () => {
        try {
            log.info('Manual update check requested');
            const result = await autoUpdater.checkForUpdates();
            return {
                success: true,
                updateInfo: result?.updateInfo || null
            };
        } catch (error) {
            log.error('Error checking for updates:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Download update
    ipcMain.handle('update:download', async () => {
        try {
            if (!updateStatus.available) {
                return {
                    success: false,
                    error: 'No update available to download'
                };
            }
            log.info('Starting update download');
            await autoUpdater.downloadUpdate();
            return { success: true };
        } catch (error) {
            log.error('Error downloading update:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Install and restart
    ipcMain.handle('update:install', () => {
        try {
            if (!updateStatus.downloaded) {
                return {
                    success: false,
                    error: 'No update downloaded to install'
                };
            }
            log.info('Installing update and restarting...');
            // This will quit the app and install the update
            setImmediate(() => autoUpdater.quitAndInstall(false, true));
            return { success: true };
        } catch (error) {
            log.error('Error installing update:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });

    // Get current update status
    ipcMain.handle('update:get-status', () => {
        return {
            success: true,
            status: updateStatus
        };
    });

    // Get current app version
    ipcMain.handle('update:get-version', () => {
        return {
            success: true,
            version: autoUpdater.currentVersion.version
        };
    });
}

/**
 * Check for updates automatically (called on app startup)
 * @param {number} delayMs - Delay in milliseconds before checking
 */
export function checkForUpdatesOnStartup(delayMs = 5000) {
    setTimeout(() => {
        log.info('Auto-checking for updates on startup');
        autoUpdater.checkForUpdates().catch(err => {
            log.error('Startup update check failed:', err);
        });
    }, delayMs);
}
