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

async function getProfile() {
  await db.ready;
  return db.get('SELECT * FROM couple_profile WHERE id = 1');
}

async function addLoveNote(text, imageUrl = null) {
  await db.ready;
  return db.run('INSERT INTO love_notes (text, image_url) VALUES (?, ?)', [text, imageUrl || null]);
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

async function addMemory(title, description, date, imageUrl = null) {
  await db.ready;
  return db.run('INSERT INTO memories (title, description, memory_date, image_url) VALUES (?, ?, ?, ?)', [title, description, date, imageUrl]);
}

async function updateMemoryImage(memoryId, imageUrl) {
  await db.ready;
  return db.run('UPDATE memories SET image_url = ? WHERE id = ?', [imageUrl, memoryId]);
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

function dateFromSqlite(value) {
  return new Date(`${value}Z`);
}

function calculatePauseSeconds(session, now = Date.now()) {
  const storedPauseSeconds = Number(session.paused_seconds || 0);
  if (!session.pause_started_at) return storedPauseSeconds;
  return storedPauseSeconds + Math.max(0, Math.floor((now - dateFromSqlite(session.pause_started_at).getTime()) / 1000));
}

function calculateStudyMinutes(session, now = Date.now()) {
  const startedAt = dateFromSqlite(session.started_at).getTime();
  const endedAt = session.ended_at ? dateFromSqlite(session.ended_at).getTime() : now;
  const effectiveMs = Math.max(0, endedAt - startedAt - (calculatePauseSeconds(session, endedAt) * 1000));
  return Math.max(1, Math.floor(effectiveMs / 60000));
}

async function getStudyStats() {
  await db.ready;
  const row = await db.get(`
    SELECT
      COUNT(*) AS sessions,
      COALESCE(SUM(minutes), 0) AS minutes,
      COALESCE(SUM(coins_awarded), 0) AS coins,
      COALESCE(SUM(pause_count), 0) AS pause_count,
      COALESCE(SUM(paused_seconds), 0) AS paused_seconds
    FROM study_sessions
    WHERE ended_at IS NOT NULL
  `);
  const open = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  return {
    sessions: row?.sessions ?? 0,
    minutes: row?.minutes ?? 0,
    coins: row?.coins ?? 0,
    pauseCount: row?.pause_count ?? 0,
    pausedSeconds: row?.paused_seconds ?? 0,
    open,
    openPausedSeconds: open ? calculatePauseSeconds(open) : 0,
    openEffectiveMinutes: open ? calculateStudyMinutes(open) : 0,
  };
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

async function startStudySession(subject = null, startedBy = null) {
  await db.ready;
  const open = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  if (open) return { created: false, session: open };
  const cleanSubject = subject?.trim() || null;
  const info = await db.run('INSERT INTO study_sessions (started_at, subject, started_by) VALUES (CURRENT_TIMESTAMP, ?, ?)', [cleanSubject, startedBy || null]);
  return { created: true, session: await db.get('SELECT * FROM study_sessions WHERE id = ?', [info.lastID]) };
}

async function pauseStudySession(kind = 'water') {
  await db.ready;
  const session = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  if (!session) return { ok: false, reason: 'not_open' };
  if (session.pause_started_at) return { ok: false, reason: 'already_paused', session };

  await db.run('UPDATE study_sessions SET pause_started_at = CURRENT_TIMESTAMP, pause_count = pause_count + 1 WHERE id = ?', [session.id]);
  return { ok: true, kind, session: await db.get('SELECT * FROM study_sessions WHERE id = ?', [session.id]) };
}

async function resumeStudySession() {
  await db.ready;
  const session = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  if (!session) return { ok: false, reason: 'not_open' };
  if (!session.pause_started_at) return { ok: false, reason: 'not_paused', session };

  const pauseSeconds = Math.max(0, Math.floor((Date.now() - dateFromSqlite(session.pause_started_at).getTime()) / 1000));
  await db.run('UPDATE study_sessions SET paused_seconds = paused_seconds + ?, pause_started_at = NULL WHERE id = ?', [pauseSeconds, session.id]);
  return { ok: true, pauseSeconds, session: await db.get('SELECT * FROM study_sessions WHERE id = ?', [session.id]) };
}

async function finishStudySession() {
  await db.ready;
  const session = await db.get('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1');
  if (!session) return null;

  const pausedSeconds = calculatePauseSeconds(session);
  const minutes = calculateStudyMinutes(session);
  const coinsAwarded = Math.max(1, Math.floor(minutes / 10));

  return db.transaction(async (tx) => {
    await tx.run(`
      UPDATE study_sessions
      SET ended_at = CURRENT_TIMESTAMP, minutes = ?, coins_awarded = ?, paused_seconds = ?, pause_started_at = NULL
      WHERE id = ?
    `, [minutes, coinsAwarded, pausedSeconds, session.id]);
    await tx.run('UPDATE coins SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [coinsAwarded]);
    await tx.run('INSERT INTO coin_transactions (amount, type, reason) VALUES (?, ?, ?)', [coinsAwarded, 'study_reward', `Recompensa por ${minutes} minuto(s) de estudo`]);

    const balanceRow = await tx.get('SELECT balance FROM coins WHERE id = 1');
    return { ...session, minutes, coinsAwarded, balance: balanceRow?.balance ?? 0, pausedSeconds, pauseCount: session.pause_count || 0 };
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
  ensureInitialCoupleMemory,
  getProfile,
  addLoveNote,
  getRandomLoveNote,
  countLoveNotes,
  countMemories,
  countMovies,
  countGifts,
  addMemory,
  updateMemoryImage,
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
  pauseStudySession,
  resumeStudySession,
  finishStudySession,
  getStudyStats,
  buyGift,
};
