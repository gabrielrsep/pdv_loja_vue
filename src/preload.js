const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getAppInfo: () => ipcRenderer.invoke('app-info:get'),
    getCurrentView: () => ipcRenderer.invoke('view:get-current'),
    setCurrentView: (view) => ipcRenderer.invoke('view:set-current', view),
    getViewHtml: () => ipcRenderer.invoke('view:get-html'),
    getConfig: () => ipcRenderer.invoke('config:get'),
    saveConfig: (config) => ipcRenderer.invoke('config:save', config),

    searchProducts: (query) => ipcRenderer.invoke('product:search', query),
    getProducts: (params) => ipcRenderer.invoke('product:get-all', params),
    saveProduct: (product) => ipcRenderer.invoke('product:save', product),
    generateQR: (text) => ipcRenderer.invoke('product:generate-qr', text),
    countProducts: () => ipcRenderer.invoke('product:count'),

    // Categories
    getCategories: () => ipcRenderer.invoke('category:get-all'),
    getCategory: (id) => ipcRenderer.invoke('category:get-by-id', id),
    saveCategory: (category) => {
        if (category.id) return ipcRenderer.invoke('category:update', category);
        return ipcRenderer.invoke('category:create', category);
    },
    deleteCategory: (id) => ipcRenderer.invoke('category:delete', id),

    createSale: (saleData) => ipcRenderer.invoke('sale:create', saleData),
    undoSale: (id, authData) => ipcRenderer.invoke('sale:undo', id, authData),
    getRecentSales: (customerId) => ipcRenderer.invoke('sales:get-recent', customerId),
    getSaleItems: (saleId) => ipcRenderer.invoke('sale:get-items', saleId),
    getCustomers: (params) => ipcRenderer.invoke('customer:get-all', params),
    saveCustomer: (customer) => ipcRenderer.invoke('customer:save', customer),
    deleteCustomer: (id) => ipcRenderer.invoke('customer:delete', id),
    getStatistics: (params) => ipcRenderer.invoke('stats:get', params),
    getChecks: (date) => ipcRenderer.invoke('check:get-all', date),
    getChecksStats: (date) => ipcRenderer.invoke('stats:get-checks', date),
    saveCheck: (check) => ipcRenderer.invoke('check:save', check),
    getFutureChecks: () => ipcRenderer.invoke('check:get-future'),
    deleteCheck: (id) => ipcRenderer.invoke('check:delete', id),
    toggleCheckStatus: (data) => ipcRenderer.invoke('check:toggle-status', data),
    getCustomerStats: (id) => ipcRenderer.invoke('customer:get-stats', id),
    // Auth
    setCurrentUser: (user) => ipcRenderer.invoke('auth:set-current-user', user),
    getCurrentUser: () => ipcRenderer.invoke('auth:get-current-user'),
    checkSetup: () => ipcRenderer.invoke('auth:check-setup'),
    registerFirstAdmin: (userData) => ipcRenderer.invoke('auth:register-first-admin', userData),
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    getRecoveryQuestion: (username) => ipcRenderer.invoke('auth:get-recovery-question', username),
    recoverPassword: (data) => ipcRenderer.invoke('auth:recover-password', data),
    // Users
    getUsers: () => ipcRenderer.invoke('user:get-all'),
    saveUser: (userData) => ipcRenderer.invoke('user:save', userData),
    deleteUser: (id) => ipcRenderer.invoke('user:delete', id),
    // Promotions
    getPromotions: () => ipcRenderer.invoke('promotion:get-all'),
    getPromotion: (id) => ipcRenderer.invoke('promotion:get-by-id', id),
    savePromotion: (promotion) => ipcRenderer.invoke('promotion:save', promotion),
    deletePromotion: (id) => ipcRenderer.invoke('promotion:delete', id),
    togglePromotionStatus: (id) => ipcRenderer.invoke('promotion:toggle-active', id),

    // Update API
    checkForUpdates: () => ipcRenderer.invoke('update:check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('update:download'),
    installUpdate: () => ipcRenderer.invoke('update:install'),
    getUpdateStatus: () => ipcRenderer.invoke('update:get-status'),
    getAppVersion: () => ipcRenderer.invoke('update:get-version'),

    // Update event listeners
    onUpdateChecking: (callback) => {
        ipcRenderer.on('update-checking', (_, data) => callback(data));
    },
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', (_, data) => callback(data));
    },
    onUpdateNotAvailable: (callback) => {
        ipcRenderer.on('update-not-available', (_, data) => callback(data));
    },
    onUpdateDownloadProgress: (callback) => {
        ipcRenderer.on('update-download-progress', (_, data) => callback(data));
    },
    onUpdateDownloaded: (callback) => {
        ipcRenderer.on('update-downloaded', (_, data) => callback(data));
    },
    onUpdateError: (callback) => {
        ipcRenderer.on('update-error', (_, data) => callback(data));
    },

    // Print API
    getPrinters: () => ipcRenderer.invoke('print:get-printers'),
    printCart: (cart, printerName) => ipcRenderer.invoke('print:cart', cart, printerName),
    printLabel: (content) => ipcRenderer.invoke('print:label', content),
});
