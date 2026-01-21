import { ipcMain } from 'electron';

function registerCustomerHandlers(db) {
    // Get all customers (with pagination and search)
    ipcMain.handle('customer:get-all', (event, params = {}) => {
        const { page = 1, pageSize = 10, search = '' } = params;
        const offset = (page - 1) * pageSize;

        let sql = "SELECT * FROM customers";
        let countSql = "SELECT COUNT(*) as total FROM customers";
        let queryParams = [];

        if (search) {
            sql += " WHERE name LIKE ? OR id = ?";
            countSql += " WHERE name LIKE ? OR id = ?";
            const searchParam = `%${search}%`;
            queryParams = [searchParam, search];
        }

        sql += " ORDER BY balance DESC LIMIT ? OFFSET ?";

        console.log(sql);

        const data = db.prepare(sql).all([...queryParams, pageSize, offset]);
        const total = db.prepare(countSql).get(queryParams).total;

        return { data, total };
    });

    // Save customer
    ipcMain.handle('customer:save', async (event, customer) => {
        const { id, name, age, phone, address, balance, observations } = customer;

        if (id) {
            // Fetch current balance to check for payment
            const currentData = db.prepare("SELECT balance, last_payment_date FROM customers WHERE id = ?").get(id);
            let finalLastPaymentDate = currentData.last_payment_date;

            // Update payment date if balance decreased
            if (balance < currentData.balance) {
                finalLastPaymentDate = new Date().toISOString();
            }

            // Update
            const sql = `UPDATE customers SET name = ?, age = ?, phone = ?, address = ?, balance = ?, last_payment_date = ?, observations = ? WHERE id = ?`;
            db.prepare(sql).run([name, age, phone, address, balance, finalLastPaymentDate, observations, id]);
            return { success: true, id };
        } else {
            // Insert
            const sql = `INSERT INTO customers (name, age, phone, address, balance, observations) VALUES (?, ?, ?, ?, ?, ?)`;
            const { lastInsertRowid } = db.prepare(sql).run([name, age, phone, address, balance, observations]);
            return { success: true, id: lastInsertRowid };
        }
    });

    // Delete customer
    ipcMain.handle('customer:delete', (_, id) => {
        try {
            db.prepare("DELETE FROM customers WHERE id = ?").run(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('customer:get-stats', (_, customerId) => {
        // Basic stats
        const basicStatsSql = `
            SELECT 
                COUNT(id) as totalOrders,
                SUM(total) as totalSpent,
                MAX(date) as lastPurchase,
                AVG(total) as averageTicket
            FROM sales 
            WHERE customer_id = ? AND deleted_at IS NULL
        `;
        const basicStats = db.prepare(basicStatsSql).get(customerId);

        // Fetch last_payment_date and observations directly from customer table
        const customerRow = db.prepare("SELECT last_payment_date, observations FROM customers WHERE id = ?").get(customerId);

        // Top 3 Products
        const topProductsSql = `
            SELECT p.name, SUM(si.quantity) as totalQty
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            JOIN sales s ON si.sale_id = s.id
            WHERE s.customer_id = ? AND s.deleted_at IS NULL
            GROUP BY p.id
            ORDER BY totalQty DESC
            LIMIT 3
        `;
        const topProducts = db.prepare(topProductsSql).all(customerId);

        return {
            ...basicStats,
            lastPayment: customerRow ? customerRow.last_payment_date : null,
            observations: customerRow ? customerRow.observations : '',
            topProducts
        };
    });
}

export { registerCustomerHandlers };
