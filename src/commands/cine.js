const { SlashCommandBuilder } = require('discord.js');
const { addMovie } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cine')
    .setDescription('Gerencia o CineMomozin.')
    .addSubcommand((subcommand) => subcommand
      .setName('adicionar')
      .setDescription('Salva um filme ou série assistida.')
      .addStringOption((option) => option.setName('nome').setDescription('Nome do filme ou série.').setRequired(true))
      .addStringOption((option) => option.setName('tipo').setDescription('Tipo: filme, série, anime...').setRequired(true))
      .addStringOption((option) => option.setName('plataforma').setDescription('Onde assistiram.').setRequired(true))
      .addNumberOption((option) => option.setName('nota_trivia').setDescription('Nota da Trívia.').setRequired(true).setMinValue(0).setMaxValue(10))
      .addNumberOption((option) => option.setName('nota_kaiki').setDescription('Nota do Kaiki.').setRequired(true).setMinValue(0).setMaxValue(10))
      .addStringOption((option) => option.setName('comentario').setDescription('Comentário do casal.').setRequired(true))),
  async execute(interaction) {
    const name = interaction.options.getString('nome', true);
    const type = interaction.options.getString('tipo', true);
    const platform = interaction.options.getString('plataforma', true);
    const triviaRating = interaction.options.getNumber('nota_trivia', true);
    const kaikiRating = interaction.options.getNumber('nota_kaiki', true);
    const comment = interaction.options.getString('comentario', true);

    await addMovie(name, type, platform, triviaRating, kaikiRating, comment);

    await respond(interaction, { embeds: [momozinEmbed({
      title: withEmoji('cine', 'movie', 'CineMomozin atualizado'),
      description: `${name} ${getText('cine_saved', 'entrou para a listinha azul do casal.')}`,
      image: getAssetPublicUrl('cine_banner'),
      fields: [
        { name: 'Tipo', value: type, inline: true },
        { name: 'Plataforma', value: platform, inline: true },
        { name: 'Notas', value: `Trívia: ${triviaRating}/10\nKaiki: ${kaikiRating}/10`, inline: true },
        { name: 'Comentário', value: comment, inline: false },
      ],
    })] });
  },
};
