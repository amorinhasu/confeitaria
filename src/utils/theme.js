const { EmbedBuilder } = require('discord.js');

const COLORS = {
  blue: 0x6ecbff,
  darkBlue: 0x2f80ed,
};

function momozinEmbed({ title, description, fields = [], footer, color = COLORS.blue }) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (fields.length > 0) embed.addFields(fields);
  if (footer) embed.setFooter({ text: footer });

  return embed;
}

module.exports = { COLORS, momozinEmbed };
