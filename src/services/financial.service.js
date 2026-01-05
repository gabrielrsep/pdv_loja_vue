import { ipcMain } from 'electron';

const formatDate = date => {
    const [year, month] = date.split('-');
    const nextMonth = new Date(year, month, 1);
    const firstDayOfMonth = new Date(year, month - 1, 1);

    return [firstDayOfMonth, nextMonth].map(date => date.toISOString().split('T')[0]);
}

function registerFinancialHandlers(db) {

    ipcMain.handle('check:get-future', (_) => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

        const sql = `
            SELECT * FROM checks 
            WHERE status = 'pendente' AND due_date >= ? 
            ORDER BY due_date ASC 
            LIMIT 5
        `;
        return db.prepare(sql).all(firstDayOfMonth);
    });

    // Check Handlers
    ipcMain.handle('check:get-all', (_, date) => {
        const getSql = `
            SELECT * FROM checks WHERE due_date BETWEEN ? AND ? ORDER BY due_date
        `
        return db.prepare(getSql).all(...formatDate(date));
    });

    ipcMain.handle('check:save', (_, check) => {
        const { id, amount, due_date, status, type, description } = check;
        const createdAt = new Date().toISOString();

        if (id) {
            const sql = `UPDATE checks SET amount = ?, due_date = ?, status = ?, type = ?, description = ? WHERE id = ?`;
            db.prepare(sql).run([amount, due_date, status, type || 'cheque', description, id]);
            return { success: true, id };
        } else {
            const sql = `INSERT INTO checks (amount, due_date, status, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
            const { lastInsertRowid } = db.prepare(sql).run([amount, due_date, status || 'pendente', type || 'cheque', description, createdAt]);
            return { success: true, id: lastInsertRowid };
        }
    });

    ipcMain.handle('check:delete', (_, id) => {
        try {
            db.prepare("DELETE FROM checks WHERE id = ?").run(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('check:toggle-status', (_, { id, status }) => {
        try {
            db.prepare("UPDATE checks SET status = ? WHERE id = ?").run([status, id]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

export { registerFinancialHandlers };
