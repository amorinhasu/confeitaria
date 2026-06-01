const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { daysSince } = require('../utils/date');
const { emoji, withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostra o perfil do casal Trívia e Kaiki.'),
  async execute(interaction) {
    const profile = await getProfile();
    const days = daysSince(profile.start_date);
    const achievements = profile.achievements
      .split(';')
      .map((item) => `${emoji('perfil', 'achievement')} ${item.trim()}`)
      .join('\n');

    const embed = momozinEmbed({
      title: withEmoji('perfil', 'heart', getText('profile_title', 'Perfil do casal')),
      description: getText('profile_description', 'O arquivo oficial, fofo e de madrugada do casal Momozin.'),
      image: getAssetPublicUrl('profile_banner'),
      fields: [
        { name: 'Casal', value: `${emoji('perfil', 'couple')} ${profile.trivia_name} + ${profile.kaiki_name}`, inline: true },
        { name: 'Apelidos', value: profile.nicknames, inline: true },
        { name: 'Contador desde o dia 05', value: `${days} dia(s) desde ${profile.start_date}`, inline: false },
        { name: 'Status', value: withEmoji('perfil', 'heart', profile.status), inline: false },
        { name: 'Conquistas', value: achievements, inline: false },
      ],
    });

    await respond(interaction, { embeds: [embed] });
  },
};
