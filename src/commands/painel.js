const { SlashCommandBuilder } = require('discord.js');
const { createPanelEmbed, createPanelRows } = require('../components/panel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Envia o painel principal azulzinho do Momozin.'),
  async execute(interaction) {
    await interaction.reply({ embeds: [createPanelEmbed()], components: createPanelRows() });
  },
};
