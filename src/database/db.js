const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const { databasePath } = require('../utils/config');

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS couple_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      trivia_name TEXT NOT NULL DEFAULT 'Trívia',
      kaiki_name TEXT NOT NULL DEFAULT 'Kaiki',
      nicknames TEXT NOT NULL DEFAULT 'pudinzinho, panquequinha, momo',
      start_date TEXT NOT NULL DEFAULT '2026-05-05',
      status TEXT NOT NULL DEFAULT 'Em call de madrugada, rindo baixo e se escolhendo todo dia 💙',
      achievements TEXT NOT NULL DEFAULT 'Sobreviver a saudade; Maratonar juntinhos; Estudar sem surtar; Farmar MomoCoins'
    );

    CREATE TABLE IF NOT EXISTS love_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      memory_date TEXT NOT NULL,
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
      coins_awarded INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.prepare('INSERT OR IGNORE INTO couple_profile (id) VALUES (1)').run();
  db.prepare('INSERT OR IGNORE INTO coins (id, balance) VALUES (1, 0)').run();
}

migrate();

module.exports = db;
