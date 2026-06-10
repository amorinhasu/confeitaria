const { SlashCommandBuilder } = require('discord.js');
const { buyGift, giftsCatalog } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { publishDiaryEmbed } = require('../utils/channels');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

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
        giftsCatalog.forEach((gift) => option.addChoices({ name: `${gift.labelText} (${gift.cost})`, value: gift.key }));
        return option;
      })),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'loja') {
      await respond(interaction, { embeds: [momozinEmbed({
        title: 'Loja de Mimos',
        description: getText('gifts_shop_description', 'Troque MomoCoins por recompensas fofas, caóticas e aprovadas pelo departamento azul.'),
        fields: giftsCatalog.map((gift) => ({ name: `${gift.label} — ${gift.cost} moedas`, value: gift.description, inline: false })),
      })] });
      return;
    }

    const key = interaction.options.getString('item', true);
    const result = await buyGift(key);

    if (!result.ok && result.reason === 'no_coins') {
      await respond(interaction, { content: `${withEmoji('mimos', 'gift', getText('gift_no_coins', 'Ainda faltam MomoCoins para comprar este mimo.'))} Saldo: ${result.balance}.`, ephemeral: true });
      return;
    }

    if (!result.ok) {
      await respond(interaction, { content: withEmoji('mimos', 'gift', getText('gift_not_found', 'Item não encontrado na lojinha.')), ephemeral: true });
      return;
    }

    const embedPayload = {
      title: 'Mimo comprado',
      description: `${result.item.labelText} ${getText('gift_bought', 'resgatado com sucesso!')}`,
      image: getAssetPublicUrl('gifts_banner'),
      fields: [{ name: 'Saldo restante', value: `${result.balance} MomoCoins`, inline: true }],
    };
    await respond(interaction, { embeds: [momozinEmbed(embedPayload)] });
    await publishDiaryEmbed(interaction, embedPayload);
  },
};
