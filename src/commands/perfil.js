const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../database/repositories');
const { daysSince } = require('../utils/date');
const { momozinEmbed } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostra o perfil do casal Trívia e Kaiki.'),
  async execute(interaction) {
    const profile = await getProfile();
    const days = daysSince(profile.start_date);
    const achievements = profile.achievements.split(';').map((item) => `🏆 ${item.trim()}`).join('\n');

    const embed = momozinEmbed({
      title: '💙 Perfil do casal',
      description: 'O arquivo oficial, fofo e de madrugada do casal Momozin.',
      fields: [
        { name: 'Casal', value: `✨ ${profile.trivia_name} + ${profile.kaiki_name}`, inline: true },
        { name: 'Apelidos', value: profile.nicknames, inline: true },
        { name: 'Contador desde o dia 05', value: `${days} dia(s) desde ${profile.start_date}`, inline: false },
        { name: 'Status', value: profile.status, inline: false },
        { name: 'Conquistas', value: achievements, inline: false },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
