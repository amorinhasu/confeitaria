const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const assetsConfig = require('../../config/assets.json');
const { getAssetPublicUrl } = require('../utils/assets');
const { commandsChannelId, memoriesChannelId, adminUserId, kaikiUserId, triviaUserId } = require('../utils/config');
const { getMemoriesChannel } = require('../utils/channels');
const { buttonEmoji, listConfiguredEmojis } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');
const { getPudinzinhoRoleDiagnostics } = require('../utils/pudinzinhoRole');
const { getText } = require('../utils/texts');
const { manualPages } = require('./manual');
const {
  countGifts,
  countLoveNotes,
  countMemories,
  countMovies,
  getCoins,
  getProfile,
} = require('../database/repositories');

const ADMIN_TABS = ['sistema', 'configuracao', 'emojis', 'assets', 'manual', 'banco', 'auditoria'];


async function getChannelStatus(guild, channelId) {
  if (!channelId) return { configured: false, found: false, textBased: false };

  try {
    const channel = await guild?.channels.fetch(channelId);
    return { configured: true, found: Boolean(channel), textBased: Boolean(channel?.isTextBased?.()), name: channel?.name || null };
  } catch (error) {
    return { configured: true, found: false, textBased: false, error: error.message };
  }
}

function statusLabel(status, text) {
  const icon = status === 'ok' ? '✅' : status === 'partial' ? '⚠️' : '❌';
  return `${icon} ${text}`;
}

function makeButton(customId, label, category, key, style = ButtonStyle.Secondary) {
  const button = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  const emojiValue = buttonEmoji(category, key);
  if (emojiValue) button.setEmoji(emojiValue);
  return button;
}

