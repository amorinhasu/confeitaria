const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const { databasePath } = require('../utils/config');

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new sqlite3.Database(databasePath);
let transactionLock = Promise.resolve();

function exec(sql) {
  return new Promise((resolve, reject) => {
    sqlite.exec(sql, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

async function transaction(callback) {
  const previousTransaction = transactionLock;
  let releaseTransaction;
  transactionLock = new Promise((resolve) => {
    releaseTransaction = resolve;
  });

  await previousTransaction;

  try {
    await ready;
    await exec('BEGIN IMMEDIATE TRANSACTION');

    try {
      const result = await callback({ all, exec, get, run });
      await exec('COMMIT');
      return result;
    } catch (error) {
      try {
        await exec('ROLLBACK');
      } catch (rollbackError) {
        console.error('Erro ao desfazer transação SQLite:', rollbackError);
      }
      throw error;
    }
  } finally {
    releaseTransaction();
  }
}

async function migrate() {
  await exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS couple_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      trivia_name TEXT NOT NULL DEFAULT 'Trívia',
      kaiki_name TEXT NOT NULL DEFAULT 'Kaiki',
      nicknames TEXT NOT NULL DEFAULT 'pudinzinho, panquequinha, momo',
      start_date TEXT NOT NULL DEFAULT '2026-05-05',
      status TEXT NOT NULL DEFAULT 'Em call de madrugada, rindo baixo e se escolhendo todo dia',
      achievements TEXT NOT NULL DEFAULT 'Sobreviver a saudade; Maratonar juntinhos; Estudar sem surtar; Farmar MomoCoins'
    );

    CREATE TABLE IF NOT EXISTS love_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      memory_date TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      platform TEXT NOT NULL,
      trivia_rating REAL NOT NULL,
      kaiki_rating REAL NOT NULL,
      comment TEXT NOT NULL,
      watched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      link TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      balance INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coin_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      cost INTEGER NOT NULL,
      purchased_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      minutes INTEGER,
      coins_awarded INTEGER NOT NULL DEFAULT 0,
      subject TEXT,
      started_by TEXT,
      pause_started_at TEXT,
      pause_count INTEGER NOT NULL DEFAULT 0,
      paused_seconds INTEGER NOT NULL DEFAULT 0
    );
  `);

  const loveNoteColumns = await all('PRAGMA table_info(love_notes)');
  if (!loveNoteColumns.some((column) => column.name === 'image_url')) {
    await run('ALTER TABLE love_notes ADD COLUMN image_url TEXT');
  }

  const memoryColumns = await all('PRAGMA table_info(memories)');
  if (!memoryColumns.some((column) => column.name === 'image_url')) {
    await run('ALTER TABLE memories ADD COLUMN image_url TEXT');
  }


  const studyColumns = await all('PRAGMA table_info(study_sessions)');
  const ensureStudyColumn = async (name, definition) => {
    if (!studyColumns.some((column) => column.name === name)) await run(`ALTER TABLE study_sessions ADD COLUMN ${name} ${definition}`);
  };
  await ensureStudyColumn('subject', 'TEXT');
  await ensureStudyColumn('started_by', 'TEXT');
  await ensureStudyColumn('pause_started_at', 'TEXT');
  await ensureStudyColumn('pause_count', 'INTEGER NOT NULL DEFAULT 0');
  await ensureStudyColumn('paused_seconds', 'INTEGER NOT NULL DEFAULT 0');

  await exec('DROP TABLE IF EXISTS couple_setup');
  await run('INSERT OR IGNORE INTO couple_profile (id) VALUES (1)');
  await run('INSERT OR IGNORE INTO coins (id, balance) VALUES (1, 0)');
}

const ready = migrate();

module.exports = { all, exec, get, ready, run, transaction };
