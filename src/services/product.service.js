import { ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import QRCode from 'qrcode';

function registerProductHandlers(db) {
    // Search products
    ipcMain.handle('product:search', (_, query) => {
        let sql = ''
        let params = []
        if (!isNaN(query)) {
            sql = `SELECT * FROM products WHERE id = ?`;
            params = [query]
        } else {
            sql = `SELECT * FROM products WHERE name LIKE ?`;
            params = [`%${query}%`]
        }
        return db.prepare(sql).all(params)
    });

    // Get all products (with pagination and search)
    ipcMain.handle('product:get-all', (event, params = {}) => {
        const { page = 1, pageSize = 10, search = '' } = params;
        const offset = (page - 1) * pageSize;

        let sql = "SELECT * FROM products";
        let countSql = "SELECT COUNT(*) as total FROM products";
        let queryParams = [];

        if (search) {
            sql += " WHERE name LIKE ? OR category LIKE ? OR size LIKE ?";
            countSql += " WHERE name LIKE ? OR category LIKE ? OR size LIKE ?";
            const searchParam = `%${search}%`;
            queryParams = [searchParam, searchParam, searchParam];
        }

        sql += " ORDER BY id DESC LIMIT ? OFFSET ?";

        const data = db.prepare(sql).all([...queryParams, pageSize, offset]);
        const total = db.prepare(countSql).get(queryParams).total;

        return { data, total };
    });

    // Save product
    ipcMain.handle('product:save', async (_, product) => {
        const { id, name, category, size, price, costPrice, stock, imagePath } = product;

        let finalImagePath = imagePath;

        // If we have an imagePath from the renderer (temp path), copy it to our storage
        if (imagePath && !imagePath.startsWith('product_images/')) {
            const fileName = `${Date.now()}-${path.basename(imagePath)}`;
            // Adjusted path to point to root product_images from services folder
            const dest = path.join(__dirname, '../product_images', fileName);
            await fs.copy(imagePath, dest);
            finalImagePath = `product_images/${fileName}`;
        }

        if (id) {
            // Update
            const sql = `UPDATE products SET name = ?, category = ?, size = ?, price = ?, cost_price = ?, stock = ?, image_path = ? WHERE id = ?`;
            db.prepare(sql).run([name, category, size, price, costPrice, stock, finalImagePath, id]);
            return { success: true, id };
        } else {
            // Insert
            const sql = `INSERT INTO products (name, category, size, price, cost_price, stock, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const { lastInsertRowid } = db.prepare(sql).run([name, category, size, price, costPrice, stock, finalImagePath]);
            return { success: true, id: lastInsertRowid };
        }
    });

    // Select Image
    ipcMain.handle('dialog:select-image', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp'] }]
        });
        return result.filePaths[0];
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
}

export { registerProductHandlers };
