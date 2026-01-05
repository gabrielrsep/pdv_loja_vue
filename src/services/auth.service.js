import { ipcMain } from 'electron';
import bcrypt from 'bcryptjs';

function registerAuthHandlers(db) {
    let currentUser = null;

    ipcMain.handle('auth:set-current-user', (_, user) => {
        currentUser = user;
    });

    ipcMain.handle('auth:get-current-user', () => {
        return currentUser;
    });

    ipcMain.handle('auth:check-setup', () => {
        const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
        return { hasAdmin: userCount > 0 };
    });

    ipcMain.handle('auth:register-first-admin', async (_, userData) => {
        const { username, password, recoveryQuestion, recoveryAnswer } = userData;
        const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;

        if (userCount > 0) {
            return { success: false, error: 'Administrador já cadastrado.' };
        }

        try {
            const passwordHash = await bcrypt.hash(password, 12);
            const createdAt = new Date().toISOString();

            const sql = `INSERT INTO users (username, password_hash, role, recovery_question, recovery_answer, created_at) 
                         VALUES (?, ?, 'administrador', ?, ?, ?)`;
            db.prepare(sql).run([username, passwordHash, recoveryQuestion, recoveryAnswer, createdAt]);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('auth:login', async (event, { username, password }) => {
        try {
            const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
            if (!user) {
                return { success: false, error: 'Usuário não encontrado.' };
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return { success: false, error: 'Senha incorreta.' };
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('auth:get-recovery-question', (_, username) => {
        const user = db.prepare("SELECT recovery_question FROM users WHERE username = ?").get(username);
        if (!user) return { success: false, error: 'Usuário não encontrado' };
        return { success: true, question: user.recovery_question };
    });

    ipcMain.handle('auth:recover-password', async (_, { username, answer, newPassword }) => {
        try {
            const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
            if (!user) return { success: false, error: 'Usuário não encontrado.' };

            if (answer.toLowerCase().trim() !== user.recovery_answer.toLowerCase().trim()) {
                return { success: false, error: 'Resposta de segurança incorreta.' };
            }

            const passwordHash = await bcrypt.hash(newPassword, 12);

            db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run([passwordHash, user.id]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // User Management Handlers
    ipcMain.handle('user:get-all', () => {
        return db.prepare("SELECT id, username, role, recovery_question, created_at FROM users ORDER BY username ASC").all();
    });

    ipcMain.handle('user:save', async (_, userData) => {
        const { id, username, password, role, recoveryQuestion, recoveryAnswer } = userData;
        const createdAt = new Date().toISOString();

        try {
            if (id) {
                // Update
                if (password) {
                    const passwordHash = await bcrypt.hash(password, 12);
                    const sql = `UPDATE users SET username = ?, password_hash = ?, role = ?, recovery_question = ?, recovery_answer = ? WHERE id = ?`;
                    db.prepare(sql).run([username, passwordHash, role, recoveryQuestion, recoveryAnswer, id]);
                } else {
                    const sql = `UPDATE users SET username = ?, role = ?, recovery_question = ?, recovery_answer = ? WHERE id = ?`;
                    db.prepare(sql).run([username, role, recoveryQuestion, recoveryAnswer, id]);
                }
                return { success: true, id };
            } else {
                // Insert
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(password, salt);
                const sql = `INSERT INTO users (username, password_hash, role, recovery_question, recovery_answer, created_at) 
                             VALUES (?, ?, ?, ?, ?, ?)`;
                const { lastInsertRowid } = db.prepare(sql).run([username, passwordHash, role, recoveryQuestion, recoveryAnswer, createdAt]);
                return { success: true, id: lastInsertRowid };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('user:delete', (event, id) => {
        try {
            // Prevent deleting the last admin
            const user = db.prepare("SELECT role FROM users WHERE id = ?").get(id);
            if (user && user.role === 'administrador') {
                const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'administrador'").get().count;
                if (adminCount <= 1) {
                    return { success: false, error: 'Não é possível excluir o único administrador do sistema.' };
                }
            }
            db.prepare("DELETE FROM users WHERE id = ?").run(id);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

export { registerAuthHandlers };
