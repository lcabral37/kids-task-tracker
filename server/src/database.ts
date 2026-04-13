import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Support DATABASE_URL env var for Docker deployments, fallback to default
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, '../data/tasks.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

export type TaskType = 'earning' | 'spending';

export interface TaskTemplate {
    id: string;
    title: string;
    description?: string;
    amount: number;
    type: TaskType;
    icon?: string;
    order: number;
}

export interface TaskOccurrence {
    id: string;
    templateId: string;
    childId: string;
    date: string;
    completionCount: number;
}

export interface Child {
    id: string;
    name: string;
    age: number;
    pin?: string;
    manualAdjustment: number;
}

export interface SyncData {
    children: Child[];
    taskTemplates: TaskTemplate[];
    occurrences: TaskOccurrence[];
    version: number;
}

let db: sqlite3.Database;

export const initDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }

            db.serialize(() => {
                // Children table
                db.run(
                    `CREATE TABLE IF NOT EXISTS children (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        age INTEGER NOT NULL,
                        pin TEXT,
                        manualAdjustment REAL DEFAULT 0,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`
                );

                // Task Templates table
                db.run(
                    `CREATE TABLE IF NOT EXISTS taskTemplates (
                        id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT,
                        amount REAL NOT NULL,
                        type TEXT NOT NULL CHECK(type IN ('earning', 'spending')),
                        icon TEXT,
                        "order" INTEGER NOT NULL,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                    )`
                );

                // Task Occurrences table
                db.run(
                    `CREATE TABLE IF NOT EXISTS taskOccurrences (
                        id TEXT PRIMARY KEY,
                        templateId TEXT NOT NULL,
                        childId TEXT NOT NULL,
                        date TEXT NOT NULL,
                        completionCount INTEGER DEFAULT 0,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(templateId) REFERENCES taskTemplates(id) ON DELETE CASCADE,
                        FOREIGN KEY(childId) REFERENCES children(id) ON DELETE CASCADE,
                        UNIQUE(templateId, childId, date)
                    )`
                );

                // Sync log table
                db.run(
                    `CREATE TABLE IF NOT EXISTS syncLog (
                        id TEXT PRIMARY KEY,
                        childId TEXT NOT NULL,
                        lastSyncAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(childId) REFERENCES children(id) ON DELETE CASCADE
                    )`
                );

                resolve();
            });
        });
    });
};

export const getDatabase = (): sqlite3.Database => {
    return db;
};

export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number; }> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

export const dbGet = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T | undefined);
        });
    });
};

export const dbAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve((rows || []) as T[]);
        });
    });
};

export const closeDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        } else {
            resolve();
        }
    });
};
