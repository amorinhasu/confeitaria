const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createAdminEmbed, createAdminRows } = require('../components/admin');
const { withEmoji } = require('../utils/emojis');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Abre a revisão administrativa do Momozin.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) => subcommand
      .setName('painel')
      .setDescription('Mostra o painel administrativo do Momozin.')),
  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await respond(interaction, { content: withEmoji('feedback', 'warning', 'Apenas administradores podem abrir esse painel.'), ephemeral: true });
      return;
    }

    await respond(interaction, { embeds: [await createAdminEmbed('sistema')], components: createAdminRows('sistema'), ephemeral: true });
  },
};
