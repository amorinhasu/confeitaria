const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createAdminEmbed, createAdminRows } = require('../components/admin');
const { isAdminUser } = require('../utils/authorization');
const { withEmoji } = require('../utils/emojis');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Abre a revisão administrativa do Momozin.')
    .addSubcommand((subcommand) => subcommand
      .setName('painel')
      .setDescription('Mostra o painel administrativo do Momozin.'))
    .addSubcommand((subcommand) => subcommand
      .setName('auditoria')
      .setDescription('Mostra a auditoria completa do Momozin.')),
  async execute(interaction) {
    if (!isAdminUser(interaction.user?.id) && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await respond(interaction, { content: withEmoji('feedback', 'warning', 'Apenas administradores podem abrir esse painel.'), ephemeral: true });
      return;
    }

    const tab = interaction.options.getSubcommand() === 'auditoria' ? 'auditoria' : 'sistema';
    await respond(interaction, { embeds: [await createAdminEmbed(tab, interaction)], components: createAdminRows(tab), ephemeral: true });
  },
};
