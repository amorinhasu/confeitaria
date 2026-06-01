const { SlashCommandBuilder } = require('discord.js');
const { addMemory } = require('../database/repositories');
const { momozinEmbed } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memoria')
    .setDescription('Guarda memórias do casal.')
    .addSubcommand((subcommand) => subcommand
      .setName('adicionar')
      .setDescription('Salva uma memória do casal.')
      .addStringOption((option) => option.setName('titulo').setDescription('Título da memória.').setRequired(true))
      .addStringOption((option) => option.setName('descricao').setDescription('Descrição da memória.').setRequired(true))
      .addStringOption((option) => option.setName('data').setDescription('Data da memória. Ex: 2026-06-01 ou 05/06/2026.').setRequired(true))),
  async execute(interaction) {
    await addMemory(
      interaction.options.getString('titulo', true),
      interaction.options.getString('descricao', true),
      interaction.options.getString('data', true),
    );

    await interaction.reply({ embeds: [momozinEmbed({ title: '📸 Memória salva', description: 'Essa memória foi colocada no mural azul do Momozin.' })] });
  },
};
