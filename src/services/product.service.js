import { ipcMain, dialog } from 'electron';
import QRCode from 'qrcode';
import { readDatabaseFile } from '../database/database.js';

function registerProductHandlers(db) {
    // Search products
    ipcMain.handle('product:search', (_, query) => {
        let sql = readDatabaseFile('search_products.sql');
        let params = []
        if (!isNaN(query) && query.trim() !== '') {
            sql += ` WHERE p.id = ?`;
            params = [query]
        } else {
            sql += ` WHERE p.name LIKE ?`;
            params = [`%${query}%`]
        }
        return db.prepare(sql).all(params)
    });

    // Get all products (with pagination and search)
    ipcMain.handle('product:get-all', (event, params = {}) => {
        const { page = 1, pageSize = 10, search = '' } = params;
        const offset = (page - 1) * pageSize;

        let sql = `
            SELECT p.*, c.name as category_name, c.color as category_color 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id`;
        let countSql = "SELECT COUNT(*) as total FROM products p";
        let queryParams = [];

        if (search) {
            sql += " WHERE p.name LIKE ? OR c.name LIKE ? OR p.size LIKE ?";
            countSql += " LEFT JOIN categories c ON p.category_id = c.id WHERE p.name LIKE ? OR c.name LIKE ? OR p.size LIKE ?";
            const searchParam = `%${search}%`;
            queryParams = [searchParam, searchParam, searchParam];
        }

        sql += " ORDER BY p.id DESC LIMIT ? OFFSET ?";

        const data = db.prepare(sql).all([...queryParams, pageSize, offset]);
        const total = db.prepare(countSql).get(queryParams).total;

        return { data, total };
    });

    // Save product
    ipcMain.handle('product:save', async (_, product) => {
        const { id, name, category_id, size, price, cost_price, stock, gender } = product;
        const finalCostPrice = cost_price || 0;

        if (id) {
            // Update
            const sql = `UPDATE products SET name = ?, category_id = ?, size = ?, price = ?, cost_price = ?, stock = ?, gender = ? WHERE id = ?`;
            db.prepare(sql).run([name, category_id, size, price, finalCostPrice, stock, gender, id]);
            return { success: true, id };
        } else {
            // Insert
            const sql = `INSERT INTO products (name, category_id, size, price, cost_price, stock, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const { lastInsertRowid } = db.prepare(sql).run([name, category_id, size, price, finalCostPrice, stock, gender]);
            return { success: true, id: lastInsertRowid };
        }
    });

    // Generate QR Code
    ipcMain.handle('product:generate-qr', async (_, text) => {
        try {
            const url = await QRCode.toDataURL(text);
            return { success: true, url };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // Count total products
    ipcMain.handle('product:count', () => {
        const sql = "SELECT COUNT(*) as total FROM products";
        const total = db.prepare(sql).get().total;
        return { total };
    });

    // Delete product
    ipcMain.handle('product:delete', (_, id) => {
        const sql = "DELETE FROM products WHERE id = ?";
        db.prepare(sql).run(id);
        return { success: true };
    });
}

export { registerProductHandlers };
