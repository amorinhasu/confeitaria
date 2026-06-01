const db = require('./db');

const giftsCatalog = [
  { key: 'panquequinha', label: '🥞 Panquequinha', cost: 15, description: 'Um mimo fofinho de panquequinha.' },
  { key: 'pudinzinho', label: '🍮 Pudinzinho', cost: 15, description: 'Pudinzinho para adoçar a call.' },
  { key: 'cartinha', label: '💌 Cartinha', cost: 25, description: 'Uma cartinha feita com carinho.' },
  { key: 'vale_filme', label: '🎬 Vale filme', cost: 35, description: 'Kaiki escolhe um filme/série da vez.' },
  { key: 'vale_roblox', label: '🎮 Vale Roblox', cost: 40, description: 'Uma gameplay de Roblox garantida.' },
  { key: 'vale_carinho', label: '💙 Vale carinho', cost: 50, description: 'Vale carinho ilimitado e risadinhas.' },
];

function getProfile() {
  return db.prepare('SELECT * FROM couple_profile WHERE id = 1').get();
}

function addLoveNote(text) {
  return db.prepare('INSERT INTO love_notes (text) VALUES (?)').run(text);
}

function getRandomLoveNote() {
  return db.prepare('SELECT * FROM love_notes ORDER BY RANDOM() LIMIT 1').get();
}

function addMemory(title, description, date) {
  return db.prepare('INSERT INTO memories (title, description, memory_date) VALUES (?, ?, ?)').run(title, description, date);
}

function addMovie(name, type, platform, triviaRating, kaikiRating, comment) {
  return db.prepare(`
    INSERT INTO movies (name, type, platform, trivia_rating, kaiki_rating, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, type, platform, triviaRating, kaikiRating, comment);
}

function setPlaylist(link) {
  return db.prepare(`
    INSERT INTO playlist (id, link, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET link = excluded.link, updated_at = CURRENT_TIMESTAMP
  `).run(link);
}

function getPlaylist() {
  return db.prepare('SELECT * FROM playlist WHERE id = 1').get();
}

function getCoins() {
  return db.prepare('SELECT balance FROM coins WHERE id = 1').get()?.balance ?? 0;
}

function addCoins(quantity) {
  db.prepare('UPDATE coins SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(quantity);
  return getCoins();
}

function spendCoins(quantity) {
  const current = getCoins();
  if (current < quantity) return { ok: false, balance: current };
  db.prepare('UPDATE coins SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(quantity);
  return { ok: true, balance: getCoins() };
}

function startStudySession() {
  const open = db.prepare('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1').get();
  if (open) return { created: false, session: open };
  const info = db.prepare('INSERT INTO study_sessions (started_at) VALUES (CURRENT_TIMESTAMP)').run();
  return { created: true, session: db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(info.lastInsertRowid) };
}

function finishStudySession() {
  const session = db.prepare('SELECT * FROM study_sessions WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1').get();
  if (!session) return null;

  const startedAt = new Date(`${session.started_at}Z`);
  const minutes = Math.max(1, Math.floor((Date.now() - startedAt.getTime()) / 60000));
  const coinsAwarded = Math.max(1, Math.floor(minutes / 10));

  db.prepare(`
    UPDATE study_sessions
    SET ended_at = CURRENT_TIMESTAMP, minutes = ?, coins_awarded = ?
    WHERE id = ?
  `).run(minutes, coinsAwarded, session.id);
  addCoins(coinsAwarded);

  return { ...session, minutes, coinsAwarded, balance: getCoins() };
}

function buyGift(key) {
  const item = giftsCatalog.find((gift) => gift.key === key);
  if (!item) return { ok: false, reason: 'not_found' };
  const purchase = spendCoins(item.cost);
  if (!purchase.ok) return { ok: false, reason: 'no_coins', item, balance: purchase.balance };
  db.prepare('INSERT INTO gifts (item, cost) VALUES (?, ?)').run(item.label, item.cost);
  return { ok: true, item, balance: purchase.balance };
}

module.exports = {
  giftsCatalog,
  getProfile,
  addLoveNote,
  getRandomLoveNote,
  addMemory,
  addMovie,
  setPlaylist,
  getPlaylist,
  getCoins,
  addCoins,
  startStudySession,
  finishStudySession,
  buyGift,
};
