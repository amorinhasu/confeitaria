const { SlashCommandBuilder } = require('discord.js');
const { addCoins, getCoins, getRecentCoinTransactions } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { publishDiaryEmbed } = require('../utils/channels');
const { formatCoinTransactions } = require('../utils/coins');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

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
      const balance = await addCoins(quantity, reason, 'manual_add');
      const embedPayload = {
        title: getText('coins_added_title', 'MomoCoins adicionadas'),
        description: `+${quantity} MomoCoins por: ${reason}`,
        image: getAssetPublicUrl('coins_banner'),
        fields: [{ name: getText('coins_balance_prefix', 'Saldo atual'), value: `${balance} MomoCoins`, inline: true }],
      };
      await respond(interaction, { embeds: [momozinEmbed(embedPayload)] });
      await publishDiaryEmbed(interaction, embedPayload);
      return;
    }

    const balance = await getCoins();
    const transactions = await getRecentCoinTransactions(5);
    await respond(interaction, { embeds: [momozinEmbed({
      title: 'Cofrinho Momozin',
      description: `${getText('coins_balance_prefix', 'Saldo atual')}: **${balance} MomoCoins**.`,
      fields: [{ name: 'Últimas movimentações', value: formatCoinTransactions(transactions), inline: false }],
    })] });
  },
};
