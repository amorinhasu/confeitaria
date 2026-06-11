const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buttonEmoji } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');

const PUDINZINHO_ENTRY_CUSTOM_ID = 'entry:pudinzinho';
const PUDINZINHO_ENTRY_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1506484555664850995/1514461972182208633/Copia_de_Painel_20260610_235058_0000.png';

function createPudinzinhoEntryEmbed() {
  return momozinEmbed({
    title: 'Uma carta espera por você...',
    description: 'Algumas histórias começam com um simples clique. Quando estiver pronto, toque no botão abaixo e descubra o que a Trívia preparou para você.',
    image: PUDINZINHO_ENTRY_IMAGE_URL,
  });
}

function createPudinzinhoEntryRows() {
  const button = new ButtonBuilder()
    .setCustomId(PUDINZINHO_ENTRY_CUSTOM_ID)
    .setLabel('Virar Pudinzinho')
    .setStyle(ButtonStyle.Primary);
  const emojiValue = buttonEmoji('mimos', 'pudding') || '🍮';
  if (emojiValue) button.setEmoji(emojiValue);
  return [new ActionRowBuilder().addComponents(button)];
}

async function ensurePudinzinhoEntryMessage(client, channelId) {
  if (!channelId) return false;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased?.()) return false;

    const recentMessages = await channel.messages.fetch({ limit: 25 }).catch(() => null);
    const existingMessage = recentMessages?.find((message) => {
      if (message.author?.id !== client.user?.id) return false;
      return message.components?.some((row) => row.components?.some((component) => component.customId === PUDINZINHO_ENTRY_CUSTOM_ID));
    });

    if (existingMessage) return true;

    await channel.send({ embeds: [createPudinzinhoEntryEmbed()], components: createPudinzinhoEntryRows() });
    return true;
  } catch (error) {
    console.error('Erro ao publicar mensagem de entrada Pudinzinho:', error);
    return false;
  }
}

module.exports = {
  PUDINZINHO_ENTRY_CUSTOM_ID,
  createPudinzinhoEntryEmbed,
  createPudinzinhoEntryRows,
  ensurePudinzinhoEntryMessage,
};
