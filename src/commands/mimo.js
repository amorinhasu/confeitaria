const { SlashCommandBuilder } = require('discord.js');
const { buyGift, giftsCatalog } = require('../database/repositories');
const { momozinEmbed } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mimo')
    .setDescription('Loja de mimos do casal.')
    .addSubcommand((subcommand) => subcommand
      .setName('loja')
      .setDescription('Mostra a loja de mimos.'))
    .addSubcommand((subcommand) => subcommand
      .setName('comprar')
      .setDescription('Compra um mimo usando MomoCoins.')
      .addStringOption((option) => {
        option.setName('item').setDescription('Item da loja.').setRequired(true);
        giftsCatalog.forEach((gift) => option.addChoices({ name: `${gift.label} (${gift.cost})`, value: gift.key }));
        return option;
      })),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'loja') {
      await interaction.reply({ embeds: [momozinEmbed({
        title: '🎁 Loja de Mimos',
        description: 'Troque MomoCoins por recompensas fofas, caóticas e aprovadas pelo departamento azul.',
        fields: giftsCatalog.map((gift) => ({ name: `${gift.label} — ${gift.cost} moedas`, value: gift.description, inline: false })),
      })] });
      return;
    }

    const key = interaction.options.getString('item', true);
    const result = await buyGift(key);

    if (!result.ok && result.reason === 'no_coins') {
      await interaction.reply({ content: `🎁 Ainda faltam MomoCoins para comprar ${result.item.label}. Saldo: ${result.balance}.`, ephemeral: true });
      return;
    }

    if (!result.ok) {
      await interaction.reply({ content: '🎁 Item não encontrado na lojinha.', ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [momozinEmbed({
      title: '🎁 Mimo comprado',
      description: `${result.item.label} resgatado com sucesso!`,
      fields: [{ name: 'Saldo restante', value: `${result.balance} MomoCoins`, inline: true }],
    })] });
  },
};
