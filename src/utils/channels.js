const { commandsChannelId, memoriesChannelId, adminUserId } = require('./config');
const { momozinEmbed } = require('./theme');

function isAdminInteraction(interaction) {
  return Boolean(adminUserId && interaction.user?.id === adminUserId);
}

function isCommandsChannel(interaction) {
  if (!commandsChannelId) return true;
  return interaction.channelId === commandsChannelId || interaction.channel?.id === commandsChannelId;
}

async function enforceCommandsChannel(interaction) {
  if (isCommandsChannel(interaction) || isAdminInteraction(interaction)) return true;

  const content = `O Momozin deve ser usado no canal <#${commandsChannelId}>.`;
  if (interaction.deferred || interaction.replied) await interaction.followUp({ content, ephemeral: true });
  else await interaction.reply({ content, ephemeral: true });
  return false;
}

async function getMemoriesChannel(guild) {
  if (!guild || !memoriesChannelId) return null;

  try {
    const channel = await guild.channels.fetch(memoriesChannelId);
    if (!channel?.isTextBased?.()) return null;
    return channel;
  } catch (error) {
    console.error('Erro ao buscar MEMORIES_CHANNEL_ID:', error);
    return null;
  }
}

async function publishToMemoriesChannel(interaction, payload) {
  const channel = await getMemoriesChannel(interaction.guild);
  if (!channel) return false;

  try {
    await channel.send(payload);
    return true;
  } catch (error) {
    console.error('Erro ao publicar no canal de memórias:', error);
    return false;
  }
}

async function publishDiaryEmbed(interaction, { title, description, fields = [], image }) {
  return publishToMemoriesChannel(interaction, { embeds: [momozinEmbed({ title, description, fields, image })] });
}

module.exports = {
  enforceCommandsChannel,
  getMemoriesChannel,
  isCommandsChannel,
  publishDiaryEmbed,
  publishToMemoriesChannel,
};
