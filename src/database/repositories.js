const db = require('./db');
const { withEmoji } = require('../utils/emojis');

function createGift(key, emojiKey, labelText, cost, description) {
  return {
    key,
    emojiKey,
    labelText,
    cost,
    description,
    get label() {
      return withEmoji('mimos', emojiKey, labelText);
    },
  };
}

const giftsCatalog = [
  createGift('panquequinha', 'pancake', 'Panquequinha', 15, 'Um mimo fofinho de panquequinha.'),
  createGift('pudinzinho', 'pudding', 'Pudinzinho', 15, 'Pudinzinho para adoçar a call.'),
  createGift('cartinha', 'letter', 'Cartinha', 25, 'Uma cartinha feita com carinho.'),
  createGift('vale_filme', 'movie', 'Vale filme', 35, 'Kaiki escolhe um filme/série da vez.'),
  createGift('vale_roblox', 'roblox', 'Vale Roblox', 40, 'Uma gameplay de Roblox garantida.'),
  createGift('vale_carinho', 'care', 'Vale carinho', 50, 'Vale carinho ilimitado e risadinhas.'),
];

const INITIAL_DATING_MEMORY = {
  title: 'Pedido de namoro no Roblox',
  description: 'Kaiki pediu Trívia em namoro no dia 03/06, dentro do Roblox, em um mapa feito do zero para ela.',
  date: '2026-06-03',
};

const INITIAL_DATING_ACHIEVEMENT = 'Pedido de namoro no Roblox em 03/06';

async function ensureEnvironmentCoupleSetup(triviaId, kaikiId) {
  if (!triviaId || !kaikiId) return null;
  return saveCoupleSetup(triviaId, kaikiId);
}

async function ensureInitialCoupleMemory() {
  await db.ready;
  const existingMemory = await db.get('SELECT id FROM memories WHERE title = ? OR description = ? LIMIT 1', [INITIAL_DATING_MEMORY.title, INITIAL_DATING_MEMORY.description]);
  if (!existingMemory) {
    await db.run('INSERT INTO memories (title, description, memory_date) VALUES (?, ?, ?)', [INITIAL_DATING_MEMORY.title, INITIAL_DATING_MEMORY.description, INITIAL_DATING_MEMORY.date]);
  }

  const profile = await db.get('SELECT achievements FROM couple_profile WHERE id = 1');
  const achievements = profile?.achievements || '';
  if (!achievements.split(';').map((item) => item.trim()).includes(INITIAL_DATING_ACHIEVEMENT)) {
    const updatedAchievements = achievements ? `${achievements}; ${INITIAL_DATING_ACHIEVEMENT}` : INITIAL_DATING_ACHIEVEMENT;
    await db.run('UPDATE couple_profile SET achievements = ? WHERE id = 1', [updatedAchievements]);
  }
}

async function getCoupleSetup() {
  await db.ready;
  return db.get('SELECT * FROM couple_setup WHERE id = 1');
}

async function saveCoupleSetup(triviaId, kaikiId) {
  await db.ready;
  await db.run(`
    INSERT INTO couple_setup (id, trivia_id, kaiki_id, created_at, updated_at)
    VALUES (1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      trivia_id = excluded.trivia_id,
      kaiki_id = excluded.kaiki_id,
      updated_at = CURRENT_TIMESTAMP
  `, [triviaId, kaikiId]);
  return getCoupleSetup();
}

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

async function countMemories() {
  await db.ready;
  const row = await db.get('SELECT COUNT(*) AS total FROM memories');
  return row?.total ?? 0;
}

async function countMovies() {
  await db.ready;
  const row = await db.get('SELECT COUNT(*) AS total FROM movies');
  return row?.total ?? 0;
}

async function countGifts() {
  await db.ready;
  const row = await db.get('SELECT COUNT(*) AS total FROM gifts');
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

async function recordCoinTransaction(amount, type, reason) {
  await db.ready;
  return db.run('INSERT INTO coin_transactions (amount, type, reason) VALUES (?, ?, ?)', [amount, type, reason]);
}

async function addCoins(quantity, reason = 'Ajuste manual de MomoCoins', type = 'manual') {
  await db.ready;
  await db.run('UPDATE coins SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [quantity]);
  await recordCoinTransaction(quantity, type, reason);
  return await getCoins();
}

async function getRecentCoinTransactions(limit = 5) {
  await db.ready;
  return db.all('SELECT * FROM coin_transactions ORDER BY id DESC LIMIT ?', [limit]);
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

  return db.transaction(async (tx) => {
    await tx.run(`
      UPDATE study_sessions
      SET ended_at = CURRENT_TIMESTAMP, minutes = ?, coins_awarded = ?
      WHERE id = ?
    `, [minutes, coinsAwarded, session.id]);
    await tx.run('UPDATE coins SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [coinsAwarded]);
    await tx.run('INSERT INTO coin_transactions (amount, type, reason) VALUES (?, ?, ?)', [coinsAwarded, 'study_reward', `Recompensa por ${minutes} minuto(s) de estudo`]);

    const balanceRow = await tx.get('SELECT balance FROM coins WHERE id = 1');
    return { ...session, minutes, coinsAwarded, balance: balanceRow?.balance ?? 0 };
  });
}

async function buyGift(key) {
  await db.ready;
  const item = giftsCatalog.find((gift) => gift.key === key);
  if (!item) return { ok: false, reason: 'not_found' };

  return db.transaction(async (tx) => {
    const current = await tx.get('SELECT balance FROM coins WHERE id = 1');
    const balance = current?.balance ?? 0;
    if (balance < item.cost) return { ok: false, reason: 'no_coins', item, balance };

    await tx.run('UPDATE coins SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [item.cost]);
    await tx.run('INSERT INTO gifts (item, cost) VALUES (?, ?)', [item.label, item.cost]);
    await tx.run('INSERT INTO coin_transactions (amount, type, reason) VALUES (?, ?, ?)', [-item.cost, 'gift_purchase', `Compra de mimo: ${item.key}`]);

    const updated = await tx.get('SELECT balance FROM coins WHERE id = 1');
    return { ok: true, item, balance: updated?.balance ?? 0 };
  });
}

module.exports = {
  giftsCatalog,
  INITIAL_DATING_MEMORY,
  ensureEnvironmentCoupleSetup,
  ensureInitialCoupleMemory,
  getCoupleSetup,
  saveCoupleSetup,
  getProfile,
  addLoveNote,
  getRandomLoveNote,
  countLoveNotes,
  countMemories,
  countMovies,
  countGifts,
  addMemory,
  listMemories,
  addMovie,
  listMovies,
  setPlaylist,
  getPlaylist,
  getCoins,
  addCoins,
  getRecentCoinTransactions,
  recordCoinTransaction,
  startStudySession,
  finishStudySession,
  getStudyStats,
  buyGift,
};
