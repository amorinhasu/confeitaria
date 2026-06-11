const {
  adminUserId,
  cinemaChannelId,
  commandsChannelId,
  entryChannelId,
  estudosChannelId,
  memoriasChannelId,
  memoriesChannelId,
  mimosChannelId,
  playlistChannelId,
  recadosChannelId,
} = require('./config');
const { momozinEmbed } = require('./theme');

const CHANNEL_DESTINATIONS = {
  recados: { envName: 'RECADOS_CHANNEL_ID', id: recadosChannelId, label: 'Recados' },
  memorias: { envName: 'MEMORIAS_CHANNEL_ID', id: memoriasChannelId || memoriesChannelId, label: 'Memórias' },
  cine: { envName: 'CINEMA_CHANNEL_ID', id: cinemaChannelId, label: 'CineMomozin' },
  playlist: { envName: 'PLAYLIST_CHANNEL_ID', id: playlistChannelId, label: 'Playlist' },
  estudos: { envName: 'ESTUDOS_CHANNEL_ID', id: estudosChannelId, label: 'Estudos' },
  mimos: { envName: 'MIMOS_CHANNEL_ID', id: mimosChannelId, label: 'Mimos' },
};

function isAdminInteraction(interaction) {
  return Boolean(adminUserId && interaction.user?.id === adminUserId);
}

function isPudinzinhoEntryInteraction(interaction) {
  return interaction.customId === 'entry:pudinzinho' || interaction.customId === 'panel:perfil:pudinzinho';
}

function isCommandsChannel(interaction) {
  if (!commandsChannelId) return true;
  return interaction.channelId === commandsChannelId || interaction.channel?.id === commandsChannelId;
}

function isEntryChannel(interaction) {
  if (!entryChannelId) return false;
  return interaction.channelId === entryChannelId || interaction.channel?.id === entryChannelId;
}

async function enforceCommandsChannel(interaction) {
  if (isCommandsChannel(interaction) || isAdminInteraction(interaction)) return true;
  if (interaction.isButton?.() && isPudinzinhoEntryInteraction(interaction) && isEntryChannel(interaction)) return true;

  const content = `O Momozin deve ser usado no canal <#${commandsChannelId}>.`;
  if (interaction.deferred || interaction.replied) await interaction.followUp({ content, ephemeral: true });
  else await interaction.reply({ content, ephemeral: true });
  return false;
}

async function getConfiguredChannel(guild, destinationKey) {
  const destination = CHANNEL_DESTINATIONS[destinationKey] || CHANNEL_DESTINATIONS.memorias;
  if (!guild || !destination.id) return null;

  try {
    const channel = await guild.channels.fetch(destination.id);
    if (!channel?.isTextBased?.()) return null;
    return channel;
  } catch (error) {
    console.error(`Erro ao buscar ${destination.envName}:`, error);
    return null;
  }
}

async function getMemoriesChannel(guild) {
  return getConfiguredChannel(guild, 'memorias');
}

async function publishToConfiguredChannel(interaction, destinationKey, payload) {
  const channel = await getConfiguredChannel(interaction.guild, destinationKey);
  if (!channel) return false;

  try {
    await channel.send(payload);
    return true;
  } catch (error) {
    const destination = CHANNEL_DESTINATIONS[destinationKey] || CHANNEL_DESTINATIONS.memorias;
    console.error(`Erro ao publicar em ${destination.envName}:`, error);
    return false;
  }
}

async function publishToMemoriesChannel(interaction, payload) {
  return publishToConfiguredChannel(interaction, 'memorias', payload);
}

async function publishDiaryEmbed(interaction, { title, description, fields = [], image }, destinationKey = 'memorias') {
  return publishToConfiguredChannel(interaction, destinationKey, { embeds: [momozinEmbed({ title, description, fields, image })] });
}

module.exports = {
  CHANNEL_DESTINATIONS,
  enforceCommandsChannel,
  getConfiguredChannel,
  getMemoriesChannel,
  isCommandsChannel,
  isEntryChannel,
  publishDiaryEmbed,
  publishToConfiguredChannel,
  publishToMemoriesChannel,
};
