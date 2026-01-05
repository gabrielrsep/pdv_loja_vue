import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'fs-extra';
import { appData, getResourcesPath } from '../config.js';
import { app } from 'electron'

const dbDir = appData('database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const dbPath = path.resolve(dbDir, 'pdv.db');
const db = Database(dbPath);

console.log("Database path:", dbDir);

function readDatabaseFile(...filePath) {
  return fs.readFileSync(getResourcesPath('database', ...filePath), 'utf8');
}

const createTablesSQL = readDatabaseFile('create-tables.sql');
db.exec(createTablesSQL);
console.log("Database created...");

let testDataSQL;
if (!app.isPackaged) {
  testDataSQL = readDatabaseFile('test-data.sql');
  const { count: usersCount } = db.prepare('SELECT count(*) as count FROM users').get()
  if (usersCount === 0) {
    db.exec(testDataSQL);
    console.log("Test data seeded...");
  }
}

export { db, readDatabaseFile };

export const getStats = (queryName, queryParams = undefined) => {
  const sql = readDatabaseFile('stats', `${queryName}.sql`);
  const stmt = db.prepare(sql);
  return {
    get: () => stmt.get(queryParams),
    all: () => stmt.all(queryParams)
  }
}

