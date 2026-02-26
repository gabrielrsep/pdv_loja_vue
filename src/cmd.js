/**
 * Command-line interface for managing PDV (Ponto de Venda) application
 * 
 * This module provides administrative CLI commands for the PDV application, including:
 * - Database clearing functionality (development mode only)
 * - User password management with admin authentication
 * 
 * Features:
 * - Interactive readline interface for user input validation
 * - Secure password hashing using bcryptjs
 * - Admin role verification for password changes
 * - Database operations using better-sqlite3
 * 
 * Supported Commands:
 * - `--clear-db`: Clears the SQLite database (only in development/unpackaged app)
 * - `change-password <username>`: Changes password for specified user after admin authentication
 * 
 * @module cmd
 * @requires path - Node.js path utilities
 * @requires fs-extra - File system operations with extras
 * @requires bcryptjs - Password hashing library
 * @requires readline - Interactive CLI interface
 * @requires electron - Electron app context for packaging check
 * @requires ./database/database.js - Database connection instance
 * 
 * @example
 * // Clear database in development
 * node cmd.js --clear-db
 * 
 * @example
 * // Change user password
 * node cmd.js change-password username
 */

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
