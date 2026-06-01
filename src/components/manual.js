const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji, withEmoji } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');

const manualPages = [
  {
    id: 'home',
    title: 'Manual do Momozin',
    emojiCategory: 'manual',
    emojiKey: 'home',
    banner: 'manual_home_banner',
    description: [
      'Bem-vinda ao Momozin.',
      '',
      'O Momozin foi criado para guardar momentos, organizar lembranças e transformar pequenas coisas do dia a dia em memórias especiais.',
      '',
      'Você não precisa decorar comandos.',
      '',
      'Tudo pode ser acessado pelos botões e pelo painel principal.',
      '',
      'Escolha uma categoria abaixo para começar.',
    ].join('\n'),
    actionRows: [
      [
        ['manual:page:recados', 'Recados', 'recados', 'letter'],
        ['manual:page:cine', 'CineMomozin', 'cine', 'movie'],
        ['manual:page:memorias', 'Memórias', 'memorias', 'photo'],
        ['manual:page:playlist', 'Playlist', 'playlist', 'music'],
      ],
      [
        ['manual:page:estudos', 'Estudos', 'estudos', 'coffee'],
        ['manual:page:mimos', 'Mimos', 'mimos', 'pudding'],
        ['manual:page:perfil', 'Perfil', 'perfil', 'heart'],
        ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ],
    ],
  },
  {
    id: 'recados',
    title: 'Recados',
    emojiCategory: 'recados',
    emojiKey: 'letter',
    banner: 'love_notes_banner',
    description: [
      'Guarde mensagens especiais para serem encontradas quando menos esperar.',
      '',
      'Você pode escrever:',
      '',
      '• frases do dia',
      '• declarações',
      '• lembretes carinhosos',
      '• mensagens engraçadas',
      '',
      'O que posso fazer aqui?',
      '',
      '• Adicionar Recado',
      '• Sortear Recado',
    ].join('\n'),
    actionRows: [[
      ['panel:recados:add', 'Adicionar Recado', 'recados', 'letter'],
      ['panel:recados:random', 'Sortear Recado', 'recados', 'letter'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'cine',
    title: 'CineMomozin',
    emojiCategory: 'cine',
    emojiKey: 'movie',
    banner: 'cine_banner',
    description: [
      'O cantinho dos filmes, séries e animes que fizeram parte da história de vocês.',
      '',
      'Você pode salvar:',
      '',
      '• nome',
      '• plataforma',
      '• nota da Trívia',
      '• nota do Kaiki',
      '• comentários',
    ].join('\n'),
    actionRows: [[
      ['panel:cine:add', 'Adicionar Filme/Série', 'cine', 'movie'],
      ['panel:cine:list', 'Ver Histórico', 'cine', 'movie'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'memorias',
    title: 'Memórias',
    emojiCategory: 'memorias',
    emojiKey: 'photo',
    banner: 'memories_banner',
    description: [
      'Guarde momentos especiais.',
      '',
      'Exemplos:',
      '',
      '• primeiro filme juntos',
      '• primeiro eu te amo',
      '• primeira madrugada em call',
      '• datas especiais',
      '• conquistas importantes',
    ].join('\n'),
    actionRows: [[
      ['panel:memorias:add', 'Adicionar Memória', 'memorias', 'photo'],
      ['panel:memorias:list', 'Ver Últimas', 'memorias', 'photo'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'playlist',
    title: 'Playlist',
    emojiCategory: 'playlist',
    emojiKey: 'music',
    banner: 'playlist_banner',
    description: [
      'Toda história tem uma trilha sonora.',
      '',
      'Salve a playlist oficial do casal.',
      '',
      'Spotify, YouTube Music, Deezer ou qualquer link.',
    ].join('\n'),
    actionRows: [[
      ['panel:playlist:set', 'Definir Playlist', 'playlist', 'music'],
      ['panel:playlist:view', 'Ver Playlist', 'playlist', 'music'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'estudos',
    title: 'Estudos',
    emojiCategory: 'estudos',
    emojiKey: 'coffee',
    banner: 'study_banner',
    description: [
      'Inicie uma sessão de estudos.',
      '',
      'Ao finalizar, você ganha MomoCoins.',
      '',
      'As moedas podem ser usadas na loja de mimos.',
    ].join('\n'),
    actionRows: [[
      ['panel:estudos:start', 'Iniciar Estudo', 'estudos', 'coffee'],
      ['panel:estudos:finish', 'Finalizar Estudo', 'estudos', 'book'],
      ['panel:estudos:stats', 'Ver Progresso', 'momocoins', 'coin'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'mimos',
    title: 'Mimos',
    emojiCategory: 'mimos',
    emojiKey: 'gift',
    banner: 'gifts_banner',
    description: [
      'Use suas MomoCoins para trocar por presentes simbólicos.',
      '',
      'Itens disponíveis:',
      '',
      '• Panquequinha',
      '• Pudinzinho',
      '• Cartinha',
      '• Vale Filme',
      '• Vale Carinho',
    ].join('\n'),
    actionRows: [[
      ['panel:mimos:shop', 'Abrir Loja', 'mimos', 'gift'],
      ['panel:mimos:buy', 'Comprar Mimo', 'mimos', 'pudding'],
      ['panel:mimos:coins', 'Ver Moedas', 'momocoins', 'coin'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'perfil',
    title: 'Perfil',
    emojiCategory: 'perfil',
    emojiKey: 'heart',
    banner: 'profile_banner',
    description: [
      'Veja:',
      '',
      '• status do casal',
      '• conquistas',
      '• tempo juntos',
      '• apelidos',
      '',
      'O perfil funciona como um álbum vivo da história de vocês.',
    ].join('\n'),
    actionRows: [[
      ['panel:perfil:view', 'Ver Perfil', 'perfil', 'heart'],
      ['panel:perfil:achievements', 'Conquistas', 'perfil', 'achievement'],
      ['panel:perfil:status', 'Status', 'perfil', 'heart'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'dicas',
    title: 'Dicas',
    emojiCategory: 'manual',
    emojiKey: 'home',
    banner: 'manual_category_banner',
    description: [
      'Tudo pode ser usado pelo painel.',
      '',
      'Você não precisa decorar comandos.',
      '',
      'Basta clicar nos botões e aproveitar os momentos.',
      '',
      'O Momozin foi criado para guardar lembranças, registrar conquistas e transformar pequenas coisas em memórias especiais.',
      '',
      'Divirtam-se. ✨',
    ].join('\n'),
    actionRows: [[
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ['manual:page:home', 'Voltar ao Manual', 'manual', 'home'],
    ]],
  },
];

const manualPageMap = new Map(manualPages.map((page, index) => [page.id, { ...page, index }]));
const manualCategories = Object.fromEntries(manualPages.filter((page) => page.id !== 'home').map((page) => [page.id, page]));

function makeButton(id, label, category, key, style = ButtonStyle.Primary) {
  const button = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
  const emojiValue = buttonEmoji(category, key);
  if (emojiValue) button.setEmoji(emojiValue);
  return button;
}

function createManualPageEmbed(pageId = 'home') {
  const page = manualPageMap.get(pageId) || manualPageMap.get('home');
  return momozinEmbed({
    title: withEmoji(page.emojiCategory, page.emojiKey, page.title),
    description: page.description,
    image: getAssetPublicUrl(page.banner),
  });
}

function createActionRows(page) {
  return page.actionRows.map((row) => new ActionRowBuilder().addComponents(
    row.map(([id, label, category, key]) => makeButton(id, label, category, key)),
  ));
}

function createNavigationRow(page) {
  const buttons = [];
  if (page.id !== 'home') buttons.push(makeButton('manual:page:home', 'Início', 'manual', 'start', ButtonStyle.Secondary));
  if (page.index > 0) buttons.push(makeButton(`manual:page:${manualPages[page.index - 1].id}`, 'Anterior', 'manual', 'previous', ButtonStyle.Secondary));
  if (page.index < manualPages.length - 1) buttons.push(makeButton(`manual:page:${manualPages[page.index + 1].id}`, 'Próximo', 'manual', 'next', ButtonStyle.Secondary));

  if (buttons.length === 0) return null;
  return new ActionRowBuilder().addComponents(buttons);
}

function createManualPageRows(pageId = 'home') {
  const page = manualPageMap.get(pageId) || manualPageMap.get('home');
  const rows = createActionRows(page);
  const navigationRow = createNavigationRow(page);
  if (navigationRow) rows.push(navigationRow);
  return rows;
}

function getManualPage(pageId) {
  return manualPageMap.get(pageId) || null;
}

function createManualHomeEmbed() {
  return createManualPageEmbed('home');
}

function createManualHomeRows() {
  return createManualPageRows('home');
}

function createManualCategoryEmbed(categoryId) {
  return createManualPageEmbed(categoryId);
}

function createManualNavigationRows(categoryId = 'home') {
  return createManualPageRows(categoryId);
}

module.exports = {
  createManualCategoryEmbed,
  createManualHomeEmbed,
  createManualHomeRows,
  createManualNavigationRows,
  createManualPageEmbed,
  createManualPageRows,
  getManualPage,
  manualCategories,
  manualPages,
};
