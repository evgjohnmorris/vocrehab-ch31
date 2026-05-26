import sqlite3 from 'sqlite3';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, process.env.DATABASE_PATH || 'm28c_guide.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Serialize database initializations
db.serialize(() => {
  // 1. Create authority_records table
  db.run(`
    CREATE TABLE IF NOT EXISTS authority_records (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      citation TEXT NOT NULL,
      title TEXT NOT NULL,
      full_text TEXT,
      topics TEXT, -- stored as JSON string
      hash TEXT,
      authority_level TEXT,
      status TEXT,
      source_url TEXT,
      plain_english TEXT,
      veteran_use TEXT
    )
  `);

  // 2. Create user_state table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Create FTS5 virtual table for searching if supported
  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS authority_search_idx USING fts5(
      id,
      citation,
      title,
      full_text,
      content='authority_records',
      content_rowid='rowid'
    )
  `, (err) => {
    if (err) {
      console.warn('FTS5 virtual search index creation skipped/not supported, fallback to standard queries:', err.message);
    } else {
      console.log('FTS5 search index table created/verified.');
    }
  });
});

export default db;
