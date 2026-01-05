import { ipcMain } from 'electron';
import bcrypt from 'bcryptjs';

function registerSalesHandlers(db) {
    // Get Sales
    ipcMain.handle('sale:get-all', () => {
        return db.prepare("SELECT * FROM sales ORDER BY date DESC LIMIT 30").all();
    });

    // Create sale
    ipcMain.handle('sale:create', (_, saleData) => {
        const { total, items, customer_id, to_account } = saleData;
        const date = new Date().toISOString();

        try {
            const result = db.transaction(() => {
                const saleStmt = db.prepare("INSERT INTO sales (total, date, customer_id, to_account) VALUES (?, ?, ?, ?)");
                const { lastInsertRowid: saleId } = saleStmt.run([total, date, customer_id, to_account ? 1 : 0]);

                const itemStmt = db.prepare("INSERT INTO sale_items (sale_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)");
                for (const item of items) {
                    itemStmt.run([saleId, item.id, item.quantity, item.subtotal]);
                }

                return { success: true, saleId };
            })(); // Execute the transaction

            return result;
        } catch (error) {
            console.error('Erro na transação de venda:', error);
            return { success: false, error: error.message };
        }
    });

    // Undo Sale
    ipcMain.handle('sale:undo', async (_, saleId, authData) => {
        try {
            const { username, password } = authData;

            // 1. Verify user exists
            const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
            if (!user) {
                return { success: false, error: 'Usuário não encontrado.' };
            }

            // 2. Verify password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return { success: false, error: 'Senha incorreta.' };
            }

            // 3. Verify Permission
            // Admin and Gerente are always allowed
            if (user.role !== 'administrador' && user.role !== 'gerente') {
                // Check if salesperson undo is allowed in config
                const config = require('../config').getConfig();
                if (!config.allow_salesperson_undo_sale) {
                    return { success: false, error: 'Permissão negada. Requer autorização de um Administrador ou Gerente.' };
                }
            }

            db.prepare("UPDATE sales SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?").run(saleId);
            return { success: true };
        } catch (error) {
            console.error('Erro ao desfazer venda:', error);
            return { success: false, error: error.message };
        }
    });

    // Get recent sales
    ipcMain.handle('sales:get-recent', () => {
        const sql = `
            SELECT s.id, s.total, s.date, c.name as customer_name 
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.date DESC 
            LIMIT 30
        `;
        return db.prepare(sql).all();
    });

    // Get sale items
    ipcMain.handle('sale:get-items', (_, saleId) => {
        const sql = `
            SELECT si.*, p.name as product_name
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = ?
        `;
        return db.prepare(sql).all(saleId);
    });
}

export { registerSalesHandlers };
