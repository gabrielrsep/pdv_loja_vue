import { ipcMain } from 'electron';

function registerCategoryHandlers(db) {
    // Get all categories
    ipcMain.handle('category:get-all', () => {
        return db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    });

    // Get category by ID
    ipcMain.handle('category:get-by-id', (_, id) => {
        return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    });

    // Create category
    ipcMain.handle('category:create', (_, category) => {
        const { name, color, icon } = category;
        try {
            const sql = 'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)';
            const { lastInsertRowid } = db.prepare(sql).run([name, color, icon]);
            return { success: true, id: lastInsertRowid };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return { success: false, error: 'Já existe uma categoria com este nome.' };
            }
            return { success: false, error: error.message };
        }
    });

    // Update category
    ipcMain.handle('category:update', (_, category) => {
        const { id, name, color, icon } = category;
        try {
            const sql = 'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?';
            db.prepare(sql).run([name, color, icon, id]);
            return { success: true };
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return { success: false, error: 'Já existe uma categoria com este nome.' };
            }
            return { success: false, error: error.message };
        }
    });

    // Delete category
    ipcMain.handle('category:delete', (_, id) => {
        try {
            // Check if there are products using this category
            const productsCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id).count;
            if (productsCount > 0) {
                return { success: false, error: 'Não é possível excluir uma categoria que possui produtos vinculados.' };
            }

            db.prepare('DELETE FROM categories WHERE id = ?').run(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

export { registerCategoryHandlers };
