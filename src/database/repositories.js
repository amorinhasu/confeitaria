const db = require('./db');
const { withEmoji } = require('../utils/emojis');

const giftsCatalog = [
  { key: 'panquequinha', label: withEmoji('mimos', 'pancake', 'Panquequinha'), cost: 15, description: 'Um mimo fofinho de panquequinha.' },
  { key: 'pudinzinho', label: withEmoji('mimos', 'pudding', 'Pudinzinho'), cost: 15, description: 'Pudinzinho para adoçar a call.' },
  { key: 'cartinha', label: withEmoji('mimos', 'letter', 'Cartinha'), cost: 25, description: 'Uma cartinha feita com carinho.' },
  { key: 'vale_filme', label: withEmoji('mimos', 'movie', 'Vale filme'), cost: 35, description: 'Kaiki escolhe um filme/série da vez.' },
  { key: 'vale_roblox', label: withEmoji('mimos', 'roblox', 'Vale Roblox'), cost: 40, description: 'Uma gameplay de Roblox garantida.' },
  { key: 'vale_carinho', label: withEmoji('mimos', 'care', 'Vale carinho'), cost: 50, description: 'Vale carinho ilimitado e risadinhas.' },
];

async function getProfile() {
  await db.ready;
  return db.get('SELECT * FROM couple_profile WHERE id = 1');
}

async function addLoveNote(text) {
  await db.ready;
  return db.run('INSERT INTO love_notes (text) VALUES (?)', [text]);
}

async function getRandomLoveNote() {
  await db.ready;
  return db.get('SELECT * FROM love_notes ORDER BY RANDOM() LIMIT 1');
}

async function countLoveNotes() {
  await db.ready;
  const row = await db.get('SELECT COUNT(*) AS total FROM love_notes');
  return row?.total ?? 0;
}

async function addMemory(title, description, date) {
  await db.ready;
  return db.run('INSERT INTO memories (title, description, memory_date) VALUES (?, ?, ?)', [title, description, date]);
}

async function listMemories(limit = 5) {
  await db.ready;
  return db.all('SELECT * FROM memories ORDER BY id DESC LIMIT ?', [limit]);
}

async function addMovie(name, type, platform, triviaRating, kaikiRating, comment) {
  await db.ready;
  return db.run(`
    INSERT INTO movies (name, type, platform, trivia_rating, kaiki_rating, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [name, type, platform, triviaRating, kaikiRating, comment]);
}

async function listMovies(limit = 5) {
  await db.ready;
  return db.all('SELECT * FROM movies ORDER BY id DESC LIMIT ?', [limit]);
}

async function getStudyStats() {
  await db.ready;
  const row = await db.get(`
    SELECT
      COUNT(*) AS sessions,
      COALESCE(SUM(minutes), 0) AS minutes,
      COALESCE(SUM(coins_awarded), 0) AS coins
    FROM study_sessions
    WHERE ended_at IS NOT NULL
  `);
  const open = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  return { sessions: row?.sessions ?? 0, minutes: row?.minutes ?? 0, coins: row?.coins ?? 0, open };
}

async function setPlaylist(link) {
  await db.ready;
  return db.run(`
    INSERT INTO playlist (id, link, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET link = excluded.link, updated_at = CURRENT_TIMESTAMP
  `, [link]);
}

async function getPlaylist() {
  await db.ready;
  return db.get('SELECT * FROM playlist WHERE id = 1');
}

async function getCoins() {
  await db.ready;
  const row = await db.get('SELECT balance FROM coins WHERE id = 1');
  return row?.balance ?? 0;
}

async function addCoins(quantity) {
  await db.ready;
  await db.run('UPDATE coins SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [quantity]);
  return await getCoins();
}

async function spendCoins(quantity) {
  const current = await getCoins();
  if (current < quantity) return { ok: false, balance: current };
  await db.run('UPDATE coins SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [quantity]);
  return { ok: true, balance: await getCoins() };
}

async function startStudySession() {
  await db.ready;
  const open = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  if (open) return { created: false, session: open };
  const info = await db.run('INSERT INTO study_sessions (started_at) VALUES (CURRENT_TIMESTAMP)');
  return { created: true, session: await db.get('SELECT * FROM study_sessions WHERE id = ?', [info.lastID]) };
}

async function finishStudySession() {
  await db.ready;
  const session = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  if (!session) return null;

  const startedAt = new Date(`${session.started_at}Z`);
  const minutes = Math.max(1, Math.floor((Date.now() - startedAt.getTime()) / 60000));
  const coinsAwarded = Math.max(1, Math.floor(minutes / 10));

  await db.run(`
    UPDATE study_sessions
    SET ended_at = CURRENT_TIMESTAMP, minutes = ?, coins_awarded = ?
    WHERE id = ?
  `, [minutes, coinsAwarded, session.id]);
  await addCoins(coinsAwarded);

  return { ...session, minutes, coinsAwarded, balance: await getCoins() };
}

async function buyGift(key) {
  const item = giftsCatalog.find((gift) => gift.key === key);
  if (!item) return { ok: false, reason: 'not_found' };
  const purchase = await spendCoins(item.cost);
  if (!purchase.ok) return { ok: false, reason: 'no_coins', item, balance: purchase.balance };
  await db.run('INSERT INTO gifts (item, cost) VALUES (?, ?)', [item.label, item.cost]);
  return { ok: true, item, balance: purchase.balance };
}

module.exports = {
  giftsCatalog,
  getProfile,
  addLoveNote,
  getRandomLoveNote,
  countLoveNotes,
  addMemory,
  listMemories,
  addMovie,
  listMovies,
  setPlaylist,
  getPlaylist,
  getCoins,
  addCoins,
  startStudySession,
  finishStudySession,
  getStudyStats,
  buyGift,
};
