const { SlashCommandBuilder } = require('discord.js');
const { addMemory } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { publishDiaryEmbed } = require('../utils/channels');
const { normalizeImageUrl } = require('../utils/images');
const { getImageAttachmentUrl } = require('../utils/images');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memoria')
    .setDescription('Guarda memórias do casal.')
    .addSubcommand((subcommand) => subcommand
      .setName('adicionar')
      .setDescription('Salva uma memória do casal.')
      .addStringOption((option) => option.setName('titulo').setDescription('Título da memória.').setRequired(true))
      .addStringOption((option) => option.setName('descricao').setDescription('Descrição da memória.').setRequired(true))
      .addStringOption((option) => option.setName('data').setDescription('Data da memória. Ex: 2026-06-01 ou 05/06/2026.').setRequired(true))
      .addAttachmentOption((option) => option.setName('imagem').setDescription('Imagem opcional da memória.').setRequired(false))),
  async execute(interaction) {
    const image = interaction.options.getAttachment('imagem');
    const imageUrl = image ? getImageAttachmentUrl(image) : null;

    if (image && !imageUrl) {
      await respond(interaction, { content: 'A imagem precisa ser um arquivo PNG, JPG, GIF ou WEBP.', ephemeral: true });
      return;
    }

    const title = interaction.options.getString('titulo', true);
    const description = interaction.options.getString('descricao', true);
    const memoryDate = interaction.options.getString('data', true);

    await addMemory(title, description, memoryDate, imageUrl);

    const embedPayload = {
      title: 'Memória salva',
      description: imageUrl ? 'Essa memória foi guardada com imagem no mural do Momozin.' : getText('memoria_saved', 'Essa memória foi colocada no mural azul do Momozin.'),
      image: imageUrl || undefined,
    };
    await respond(interaction, { embeds: [momozinEmbed(embedPayload)] });
    await publishDiaryEmbed(interaction, {
      title: `Memória registrada: ${title}`,
      description: `Data: ${memoryDate}

${description}`,
      image: imageUrl || getAssetPublicUrl('memories_banner'),
    }, 'memorias');
  },
};
