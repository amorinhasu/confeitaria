const { SlashCommandBuilder } = require('discord.js');
const { saveCoupleSetup } = require('../database/repositories');
const { withEmoji } = require('../utils/emojis');
const { respond } = require('../utils/interactions');
const { momozinEmbed } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura o cantinho privado da Trívia e do Kaiki.')
    .addSubcommand((subcommand) => subcommand
      .setName('casal')
      .setDescription('Registra os usuários principais do casal.')
      .addUserOption((option) => option.setName('trivia').setDescription('Usuária da Trívia.').setRequired(true))
      .addUserOption((option) => option.setName('kaiki').setDescription('Usuário do Kaiki.').setRequired(true))),
  async execute(interaction) {
    const trivia = interaction.options.getUser('trivia', true);
    const kaiki = interaction.options.getUser('kaiki', true);

    await saveCoupleSetup(trivia.id, kaiki.id);
    console.log('Casal registrado');

    await respond(interaction, { embeds: [momozinEmbed({
      title: withEmoji('perfil', 'couple', 'Casal registrado'),
      description: `O cantinho azul agora reconhece ${trivia} e ${kaiki} como os donos da confeitaria Momozin.`,
      fields: [
        { name: 'Trívia', value: `${trivia}`, inline: true },
        { name: 'Kaiki', value: `${kaiki}`, inline: true },
      ],
    })] });
  },
};
