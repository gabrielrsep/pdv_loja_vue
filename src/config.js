import { parse, stringify, assign } from 'comment-json';
import { readFileSync, copyFileSync, writeFileSync } from 'fs-extra';
import path from 'path';
import { app } from 'electron';

const devPath = path.join(process.cwd(), 'src');


/**
 * 
 * @param {string[]} paths 
 * @returns {string}
 */
const getResourcesPath = (...paths) => {
    /**
     * se for em produção, pega o último path (exemplo: database/create-tables.sql > create-tables.sql)
     * se for em desenvolvimento, pega o path normal
     * os arquivos em produção estão na rais do process.resourcesPath
     */
    if (app.isPackaged) {
        paths = paths.at(-1);
    }
    const base = app.isPackaged ? process.resourcesPath : devPath
    return path.join(base, ...paths)
}

const appData = (...paths) => {
    if (app.isPackaged) {
        return path.join(app.getPath('userData'), ...paths);
    }
    return path.join(devPath, ...paths);
}

const getConfig = () => parse(readFileSync(appData('config.jsonc'), 'utf-8'));

/**
 * copy config.jsonc to appData if it doesn't exist
 * @param {import('./database/database').DB} db 
 * @returns {string} path to config.jsonc
 */
const copyConfig = (db) => {
    if (app.isPackaged) {
        const { count } = db.prepare("SELECT count(*) as count FROM users").get();
        if (count === 0) {
            copyFileSync(getResourcesPath('config.jsonc'), appData('config.jsonc'));
        }
        console.log('Config copied');
    }
}

/**
 * 
 * @param {object} newConfig 
 */
const saveConfig = (newConfig) => {
    const currentConfigStr = readFileSync(appData('config.jsonc'), 'utf-8');
    const currentConfig = parse(currentConfigStr);

    // Check if margin is valid number
    if (newConfig.margin !== undefined) {
        newConfig.margin = parseFloat(newConfig.margin);
    }

    if (newConfig.allow_salesperson_undo_sale !== undefined) {
        newConfig.allow_salesperson_undo_sale = Boolean(newConfig.allow_salesperson_undo_sale);
    }

    const updatedConfig = assign(currentConfig, newConfig);
    writeFileSync(appData('config.jsonc'), stringify(updatedConfig, null, 4));
    return updatedConfig;
}

export {
    appData,
    getConfig,
    saveConfig,
    getResourcesPath,
    copyConfig
};