const emojiConfig = require('../../config/emojis.json');

const CUSTOM_EMOJI_NAME_PATTERN = /^[A-Za-z0-9_]{2,32}$/;
const DISCORD_ID_PATTERN = /^\d{17,20}$/;

function getEmojiDefinition(category, key) {
  return emojiConfig[category]?.[key] || null;
}

function hasValidCustomEmoji(definition) {
  return Boolean(
    definition
    && typeof definition.name === 'string'
    && CUSTOM_EMOJI_NAME_PATTERN.test(definition.name)
    && typeof definition.id === 'string'
    && DISCORD_ID_PATTERN.test(definition.id),
  );
}

function emoji(category, key) {
  const definition = getEmojiDefinition(category, key);
  if (!definition) return '';
  if (hasValidCustomEmoji(definition)) {
    return `<${definition.animated ? 'a' : ''}:${definition.name}:${definition.id}>`;
  }
  return definition.fallback || '';
}

function withEmoji(category, key, text) {
  const value = emoji(category, key);
  return value ? `${value} ${text}` : text;
}

function buttonEmoji(category, key) {
  const definition = getEmojiDefinition(category, key);
  if (!definition) return undefined;
  if (hasValidCustomEmoji(definition)) {
    return { id: definition.id, name: definition.name, animated: Boolean(definition.animated) };
  }
  return definition.fallback || undefined;
}

function listConfiguredEmojis() {
  return Object.entries(emojiConfig)
    .filter(([category]) => category !== 'available_server_emojis')
    .flatMap(([category, items]) => Object.entries(items).map(([key, definition]) => ({
      category,
      key,
      ...definition,
      rendered: emoji(category, key),
    })));
}

module.exports = { buttonEmoji, emoji, getEmojiDefinition, listConfiguredEmojis, withEmoji };
