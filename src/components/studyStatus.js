const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getStudyStats } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { getConfiguredChannel } = require('../utils/channels');
const { formatDurationAllowZero } = require('../utils/date');
const { buttonEmoji } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');

const STUDY_STATUS_CUSTOM_IDS = new Set([
  'panel:estudos:start',
  'panel:estudos:pause_water',
  'panel:estudos:pause_grude',
  'panel:estudos:resume',
  'panel:estudos:finish',
  'panel:estudos:time',
  'panel:estudos:stats',
]);

let cachedStudyStatusMessageId = null;

function makeStudyButton(customId, label, category, key, style = ButtonStyle.Secondary) {
  const button = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  const emoji = buttonEmoji(category, key);
  if (emoji) button.setEmoji(emoji);
  return button;
}

function pauseKindLabel(kind) {
  if (kind === 'grude') return 'Grude';
  if (kind === 'water') return 'Água';
  return 'Não pausado';
}

function studyStatusPayload(stats) {
  const open = stats.open;

  if (!open) {
    return {
      embeds: [momozinEmbed({
        title: 'Foco do Casal',
        description: 'Status: **Nenhuma sessão ativa**\n\nQuando quiserem começar, é só iniciar uma sessão de estudo por aqui.',
        image: getAssetPublicUrl('study_banner'),
      })],
      components: [new ActionRowBuilder().addComponents(
        makeStudyButton('panel:estudos:start', 'Iniciar estudo', 'estudos', 'book', ButtonStyle.Primary),
        makeStudyButton('panel:estudos:stats', 'Ver progresso', 'momocoins', 'coin'),
      )],
    };
  }

  const startedAt = new Date(`${open.started_at}Z`).getTime();
  const totalMs = Math.max(0, Date.now() - startedAt);
  const pausedMs = Math.max(0, (stats.openPausedSeconds || 0) * 1000);
  const effectiveMs = Math.max(0, totalMs - pausedMs);
  const isPaused = Boolean(open.pause_started_at);

  return {
    embeds: [momozinEmbed({
      title: 'Foco do Casal',
      description: `Status: **Em estudo**\n${isPaused ? 'A sessão está pausada agora.' : 'A sessão está contando o foco do casal.'}`,
      image: getAssetPublicUrl('study_banner'),
      fields: [
        { name: 'Tema', value: open.subject || 'Sem tema definido', inline: false },
        { name: 'Tempo atual da sessão', value: formatDurationAllowZero(totalMs), inline: true },
        { name: 'Tempo efetivo', value: formatDurationAllowZero(effectiveMs), inline: true },
        { name: 'Tempo total', value: formatDurationAllowZero(totalMs), inline: true },
        { name: 'Pausado?', value: isPaused ? 'Sim' : 'Não', inline: true },
        { name: 'Tipo de pausa', value: isPaused ? pauseKindLabel(open.pause_kind) : 'Não pausado', inline: true },
        { name: 'Pausas registradas', value: `${open.pause_count || 0} pausa(s)`, inline: true },
      ],
    })],
    components: [
      new ActionRowBuilder().addComponents(
        makeStudyButton('panel:estudos:pause_water', 'Pausa para Água', 'estudos', 'coffee'),
        makeStudyButton('panel:estudos:pause_grude', 'Pausa para Grude', 'perfil', 'heart'),
        makeStudyButton('panel:estudos:resume', 'Retomar', 'feedback', 'success'),
        makeStudyButton('panel:estudos:finish', 'Finalizar estudo', 'estudos', 'book', ButtonStyle.Primary),
      ),
      new ActionRowBuilder().addComponents(
        makeStudyButton('panel:estudos:time', 'Ver tempo atual', 'estudos', 'coffee'),
        makeStudyButton('panel:estudos:stats', 'Ver progresso', 'momocoins', 'coin'),
      ),
    ],
  };
}

function messageHasStudyStatusControls(message) {
  return message.components?.some((row) => row.components?.some((component) => STUDY_STATUS_CUSTOM_IDS.has(component.customId)));
}

async function findStudyStatusMessages(channel) {
  if (!channel?.messages?.fetch) return [];
  const messages = await channel.messages.fetch({ limit: 50, cache: false });
  return [...messages.values()]
    .filter((message) => message.author?.bot && messageHasStudyStatusControls(message))
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp);
}

async function ensureStudyStatusMessage(client, channelId) {
  if (!channelId) return false;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased?.()) return false;
    return await upsertStudyStatusMessage(channel);
  } catch (error) {
    console.error('Erro ao garantir painel fixo de estudos:', error);
    return false;
  }
}

async function upsertStudyStatusMessage(channel) {
  const payload = studyStatusPayload(await getStudyStats());

  if (cachedStudyStatusMessageId) {
    try {
      const cached = await channel.messages.fetch(cachedStudyStatusMessageId);
      await cached.edit(payload);
      return true;
    } catch (error) {
      cachedStudyStatusMessageId = null;
      console.warn('Mensagem fixa de estudos em cache não encontrada; procurando no canal.', error.message);
    }
  }

  const existing = await findStudyStatusMessages(channel);
  const [messageToEdit, ...duplicates] = existing;

  if (messageToEdit) {
    cachedStudyStatusMessageId = messageToEdit.id;
    await messageToEdit.edit(payload);

    await Promise.allSettled(duplicates.map((message) => message.delete().catch((error) => {
      console.warn('Não foi possível remover painel duplicado de estudos:', error.message);
    })));
    return true;
  }

  const sent = await channel.send(payload);
  cachedStudyStatusMessageId = sent.id;
  return true;
}

async function updateStudyStatusMessage(interaction) {
  const channel = await getConfiguredChannel(interaction.guild, 'estudos');
  if (!channel) return false;

  try {
    return await upsertStudyStatusMessage(channel);
  } catch (error) {
    console.error('Erro ao atualizar painel fixo de estudos:', error);
    return false;
  }
}

module.exports = {
  ensureStudyStatusMessage,
  studyStatusPayload,
  updateStudyStatusMessage,
};
