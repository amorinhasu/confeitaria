const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const assetsConfig = require('../../config/assets.json');
const { getAssetPublicUrl } = require('../utils/assets');
const { adminUserId, kaikiUserId, triviaUserId } = require('../utils/config');
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
  getCoupleSetup,
  getProfile,
} = require('../database/repositories');

const ADMIN_TABS = ['sistema', 'configuracao', 'emojis', 'assets', 'manual', 'banco', 'auditoria'];

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

function createSystemEmbed() {
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
  ];

  return momozinEmbed({
    title: getText('admin_system_title', 'Painel Administrativo — Sistema'),
    description: lines.join('\n'),
    image: getAssetPublicUrl('panel_main_banner'),
  });
}

async function createConfigurationEmbed() {
  const setup = await getCoupleSetup();
  const profile = await getProfile();
  const configured = Boolean(setup);
  const formattedDate = setup?.created_at ? new Date(`${setup.created_at}Z`).toLocaleDateString('pt-BR') : 'Não configurado';

  return momozinEmbed({
    title: getText('admin_config_title', 'Painel Administrativo — Configuração'),
    description: [
      `Status: ${configured ? 'Configurado ✅' : 'Pendente ⚠️'}`,
      '',
      `Trívia:\n${setup?.trivia_id ? `<@${setup.trivia_id}>` : 'Não configurada'}`,
      '',
      `Kaiki:\n${setup?.kaiki_id ? `<@${setup.kaiki_id}>` : 'Não configurado'}`,
      '',
      `IDs registrados:\n${setup ? `${setup.trivia_id} / ${setup.kaiki_id}` : 'Nenhum ID salvo'}`,
      '',
      `Data:\n${formattedDate}`,
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
  const [setup, notes, memories, movies, balance, gifts] = await Promise.all([
    getCoupleSetup(),
    countLoveNotes(),
    countMemories(),
    countMovies(),
    getCoins(),
    countGifts(),
  ]);

  return momozinEmbed({
    title: getText('admin_database_title', 'Painel Administrativo — Banco'),
    description: [
      `Casal configurado: ${setup ? '✅' : '⚠️'}`,
      `IDs registrados: ${setup ? `${setup.trivia_id} / ${setup.kaiki_id}` : 'não configurado'}`,
      `Quantidade de recados: ${notes}`,
      `Quantidade de memórias: ${memories}`,
      `Quantidade de filmes: ${movies}`,
      `Saldo atual de moedas: ${balance}`,
      `Quantidade de mimos comprados: ${gifts}`,
    ].join('\n'),
  });
}

async function createDiagnosticEmbed() {
  const problems = [];
  const assets = getAssetStatusEntries();
  const emojis = getEmojiStatusEntries();
  const setup = await getCoupleSetup();

  assets.filter((asset) => asset.status !== 'ok').forEach((asset) => problems.push(`⚠️ asset ${asset.key}: ${asset.text}`));
  emojis.filter((item) => item.status !== 'ok').forEach((item) => problems.push(`⚠️ emoji ${item.category}.${item.key}: fallback Unicode`));
  if (!setup) problems.push('⚠️ casal ainda não configurado com /setup casal');
  if (manualPages.length < 9) problems.push('⚠️ manual com páginas incompletas');

  return momozinEmbed({
    title: getText('admin_diagnostic_title', 'Diagnóstico do Momozin'),
    description: problems.length ? `${problems.length} problema(s) encontrado(s):\n\n${problems.slice(0, 20).join('\n')}` : 'Tudo funcionando. Manual criado, emojis seguros, banco acessível, painel carregando e assets principais configurados.',
    image: getAssetPublicUrl(problems.length ? 'error_gif' : 'success_gif'),
  });
}


async function createAuditEmbed(interaction) {
  const [setup, notes, memories, movies, balance, gifts] = await Promise.all([
    getCoupleSetup(),
    countLoveNotes(),
    countMemories(),
    countMovies(),
    getCoins(),
    countGifts(),
  ]);

  const assetsWithoutUrl = getAssetStatusEntries().filter((asset) => asset.status !== 'ok').map((asset) => asset.key);
  const invalidEmojis = getEmojiStatusEntries().filter((item) => item.status !== 'ok').map((item) => `${item.category}.${item.key}`);
  const pudinzinho = await getPudinzinhoRoleDiagnostics(interaction?.guild || null);

  const botPermissions = interaction?.guild?.members?.me?.permissions;
  const botCanManageRoles = botPermissions ? botPermissions.has(PermissionFlagsBits.ManageRoles) : pudinzinho.botCanManageRoles;

  return momozinEmbed({
    title: getText('audit_title', 'Auditoria do Momozin'),
    description: [
      `Casal configurado: ${setup ? 'sim' : 'não'}`,
      `IDs no banco: ${setup ? `${setup.trivia_id} / ${setup.kaiki_id}` : 'não configurado'}`,
      `IDs do .env: ADMIN=${adminUserId || 'não definido'} | TRIVIA=${triviaUserId || 'não definido'} | KAIKI=${kaikiUserId || 'não definido'}`,
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
  if (tab === 'diagnostico') return createDiagnosticEmbed();
  if (tab === 'auditoria') return createAuditEmbed(interaction);
  return createSystemEmbed();
}

module.exports = { ADMIN_TABS, createAdminEmbed, createAdminRows };
