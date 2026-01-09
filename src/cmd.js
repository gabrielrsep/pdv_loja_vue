import path from 'path';
import { db } from './database/database.js';
import bcrypt from 'bcryptjs';
import fs from 'fs-extra';
import { app } from 'electron';
import readline from 'readline';

let lastQuestion

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const exit = message => {
    console.log(message);
    rl.close();
    process.exit(0);
}

if (!app.isPackaged && process.argv.includes('--clear-db')) {
    const databasePath = path.resolve(__dirname, 'database', 'pdv.db');
    fs.removeSync(databasePath);
    console.log('Database cleared successfully');
}

const ifNotExistsExit = (condition, message) => {
    if (!condition.trim()) {
        exit(message);
    }
}

const question = (message, errorMessage) => {
    lastQuestion = message;
    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            if (!answer.trim()) {
                console.log(errorMessage);
                return question(lastQuestion, errorMessage);
            }
            resolve(answer);
        });
    });
}

const changePasswordIndex = process.argv.indexOf('change-password');

if (changePasswordIndex !== -1) {
    const userToChangePassword = process.argv[changePasswordIndex + 1];
    ifNotExistsExit(userToChangePassword, 'Usuário inválido');

    changePassword(userToChangePassword);
}

async function changePassword(userToChangePassword) {
    const userToChangePasswordData = db.prepare("SELECT * FROM users WHERE username = ?").get(userToChangePassword);
    await question(userToChangePasswordData, 'Usuário inválido');

    const adminUsername = await question('digite o nome de um usuário com papel de administrador: ', 'Usuário inválido');
    const adminPassword = await question('digite a senha desse usuário: ', 'Senha inválida');

    const { password_hash: adminPasswordHash } = db.prepare("SELECT password_hash FROM users WHERE username = ? and role = 'administrador'").get(adminUsername);
    ifNotExistsExit(adminPasswordHash, 'Usuário inválido');

    const isMatch = await bcrypt.compare(adminPassword, adminPasswordHash);
    if (!isMatch) {
        exit('Senha inválida');
    }
    console.log(`✅ Altenticação bem sucedida para o usuário ${adminUsername}`);

    const newPassword = await question(`Digite a nova senha do usuário ${userToChangePassword}: `, 'Senha inválida');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE users SET password_hash = ? WHERE username = ?").run(passwordHash, userToChangePassword);
    exit('Senha alterada com sucesso');
}
