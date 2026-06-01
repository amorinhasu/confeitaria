const { SlashCommandBuilder } = require('discord.js');
const { addCoins, getCoins } = require('../database/repositories');
const { momozinEmbed } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moedas')
    .setDescription('Gerencia MomoCoins do casal.')
    .addSubcommand((subcommand) => subcommand
      .setName('ver')
      .setDescription('Mostra as MomoCoins do casal.'))
    .addSubcommand((subcommand) => subcommand
      .setName('adicionar')
      .setDescription('Adiciona moedas manualmente.')
      .addIntegerOption((option) => option.setName('quantidade').setDescription('Quantidade de MomoCoins.').setRequired(true).setMinValue(1))
      .addStringOption((option) => option.setName('motivo').setDescription('Motivo do bônus.').setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'adicionar') {
      const quantity = interaction.options.getInteger('quantidade', true);
      const reason = interaction.options.getString('motivo', true);
      const balance = addCoins(quantity);
      await interaction.reply({ embeds: [momozinEmbed({
        title: '🪙 MomoCoins adicionadas',
        description: `+${quantity} MomoCoins por: ${reason}`,
        fields: [{ name: 'Saldo atual', value: `${balance} MomoCoins`, inline: true }],
      })] });
      return;
    }

    const balance = getCoins();
    await interaction.reply({ embeds: [momozinEmbed({ title: '🪙 Cofrinho Momozin', description: `Saldo atual: **${balance} MomoCoins**.` })] });
  },
};
