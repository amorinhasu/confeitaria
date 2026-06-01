const { SlashCommandBuilder } = require('discord.js');
const { getProfile } = require('../database/repositories');
const { profileEmbed } = require('../utils/embeds');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostra o perfil do casal Trívia e Kaiki.'),
  async execute(interaction) {
    const profile = await getProfile();
    await respond(interaction, { embeds: [profileEmbed(profile)] });
  },
};
