const { SlashCommandBuilder } = require('discord.js');
const { getPlaylist, setPlaylist } = require('../database/repositories');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Gerencia o link manual da playlist do casal.')
    .addSubcommand((subcommand) => subcommand
      .setName('definir')
      .setDescription('Salva o link da playlist do casal.')
      .addStringOption((option) => option.setName('link').setDescription('Link da playlist.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('ver')
      .setDescription('Mostra o link salvo da playlist.')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'definir') {
      const link = interaction.options.getString('link', true);
      await setPlaylist(link);
      await respond(interaction, { embeds: [momozinEmbed({ title: withEmoji('playlist', 'music', 'Playlist salva'), description: getText('playlist_saved', 'Link guardado. Sem Spotify API por enquanto, só o aconchego manual.') })] });
      return;
    }

    const playlist = await getPlaylist();
    if (!playlist) {
      await respond(interaction, { content: withEmoji('playlist', 'music', getText('playlist_empty', 'Nenhuma playlist salva ainda. Use `/playlist definir`.')), ephemeral: true });
      return;
    }

    await respond(interaction, { embeds: [momozinEmbed({ title: withEmoji('playlist', 'music', 'Playlist do casal'), description: playlist.link })] });
  },
};
