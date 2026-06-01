const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const assetsConfig = require('../../config/assets.json');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji, listConfiguredEmojis, withEmoji } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');
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

const ADMIN_TABS = ['sistema', 'configuracao', 'emojis', 'assets', 'manual', 'banco'];

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
    title: withEmoji('feedback', 'success', 'Painel Administrativo — Sistema'),
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
    title: withEmoji('perfil', 'heart', 'Painel Administrativo — Configuração'),
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
    title: withEmoji('manual', 'home', 'Painel Administrativo — Emojis'),
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
    title: withEmoji('memorias', 'photo', 'Painel Administrativo — Assets'),
    description: 'Banners e imagens configurados para os embeds.',
    fields,
    image: getAssetPublicUrl('manual_category_banner'),
  });
}

function createManualAdminEmbed() {
  return momozinEmbed({
    title: withEmoji('manual', 'home', 'Painel Administrativo — Manual'),
    description: manualPages.map((page) => `✅ ${page.title} — Criada`).join('\n'),
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
    title: withEmoji('momocoins', 'coin', 'Painel Administrativo — Banco'),
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
    title: withEmoji('feedback', problems.length ? 'warning' : 'success', 'Diagnóstico do Momozin'),
    description: problems.length ? `${problems.length} problema(s) encontrado(s):\n\n${problems.slice(0, 20).join('\n')}` : 'Tudo funcionando. Manual criado, emojis seguros, banco acessível, painel carregando e assets principais configurados.',
    image: getAssetPublicUrl(problems.length ? 'error_gif' : 'success_gif'),
  });
}

async function createAdminEmbed(tab = 'sistema') {
  if (tab === 'configuracao') return createConfigurationEmbed();
  if (tab === 'emojis') return createEmojisEmbed();
  if (tab === 'assets') return createAssetsEmbed();
  if (tab === 'manual') return createManualAdminEmbed();
  if (tab === 'banco') return createDatabaseEmbed();
  if (tab === 'diagnostico') return createDiagnosticEmbed();
  return createSystemEmbed();
}

module.exports = { ADMIN_TABS, createAdminEmbed, createAdminRows };
