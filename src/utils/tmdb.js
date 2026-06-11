const { tmdbApiKey } = require('./config');

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const pendingTmdbChoices = new Map();
const PENDING_TTL_MS = 10 * 60 * 1000;
const TMDB_TIMEOUT_MS = 4000;

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

function normalizeTmdbResult(result, fallbackMediaType = result.media_type) {
  const mediaType = result.media_type || fallbackMediaType;
  return {
    id: result.id,
    mediaType,
    type: mediaTypeLabel(mediaType),
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?${params.toString()}`, { signal: controller.signal });
    if (!response.ok) return { ok: false, reason: `http_${response.status}`, results: [] };

    const data = await response.json();
    const results = (data.results || [])
      .filter((result) => result.media_type === 'movie' || result.media_type === 'tv')
      .slice(0, limit)
      .map((result) => normalizeTmdbResult(result));

    return { ok: true, results };
  } catch (error) {
    console.error('[TMDB] Erro ao buscar títulos:', error);
    return { ok: false, reason: error.name === 'AbortError' ? 'timeout' : 'request_failed', results: [] };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTmdbPath(path, params = {}) {
  const query = new URLSearchParams({
    api_key: tmdbApiKey,
    language: 'pt-BR',
    ...params,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.themoviedb.org/3${path}?${query.toString()}`, { signal: controller.signal });
    if (!response.ok) return { ok: false, reason: `http_${response.status}`, results: [] };
    const data = await response.json();
    return { ok: true, results: data.results || [] };
  } catch (error) {
    console.error('[TMDB] Erro ao buscar recomendações:', error);
    return { ok: false, reason: error.name === 'AbortError' ? 'timeout' : 'request_failed', results: [] };
  } finally {
    clearTimeout(timeout);
  }
}

function recommendationSources(kind = 'all') {
  const normalizedKind = String(kind || 'all').toLowerCase();
  const movieSources = [
    { path: '/trending/movie/week', mediaType: 'movie' },
    { path: '/movie/popular', mediaType: 'movie' },
    { path: '/movie/now_playing', mediaType: 'movie' },
    { path: '/discover/movie', mediaType: 'movie', params: { sort_by: 'popularity.desc', include_adult: 'false', 'primary_release_date.gte': new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10) } },
  ];
  const tvSources = [
    { path: '/trending/tv/week', mediaType: 'tv' },
    { path: '/tv/popular', mediaType: 'tv' },
    { path: '/tv/on_the_air', mediaType: 'tv' },
    { path: '/discover/tv', mediaType: 'tv', params: { sort_by: 'popularity.desc', 'first_air_date.gte': new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10) } },
  ];

  if (normalizedKind === 'movie') return movieSources;
  if (normalizedKind === 'series' || normalizedKind === 'tv') return tvSources;
  return [
    { path: '/trending/all/week' },
    ...movieSources,
    ...tvSources,
  ];
}

function dedupeTmdbResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const key = `${result.mediaType}:${result.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getTmdbRecommendation(kind = 'all') {
  if (!isTmdbConfigured()) return { ok: false, reason: 'not_configured', recommendation: null };

  const results = [];
  const sources = recommendationSources(kind);

  for (const source of sources) {
    const response = await fetchTmdbPath(source.path, source.params || {});
    if (!response.ok) continue;

    for (const result of response.results) {
      const mediaType = result.media_type || source.mediaType;
      if (mediaType !== 'movie' && mediaType !== 'tv') continue;
      results.push(normalizeTmdbResult({ ...result, media_type: mediaType }, mediaType));
    }
  }

  const recommendations = dedupeTmdbResults(results).filter((result) => result.title && result.overview);
  if (!recommendations.length) return { ok: false, reason: 'empty', recommendation: null };

  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
  return { ok: true, recommendation };
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
  getTmdbRecommendation,
  isTmdbConfigured,
  searchTmdbTitles,
  tmdbSelectDescription,
  truncate,
};
