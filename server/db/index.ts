import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '../env.js';
import * as schema from './schema.js';
import path from 'path';

const dbPath = path.resolve(process.cwd(), env.DATABASE_URL);
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });
