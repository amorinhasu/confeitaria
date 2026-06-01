const emojiConfig = require('../../config/emojis.json');

const CUSTOM_EMOJI_NAME_PATTERN = /^[A-Za-z0-9_]{2,32}$/;
const DISCORD_ID_PATTERN = /^\d{17,20}$/;
const RAW_COLON_EMOJI_PATTERN = /^:[A-Za-z0-9_]+:$/;

let availableCustomEmojiIds = null;

function getEmojiDefinition(category, key) {
  return emojiConfig[category]?.[key] || null;
}

function normalizeId(id) {
  if (typeof id === 'string') return id;
  if (typeof id === 'number' || typeof id === 'bigint') return String(id);
  return null;
}

function safeFallback(definition) {
  const fallback = definition?.fallback;
  if (typeof fallback !== 'string' || RAW_COLON_EMOJI_PATTERN.test(fallback)) return '';
  return fallback;
}

function hasValidCustomEmoji(definition) {
  const id = normalizeId(definition?.id);
  return Boolean(
    definition
    && typeof definition.name === 'string'
    && CUSTOM_EMOJI_NAME_PATTERN.test(definition.name)
    && id
    && DISCORD_ID_PATTERN.test(id),
  );
}

function isCustomEmojiAvailable(definition) {
  if (!hasValidCustomEmoji(definition)) return false;
  if (availableCustomEmojiIds === null) return true;
  return availableCustomEmojiIds.has(normalizeId(definition.id));
}

function renderCustomEmoji(definition) {
  const id = normalizeId(definition.id);
  return `<${definition.animated ? 'a' : ''}:${definition.name}:${id}>`;
}

function emoji(category, key) {
  const definition = getEmojiDefinition(category, key);
  if (!definition) return '';
  if (isCustomEmojiAvailable(definition)) return renderCustomEmoji(definition);
  return safeFallback(definition);
}

function withEmoji(category, key, text) {
  const value = emoji(category, key);
  return value ? `${value} ${text}` : text;
}

function buttonEmoji(category, key) {
  const definition = getEmojiDefinition(category, key);
  if (!definition) return undefined;
  if (isCustomEmojiAvailable(definition)) {
    return { id: normalizeId(definition.id), name: definition.name, animated: Boolean(definition.animated) };
  }
  return safeFallback(definition) || undefined;
}

function configureAvailableEmojis(emojis = []) {
  availableCustomEmojiIds = new Set(Array.from(emojis, (item) => normalizeId(item?.id)).filter(Boolean));
  const unavailable = listConfiguredEmojis().filter((item) => hasValidCustomEmoji(item) && !availableCustomEmojiIds.has(normalizeId(item.id)));

  if (unavailable.length > 0) {
    console.warn(`Emojis customizados indisponíveis; usando fallback Unicode para ${unavailable.length} configuração(ões): ${unavailable.map((item) => `${item.category}.${item.key}`).join(', ')}`);
  }

  return { available: availableCustomEmojiIds.size, unavailable };
}

function resetEmojiAvailability() {
  availableCustomEmojiIds = null;
}

function listConfiguredEmojis() {
  return Object.entries(emojiConfig)
    .filter(([category]) => category !== 'available_server_emojis')
    .flatMap(([category, items]) => Object.entries(items).map(([key, definition]) => ({
      category,
      key,
      ...definition,
      id: normalizeId(definition?.id),
      rendered: emoji(category, key),
      valid: hasValidCustomEmoji(definition),
      available: isCustomEmojiAvailable(definition),
    })));
}

module.exports = {
  buttonEmoji,
  configureAvailableEmojis,
  emoji,
  getEmojiDefinition,
  hasValidCustomEmoji,
  isCustomEmojiAvailable,
  listConfiguredEmojis,
  resetEmojiAvailability,
  withEmoji,
};
