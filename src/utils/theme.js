const { EmbedBuilder } = require('discord.js');

const COLORS = {
  blue: 0x6ecbff,
  darkBlue: 0x2f80ed,
};

function stripEmbedEmojis(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<a?:[A-Za-z0-9_]+:\d+>/g, '')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .trim();
}

function sanitizeFields(fields) {
  return fields.map((field) => ({
    ...field,
    name: stripEmbedEmojis(field.name),
    value: stripEmbedEmojis(field.value),
  }));
}

function momozinEmbed({ title, description, fields = [], footer, color = COLORS.blue, image, thumbnail }) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(stripEmbedEmojis(title))
    .setDescription(stripEmbedEmojis(description))
    .setTimestamp();

  if (fields.length > 0) embed.addFields(sanitizeFields(fields));
  if (image) embed.setImage(image);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (footer) embed.setFooter({ text: stripEmbedEmojis(footer) });

  return embed;
}

module.exports = { COLORS, momozinEmbed, stripEmbedEmojis };
