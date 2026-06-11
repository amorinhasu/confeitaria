const { SlashCommandBuilder } = require('discord.js');
const { createManualHomeEmbed, createManualHomeRows } = require('../components/manual');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manual')
    .setDescription('Abre o manual visual do Momozin.'),
  async execute(interaction) {
    console.log('Manual aberto');
    await respond(interaction, { embeds: [createManualHomeEmbed()], components: createManualHomeRows() });
  },
};