function createAdminRows(activeTab = 'sistema') {
  const tabButtons = [
    ['admin:sistema', 'Sistema', 'feedback', 'success'],
    ['admin:configuracao', 'Configuração', 'perfil', 'heart'],
    ['admin:emojis', 'Emojis', 'manual', 'home'],
    ['admin:assets', 'Assets', 'memorias', 'photo'],
    ['admin:manual', 'Manual', 'manual', 'home'],
  ].map(([id, label, category, key]) => makeButton(id, label, category, key, id.endsWith(activeTab) ? ButtonStyle.Primary : ButtonStyle.Secondary));

  return [
    new ActionRowBuilder().addComponents(tabButtons),
    new ActionRowBuilder().addComponents(
      makeButton('admin:banco', 'Banco', 'momocoins', 'coin', activeTab === 'banco' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      makeButton('admin:auditoria', 'Auditoria', 'feedback', 'success', activeTab === 'auditoria' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      makeButton('admin:diagnostico', 'Executar Diagnóstico', 'feedback', 'warning', ButtonStyle.Danger),
    ),
  ];
}

function getAssetStatusEntries() {
  return Object.entries(assetsConfig.items).map(([key, asset]) => {
    const publicUrl = getAssetPublicUrl(key);
    return {
      key,
      usage: asset.usage,
      status: publicUrl ? 'ok' : 'partial',
      text: publicUrl ? 'configurado' : 'sem URL pública',
    };
  });
}

function getEmojiStatusEntries() {
  return listConfiguredEmojis().map((item) => ({
    ...item,
    status: item.valid && item.available ? 'ok' : 'partial',
    text: item.valid && item.available ? 'custom ativo' : 'fallback Unicode',
  }));
}

async function createSystemEmbed(interaction = null) {
  const commandsChannel = await getChannelStatus(interaction?.guild || null, commandsChannelId);
  const memoriesChannel = await getChannelStatus(interaction?.guild || null, memoriesChannelId);
  const lines = [
    statusLabel('ok', 'Banco SQLite: Funcionando'),
    statusLabel('ok', 'Painel: Funcionando'),
    statusLabel('ok', 'Manual: Funcionando'),
    statusLabel('ok', 'Perfil: Funcionando'),
    statusLabel('ok', 'Recados: Funcionando'),
    statusLabel('ok', 'Memórias: Funcionando'),
    statusLabel('ok', 'CineMomozin: Funcionando'),
    statusLabel('partial', 'Playlist: Parcial'),
    statusLabel('ok', 'Estudos: Funcionando'),
    statusLabel('ok', 'Mimos: Funcionando'),
    statusLabel('ok', 'MomoCoins: Funcionando'),
    statusLabel('ok', 'Emojis: Com fallback seguro'),
    statusLabel(getAssetStatusEntries().some((asset) => asset.status !== 'ok') ? 'partial' : 'ok', 'Assets: Revisados'),
    statusLabel(commandsChannel.configured && commandsChannel.found && commandsChannel.textBased ? 'ok' : 'partial', `Canal de comandos: ${commandsChannelId ? `<#${commandsChannelId}>` : 'não configurado'}`),
    statusLabel(memoriesChannel.configured && memoriesChannel.found && memoriesChannel.textBased ? 'ok' : 'partial', `Canal diário: ${memoriesChannelId ? `<#${memoriesChannelId}>` : 'não configurado'}`),
  ];

  return momozinEmbed({
    title: getText('admin_system_title', 'Painel Administrativo — Sistema'),
    description: lines.join('\n'),
    image: getAssetPublicUrl('panel_main_banner'),
  });
}

async function createConfigurationEmbed() {
  const profile = await getProfile();
  const idsConfigured = Boolean(triviaUserId && kaikiUserId);

  return momozinEmbed({
    title: getText('admin_config_title', 'Painel Administrativo — Configuração'),
    description: [
      `IDs do casal no .env: ${idsConfigured ? 'definidos ✅' : 'pendentes ⚠️'}`,
      '',
      `Trívia:\n${triviaUserId ? `<@${triviaUserId}>` : 'TRIVIA_USER_ID não definido'}`,
      '',
      `Kaiki:\n${kaikiUserId ? `<@${kaikiUserId}>` : 'KAIKI_USER_ID não definido'}`,
      '',
      `IDs carregados:\n${triviaUserId || 'sem TRIVIA_USER_ID'} / ${kaikiUserId || 'sem KAIKI_USER_ID'}`,
      '',
      `Status do casal:\n${profile?.status || 'Não encontrado'}`,
    ].join('\n'),
    image: getAssetPublicUrl('profile_banner'),
  });
}

function createEmojisEmbed() {
  const grouped = getEmojiStatusEntries().reduce((groups, item) => {
    groups[item.category] ||= [];
    groups[item.category].push(item);
    return groups;
  }, {});

  const fields = Object.entries(grouped).map(([category, items]) => ({
    name: category,
    value: items.map((item) => `• ${item.name || item.key} ${item.status === 'ok' ? '✅' : '⚠️ fallback'}`).join('\n').slice(0, 1024),
    inline: false,
  }));

  return momozinEmbed({
    title: getText('admin_emojis_title', 'Painel Administrativo — Emojis'),
    description: 'Lista dos emojis usados pelo bot e se estão renderizando como custom ou fallback.',
    fields,
    image: getAssetPublicUrl('manual_category_banner'),
  });
}

function createAssetsEmbed() {
  const fields = getAssetStatusEntries().map((asset) => ({
    name: asset.key,
    value: `${asset.status === 'ok' ? '✅' : '⚠️'} ${asset.text}\n${asset.usage}`,
    inline: true,
  }));

  return momozinEmbed({
    title: getText('admin_assets_title', 'Painel Administrativo — Assets'),
    description: 'Banners e imagens configurados para os embeds.',
    fields,
    image: getAssetPublicUrl('manual_category_banner'),
  });
}

function createManualAdminEmbed() {
  return momozinEmbed({
    title: getText('admin_manual_title', 'Painel Administrativo — Manual'),
    description: manualPages.map((page) => `${page.title} — Criada`).join('\n'),
    image: getAssetPublicUrl('manual_home_banner'),
  });
}

async function createDatabaseEmbed() {
  const [notes, memories, movies, balance, gifts] = await Promise.all([
    countLoveNotes(),
    countMemories(),
    countMovies(),
    getCoins(),
    countGifts(),
  ]);

  return momozinEmbed({
    title: getText('admin_database_title', 'Painel Administrativo — Banco'),
    description: [
      `IDs do casal carregados do .env: ${triviaUserId || 'sem TRIVIA_USER_ID'} / ${kaikiUserId || 'sem KAIKI_USER_ID'}`,
      `Quantidade de recados: ${notes}`,
      `Quantidade de memórias: ${memories}`,
      `Quantidade de filmes: ${movies}`,
      `Saldo atual de moedas: ${balance}`,
      `Quantidade de mimos comprados: ${gifts}`,
    ].join('\n'),
  });
}

async function createDiagnosticEmbed(interaction = null) {
  const problems = [];
  const assets = getAssetStatusEntries();
  const emojis = getEmojiStatusEntries();
  const commandsChannel = await getChannelStatus(interaction?.guild || null, commandsChannelId);
  const memoriesChannel = await getChannelStatus(interaction?.guild || null, memoriesChannelId);
  assets.filter((asset) => asset.status !== 'ok').forEach((asset) => problems.push(`⚠️ asset ${asset.key}: ${asset.text}`));
  emojis.filter((item) => item.status !== 'ok').forEach((item) => problems.push(`⚠️ emoji ${item.category}.${item.key}: fallback Unicode`));
  if (manualPages.length < 9) problems.push('⚠️ manual com páginas incompletas');
  if (!commandsChannel.configured) problems.push('⚠️ COMMANDS_CHANNEL_ID não configurado');
  else if (!commandsChannel.found || !commandsChannel.textBased) problems.push('⚠️ COMMANDS_CHANNEL_ID inválido ou não textual');
  if (!memoriesChannel.configured) problems.push('⚠️ MEMORIES_CHANNEL_ID não configurado');
  else if (!memoriesChannel.found || !memoriesChannel.textBased) problems.push('⚠️ MEMORIES_CHANNEL_ID inválido ou não textual');

  return momozinEmbed({
    title: getText('admin_diagnostic_title', 'Diagnóstico do Momozin'),
    description: problems.length ? `${problems.length} problema(s) encontrado(s):\n\n${problems.slice(0, 20).join('\n')}` : 'Tudo funcionando. Manual criado, emojis seguros, banco acessível, painel carregando e assets principais configurados.',
    image: getAssetPublicUrl(problems.length ? 'error_gif' : 'success_gif'),
  });
}


async function createAuditEmbed(interaction) {
  const [notes, memories, movies, balance, gifts] = await Promise.all([
    countLoveNotes(),
    countMemories(),
    countMovies(),
    getCoins(),
    countGifts(),
  ]);

  const assetsWithoutUrl = getAssetStatusEntries().filter((asset) => asset.status !== 'ok').map((asset) => asset.key);
  const invalidEmojis = getEmojiStatusEntries().filter((item) => item.status !== 'ok').map((item) => `${item.category}.${item.key}`);
  const pudinzinho = await getPudinzinhoRoleDiagnostics(interaction?.guild || null);
  const commandsChannel = await getChannelStatus(interaction?.guild || null, commandsChannelId);
  const memoriesChannel = await getChannelStatus(interaction?.guild || null, memoriesChannelId);
  const resolvedMemoriesChannel = await getMemoriesChannel(interaction?.guild || null);

  const botPermissions = interaction?.guild?.members?.me?.permissions;
  const botCanManageRoles = botPermissions ? botPermissions.has(PermissionFlagsBits.ManageRoles) : pudinzinho.botCanManageRoles;

  return momozinEmbed({
    title: getText('audit_title', 'Auditoria do Momozin'),
    description: [
      `IDs do casal definidos no .env: ${triviaUserId && kaikiUserId ? 'sim' : 'não'}`,
      `IDs carregados: TRIVIA=${triviaUserId || 'não definido'} | KAIKI=${kaikiUserId || 'não definido'}`,
      `Admin carregado: ${adminUserId || 'não definido'}`,
      `COMMANDS_CHANNEL_ID: ${commandsChannelId ? `<#${commandsChannelId}> (${commandsChannel.found && commandsChannel.textBased ? 'ok' : 'verificar'})` : 'não definido'}`,
      `MEMORIES_CHANNEL_ID: ${memoriesChannelId ? `<#${memoriesChannelId}> (${resolvedMemoriesChannel && memoriesChannel.found && memoriesChannel.textBased ? 'ok' : 'verificar'})` : 'não definido'}`,
      'Banco SQLite: acessível',
      `Recados: ${notes}`,
      `Memórias: ${memories}`,
      `Filmes: ${movies}`,
      `Mimos comprados: ${gifts}`,
      `Saldo MomoCoins: ${balance}`,
      `Assets sem URL pública: ${assetsWithoutUrl.length ? assetsWithoutUrl.join(', ') : 'nenhum'}`,
      `Emojis em fallback/inválidos: ${invalidEmojis.length ? invalidEmojis.slice(0, 12).join(', ') : 'nenhum'}`,
      `Permissão Gerenciar Cargos: ${botCanManageRoles ? 'sim' : 'não/indisponível'}`,
      `Cargo Pudinzinho configurado: ${pudinzinho.configured ? 'sim' : 'não'}`,
      `Cargo Pudinzinho encontrado: ${pudinzinho.found ? `sim (${pudinzinho.roleName})` : 'não'}`,
      `Bot acima do Pudinzinho: ${pudinzinho.botAboveRole ? 'sim' : 'não/indisponível'}`,
    ].join('\n'),
    image: getAssetPublicUrl('manual_category_banner'),
  });
}

async function createAdminEmbed(tab = 'sistema', interaction = null) {
  if (tab === 'configuracao') return createConfigurationEmbed();
  if (tab === 'emojis') return createEmojisEmbed();
  if (tab === 'assets') return createAssetsEmbed();
  if (tab === 'manual') return createManualAdminEmbed();
  if (tab === 'banco') return createDatabaseEmbed();
  if (tab === 'diagnostico') return createDiagnosticEmbed(interaction);
  if (tab === 'auditoria') return createAuditEmbed(interaction);
  return createSystemEmbed(interaction);
}

module.exports = { ADMIN_TABS, createAdminEmbed, createAdminRows };
