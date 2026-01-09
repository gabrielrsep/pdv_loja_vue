import { ipcMain } from 'electron';

function registerPromotionHandlers(db) {
    // Get all promotions
    ipcMain.handle('promotion:get-all', () => {
        const sql = `
            SELECT p.*, 
            (SELECT COUNT(*) FROM promotion_targets pt WHERE pt.promotion_id = p.id) as target_count
            FROM promotions p
            ORDER BY p.id DESC`;
        return db.prepare(sql).all();
    });

    // Get promotion with targets
    ipcMain.handle('promotion:get-by-id', (_, id) => {
        const promo = db.prepare('SELECT * FROM promotions WHERE id = ?').get(id);
        if (!promo) return null;

        const targets = db.prepare('SELECT * FROM promotion_targets WHERE promotion_id = ?').all(id);
        return { ...promo, targets };
    });

    // Save promotion
    ipcMain.handle('promotion:save', (_, promotion) => {
        const { id, name, discount_type, value, start_date, end_date, active, targets } = promotion;

        const transaction = db.transaction(() => {
            let promoId = id;
            if (id) {
                // Update
                const sql = `UPDATE promotions SET name = ?, discount_type = ?, value = ?, start_date = ?, end_date = ?, active = ? WHERE id = ?`;
                db.prepare(sql).run([name, discount_type, value, start_date, end_date, active ? 1 : 0, id]);

                // Clear old targets
                db.prepare('DELETE FROM promotion_targets WHERE promotion_id = ?').run(id);
            } else {
                // Insert
                const sql = `INSERT INTO promotions (name, discount_type, value, start_date, end_date, active) VALUES (?, ?, ?, ?, ?, ?)`;
                const { lastInsertRowid } = db.prepare(sql).run([name, discount_type, value, start_date, end_date, active ? 1 : 0]);
                promoId = lastInsertRowid;
            }

            // Insert new targets
            if (targets && targets.length > 0) {
                const targetSql = `INSERT INTO promotion_targets (promotion_id, target_type, target_id) VALUES (?, ?, ?)`;
                const insertTarget = db.prepare(targetSql);
                for (const target of targets) {
                    insertTarget.run([promoId, target.target_type, target.target_id]);
                }
            }

            return promoId;
        });

        const newId = transaction();
        return { success: true, id: newId };
    });

    // Delete promotion
    ipcMain.handle('promotion:delete', (_, id) => {
        db.prepare('DELETE FROM promotions WHERE id = ?').run(id);
        return { success: true };
    });

    // Toggle active status
    ipcMain.handle('promotion:toggle-active', (_, id) => {
        db.prepare('UPDATE promotions SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
        return { success: true };
    });
}

export { registerPromotionHandlers };
