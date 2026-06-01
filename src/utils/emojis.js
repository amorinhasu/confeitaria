const emojiConfig = require('../../config/emojis.json');

function getEmojiDefinition(category, key) {
  return emojiConfig[category]?.[key] || null;
}

function emoji(category, key) {
  const definition = getEmojiDefinition(category, key);
  if (!definition) return '';
  if (definition.id && definition.name) {
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
  if (definition.id && definition.name) {
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
