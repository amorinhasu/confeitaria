const { tmdbApiKey } = require('./config');

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const pendingTmdbChoices = new Map();
const PENDING_TTL_MS = 10 * 60 * 1000;

function isTmdbConfigured() {
  return Boolean(tmdbApiKey);
}

function truncate(value, maxLength) {
  if (!value) return '';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

function mediaTypeLabel(mediaType) {
  if (mediaType === 'movie') return 'filme';
  if (mediaType === 'tv') return 'série';
  return 'cine';
}

function resultTitle(result) {
  return result.title || result.name || 'Sem título';
}

function resultDate(result) {
  return result.release_date || result.first_air_date || '';
}

function resultYear(result) {
  const date = resultDate(result);
  return date ? date.slice(0, 4) : 'ano não informado';
}

function resultPosterUrl(result) {
  return result.poster_path ? `${TMDB_IMAGE_BASE_URL}${result.poster_path}` : null;
}

function normalizeTmdbResult(result) {
  return {
    id: result.id,
    mediaType: result.media_type,
    type: mediaTypeLabel(result.media_type),
    title: resultTitle(result),
    year: resultYear(result),
    overview: result.overview || 'Sem sinopse cadastrada no TMDB.',
    voteAverage: typeof result.vote_average === 'number' ? Number(result.vote_average.toFixed(1)) : null,
    posterUrl: resultPosterUrl(result),
  };
}

async function searchTmdbTitles(query, limit = 5) {
  if (!isTmdbConfigured()) return { ok: false, reason: 'not_configured', results: [] };
  const params = new URLSearchParams({
    api_key: tmdbApiKey,
    query,
    language: 'pt-BR',
    include_adult: 'false',
  });

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?${params.toString()}`);
    if (!response.ok) return { ok: false, reason: `http_${response.status}`, results: [] };

    const data = await response.json();
    const results = (data.results || [])
      .filter((result) => result.media_type === 'movie' || result.media_type === 'tv')
      .slice(0, limit)
      .map(normalizeTmdbResult);

    return { ok: true, results };
  } catch (error) {
    console.error('[TMDB] Erro ao buscar títulos:', error);
    return { ok: false, reason: 'request_failed', results: [] };
  }
}

function cleanupPendingTmdbChoices(now = Date.now()) {
  for (const [token, pending] of pendingTmdbChoices.entries()) {
    if (pending.expiresAt <= now) pendingTmdbChoices.delete(token);
  }
}

function createPendingTmdbChoice(data) {
  cleanupPendingTmdbChoices();
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  pendingTmdbChoices.set(token, { ...data, expiresAt: Date.now() + PENDING_TTL_MS });
  return token;
}

function consumePendingTmdbChoice(token) {
  cleanupPendingTmdbChoices();
  const pending = pendingTmdbChoices.get(token);
  if (!pending) return null;
  pendingTmdbChoices.delete(token);
  return pending;
}

function createTmdbComment(selection) {
  const note = selection.voteAverage === null ? 'sem nota' : `${selection.voteAverage}/10`;
  return truncate(`Registrado pelo painel do Momozin.\nTMDB: ${selection.overview}\nNota TMDB: ${note}`, 900);
}

function tmdbSelectDescription(selection) {
  const note = selection.voteAverage === null ? 'sem nota' : `${selection.voteAverage}/10`;
  return truncate(`${selection.type} • ${selection.year} • TMDB ${note}`, 100);
}

module.exports = {
  createPendingTmdbChoice,
  createTmdbComment,
  consumePendingTmdbChoice,
  isTmdbConfigured,
  searchTmdbTitles,
  tmdbSelectDescription,
  truncate,
};
