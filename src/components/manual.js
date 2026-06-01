const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { giftsCatalog } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji, withEmoji } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');

function giftCostList() {
  return giftsCatalog.map((gift) => `• ${gift.labelText} — ${gift.cost} MomoCoins`).join('\n');
}

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
      'O Momozin guarda momentos, organiza lembranças e transforma pequenas coisas do dia a dia em memórias especiais.',
      '',
      '**Como usar:**',
      '• Pelo **Painel**, clicando nos botões.',
      '• Por **comandos slash**, digitando `/` no Discord.',
      '',
      'O jeito mais fácil de usar o Momozin é pelo painel.',
      'Clique em uma área, escolha uma ação e preencha o que ele pedir.',
      '',
      'Se preferir, também dá para usar os comandos slash.',
      '',
      '**Comece por aqui:**',
      '1. Use `/setup casal` para registrar Trívia e Kaiki.',
      '2. Abra `/painel` para usar tudo por botões.',
      '3. Volte neste manual quando quiser lembrar como funciona.',
      '',
      '**Dica rápida:** se ficar perdida, clique em **Abrir Painel** e escolha uma área.',
    ].join('\n'),
    actionRows: [
      [
        ['manual:page:setup', 'Setup', 'manual', 'start'],
        ['manual:page:recados', 'Recados', 'recados', 'letter'],
        ['manual:page:cine', 'CineMomozin', 'cine', 'movie'],
        ['manual:page:memorias', 'Memórias', 'memorias', 'photo'],
      ],
      [
        ['manual:page:playlist', 'Playlist', 'playlist', 'music'],
        ['manual:page:estudos', 'Estudos', 'estudos', 'coffee'],
        ['manual:page:momocoins', 'MomoCoins', 'momocoins', 'coin'],
        ['manual:page:mimos', 'Mimos', 'mimos', 'pudding'],
      ],
      [
        ['manual:page:perfil', 'Perfil', 'perfil', 'heart'],
        ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ],
    ],
  },
  {
    id: 'setup',
    title: 'Setup do Casal',
    emojiCategory: 'manual',
    emojiKey: 'start',
    banner: 'manual_category_banner',
    description: [
      '**O que essa área faz:**',
      'Antes de usar tudo, registre quem são Trívia e Kaiki.',
      'Isso ajuda o Momozin a saber quem faz parte do casal e protege as ações principais.',
      '',
      '**Como usar pelo Discord:**',
      'Digite o comando abaixo e marque os dois usuários:',
      '`/setup casal trivia:@Trívia kaiki:@Kaiki`',
      '',
      '**Campos do comando:**',
      '• `trivia`: usuário da Trívia',
      '• `kaiki`: usuário do Kaiki',
      '',
      '**Depois do setup:**',
      'As ações principais ficam reservadas para vocês dois.',
      'O `/manual` e o `/painel` continuam servindo para se localizar.',
      '',
      '**Exemplo simples:**',
      '`/setup casal trivia:@Trívia kaiki:@Kaiki`',
      '',
      '**Dica rápida:** faça o setup uma vez antes de começar a guardar recados, memórias e mimos.',
    ].join('\n'),
    actionRows: [[
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'recados',
    title: 'Recados',
    emojiCategory: 'recados',
    emojiKey: 'letter',
    banner: 'love_notes_banner',
    description: [
      '**O que essa área faz:**',
      'Guarda mensagens especiais para serem encontradas quando menos esperar.',
      'Pode ser declaração, frase do dia, piada interna ou carinho de madrugada.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Recados**.',
      '2. Clique em **Adicionar Recado**.',
      '3. Escreva a mensagem no modal.',
      '4. Envie.',
      '',
      '**Para sortear:**',
      '1. Clique em **Sortear Recado**.',
      '2. O Momozin escolhe uma mensagem salva.',
      '',
      '**Campos do modal:**',
      '• texto do recado',
      '',
      '**Comandos slash equivalentes:**',
      '`/recado adicionar texto:`',
      '`/recado sortear`',
      '',
      '**Exemplo simples:**',
      '“abre quando estiver com saudade de mim.”',
      '',
      '**Dica rápida:** use recados para guardar frases, declarações e piadas internas.',
    ].join('\n'),
    actionRows: [[
      ['panel:recados:add', 'Adicionar Recado', 'recados', 'letter'],
      ['panel:recados:random', 'Sortear Recado', 'recados', 'letter'],
      ['panel:recados:count', 'Quantidade', 'momocoins', 'coin'],
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
      '**O que essa área faz:**',
      'Registra filmes, séries e animes que fizeram parte da história de vocês.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **CineMomozin**.',
      '2. Clique em **Adicionar Filme/Série**.',
      '3. Preencha os campos do modal.',
      '4. Envie.',
      '',
      '**Campos do modal:**',
      '• nome',
      '• tipo',
      '• plataforma',
      '• nota da Trívia',
      '• nota do Kaiki',
      '',
      '**Comando slash equivalente:**',
      '`/cine adicionar`',
      '',
      '**Regra importante:**',
      'As notas precisam ser números de **0 a 10**.',
      '',
      '**Exemplo simples:**',
      'Nome: Shrek 2',
      'Tipo: filme',
      'Plataforma: Netflix',
      'Nota da Trívia: 10',
      'Nota do Kaiki: 9',
      '',
      '**Dica rápida:** use **Ver Histórico** para lembrar o que vocês já assistiram juntos.',
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
      '**O que essa área faz:**',
      'Guarda momentos importantes do casal, dos enormes aos pequenininhos.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Memórias**.',
      '2. Clique em **Adicionar Memória**.',
      '3. Preencha título, descrição e data.',
      '4. Envie.',
      '',
      '**Campos do modal:**',
      '• título',
      '• descrição',
      '• data',
      '',
      '**Comando slash equivalente:**',
      '`/memoria adicionar`',
      '',
      '**Exemplo simples:**',
      'Título: primeiro eu te amo',
      'Descrição: declaração em call antes de dormir',
      'Data: 05/06/2026',
      '',
      '**Dica rápida:** registre momentos pequenos também. Às vezes eles viram os mais importantes.',
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
      '**O que essa área faz:**',
      'Salva a playlist oficial do casal, porque toda história tem uma trilha sonora.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Playlist**.',
      '2. Clique em **Definir Playlist**.',
      '3. Cole o link no modal.',
      '4. Use **Ver Playlist** quando quiser abrir de novo.',
      '',
      '**Campos do modal:**',
      '• link da playlist',
      '',
      '**Comandos slash equivalentes:**',
      '`/playlist definir link:`',
      '`/playlist ver`',
      '',
      '**Exemplo simples:**',
      'https://open.spotify.com/playlist/...',
      '',
      '**Dica rápida:** pode ser Spotify, YouTube Music, Deezer ou qualquer link.',
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
      '**O que essa área faz:**',
      'Acompanha sessões de foco do Kaiki e transforma estudo em MomoCoins.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Estudos**.',
      '2. Clique em **Iniciar Estudo** quando começar.',
      '3. Clique em **Finalizar Estudo** quando terminar.',
      '4. O Momozin calcula o tempo e entrega MomoCoins.',
      '',
      '**Botões principais:**',
      '• Iniciar Estudo',
      '• Finalizar Estudo',
      '• Ver Progresso',
      '',
      '**Comandos slash equivalentes:**',
      '`/estudo iniciar`',
      '`/estudo finalizar`',
      '',
      '**Exemplo simples:**',
      'Começou a estudar? Clique em **Iniciar Estudo**. Terminou? Clique em **Finalizar Estudo**.',
      '',
      '**Dica rápida:** use **Ver Progresso** para acompanhar o esforço acumulado.',
      'Se não houver sessão aberta, o Momozin avisa sem quebrar nada.',
    ].join('\n'),
    actionRows: [[
      ['panel:estudos:start', 'Iniciar Estudo', 'estudos', 'coffee'],
      ['panel:estudos:finish', 'Finalizar Estudo', 'estudos', 'book'],
      ['panel:estudos:stats', 'Ver Progresso', 'momocoins', 'coin'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'momocoins',
    title: 'MomoCoins',
    emojiCategory: 'momocoins',
    emojiKey: 'coin',
    banner: 'coins_banner',
    description: [
      '**O que essa área faz:**',
      'MomoCoins são as moedinhas do Momozin.',
      'Vocês podem ganhar moedas estudando, registrando momentos e usando o bot.',
      'As moedas servem para comprar mimos na lojinha.',
      '',
      '**Como ver saldo pelo painel:**',
      '1. Clique em **Mimos**.',
      '2. Clique em **Ver Moedas**.',
      '3. O Momozin mostra o saldo e as últimas movimentações.',
      '',
      '**Comando slash equivalente:**',
      '`/moedas ver`',
      '',
      '**Comando administrativo:**',
      '`/moedas adicionar quantidade: motivo:`',
      '',
      '**Exemplo simples:**',
      'Depois de finalizar uma sessão de estudo, confira o saldo em **Mimos > Ver Moedas**.',
      '',
      '**Dica rápida:** o saldo é do casal, não individual.',
    ].join('\n'),
    actionRows: [[
      ['panel:mimos:coins', 'Ver Moedas', 'momocoins', 'coin'],
      ['panel:mimos:shop', 'Abrir Loja', 'mimos', 'gift'],
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
      '**O que essa área faz:**',
      'Permite trocar MomoCoins por presentes simbólicos e combinados do casal.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Mimos**.',
      '2. Clique em **Abrir Loja**.',
      '3. Veja os itens e preços.',
      '4. Clique em **Comprar Mimo** ou use os botões da loja.',
      '5. Se abrir modal, informe o item desejado.',
      '6. O valor será descontado das MomoCoins.',
      '',
      '**Campos do modal:**',
      '• item do mimo',
      '',
      '**Itens e custos atuais:**',
      giftCostList(),
      '',
      '**Comandos slash equivalentes:**',
      '`/mimo loja`',
      '`/mimo comprar item:`',
      '',
      '**Exemplo simples:**',
      'Juntou moedas estudando? Abra a loja e compre um **Pudinzinho** ou uma **Cartinha**.',
      '',
      '**Dica rápida:** mimos são presentes simbólicos para deixar o casal mais divertido.',
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
      '**O que essa área faz:**',
      'Mostra o resumo do casal: status, conquistas, tempo juntos e apelidos.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Perfil**.',
      '2. Escolha **Ver Perfil**, **Conquistas** ou **Status**.',
      '',
      '**O que cada botão mostra:**',
      '• **Ver Perfil:** resumo completo do casal.',
      '• **Conquistas:** marcos registrados e momentos especiais.',
      '• **Status:** frase/status atual do casal.',
      '',
      '**Comando slash equivalente:**',
      '`/perfil`',
      '',
      '**Exemplo simples:**',
      'Use **Ver Perfil** para abrir o álbum vivo da história de vocês.',
      '',
      '**Dica rápida:** o perfil funciona como um álbum vivo da história de vocês.',
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
      '**Se estiver perdido:**',
      '1. Abra `/painel`.',
      '2. Escolha uma área.',
      '3. Clique em uma ação.',
      '4. Preencha o modal se aparecer.',
      '5. Pronto.',
      '',
      '**Lembretes importantes:**',
      '• `/manual` abre esse guia.',
      '• `/painel` abre a central.',
      '• `/setup casal` configura o casal.',
      '',
      '**Como usar melhor:**',
      'Use o painel quando quiser rapidez e use os comandos slash quando já souber exatamente o que quer fazer.',
      '',
      '**Exemplo simples:**',
      '`/painel` → Recados → Adicionar Recado → escrever no modal → enviar.',
      '',
      '**Dica rápida:** basta clicar nos botões e aproveitar os momentos. O Momozin cuida do resto.',
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
