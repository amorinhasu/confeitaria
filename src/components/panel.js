const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');

const panelAreas = {
  recados: {
    emojiCategory: 'painel', emojiKey: 'recados', label: 'Recados', title: 'Recados do Momozin', image: 'love_notes_banner',
    description: 'Guarde bilhetinhos para o futuro: saudade, carinho, piada interna e risada baixinha de call.',
  },
  memorias: {
    emojiCategory: 'painel', emojiKey: 'memorias', label: 'Memórias', title: 'Memórias', image: 'memories_banner',
    description: 'O mural azul dos momentos importantes do casal.',
  },
  cine: {
    emojiCategory: 'painel', emojiKey: 'cine', label: 'CineMomozin', title: 'CineMomozin', image: 'cine_banner',
    description: 'Filmes e séries assistidos juntinhos, com notas, plataforma e comentários sinceros.',
  },
  playlist: {
    emojiCategory: 'painel', emojiKey: 'playlist', label: 'Playlist', title: 'Playlist do casal', image: 'playlist_banner',
    description: 'A trilha sonora oficial da confeitaria de madrugada.',
  },
  estudos: {
    emojiCategory: 'painel', emojiKey: 'estudos', label: 'Estudos', title: getText('study_panel_title', 'Foco do Casal'), image: 'study_banner',
    description: getText('study_panel_description', 'Sessões de estudo para Trívia e Kaiki, com cronômetro ligado e MomoCoins pingando.'),
  },
  mimos: {
    emojiCategory: 'painel', emojiKey: 'mimos', label: 'Mimos', title: 'Loja de Mimos', image: 'gifts_banner',
    description: 'A lojinha fofa para trocar MomoCoins por panquequinha, pudinzinho e vales especiais.',
  },
  perfil: {
    emojiCategory: 'painel', emojiKey: 'perfil', label: 'Perfil', title: 'Perfil do casal', image: 'profile_banner',
    description: 'Trívia + Kaiki: apelidos, status, conquistas e contador desde o dia 05.',
  },
  manual: {
    emojiCategory: 'painel', emojiKey: 'manual', label: 'Manual', title: 'Manual do Momozin', image: 'manual_home_banner',
    description: 'Um guia visual para usar tudo sem decorar comandos.',
  },
};

const areaActions = {
  recados: [
    ['panel:recados:add', 'Adicionar recado', 'recados', 'letter'],
    ['panel:recados:random', 'Sortear recado', 'recados', 'letter'],
    ['panel:recados:count', 'Quantidade', 'momocoins', 'coin'],
  ],
  memorias: [
    ['panel:memorias:add', 'Adicionar memória', 'memorias', 'photo'],
    ['panel:memorias:list', 'Últimas memórias', 'memorias', 'photo'],
  ],
  cine: [
    ['panel:cine:add', 'Adicionar filme/série', 'cine', 'movie'],
    ['panel:cine:list', 'Ver histórico', 'cine', 'movie'],
  ],
  playlist: [
    ['panel:playlist:set', 'Definir playlist', 'playlist', 'music'],
    ['panel:playlist:view', 'Ver playlist', 'playlist', 'music'],
  ],
  estudos: [
    ['panel:estudos:start', 'Iniciar estudo', 'estudos', 'book'],
    ['panel:estudos:finish', 'Finalizar estudo', 'estudos', 'book'],
    ['panel:estudos:stats', 'Ver progresso', 'momocoins', 'coin'],
  ],
  mimos: [
    ['panel:mimos:shop', 'Abrir loja', 'mimos', 'gift'],
    ['panel:mimos:buy', 'Comprar mimo', 'mimos', 'gift'],
    ['panel:mimos:coins', 'Ver moedas', 'momocoins', 'coin'],
  ],
  perfil: [
    ['panel:perfil:view', 'Ver perfil', 'perfil', 'heart'],
    ['panel:perfil:achievements', 'Conquistas', 'perfil', 'achievement'],
    ['panel:perfil:status', 'Status', 'perfil', 'heart'],
    ['panel:perfil:pudinzinho', 'Virar Pudinzinho', 'mimos', 'pudding'],
  ],
  manual: [
    ['panel:manual:open', 'Abrir manual', 'manual', 'home'],
  ],
};

function makeButton(customId, label, emojiCategory, emojiKey, style = ButtonStyle.Primary) {
  const button = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  const emojiValue = buttonEmoji(emojiCategory, emojiKey);
  if (emojiValue) button.setEmoji(emojiValue);
  return button;
}

function createPanelEmbed() {
  return momozinEmbed({
    title: getText('panel_title', 'Painel Momozin'),
    description: getText('panel_description', 'Bem-vindos ao quartinho azul de madrugada da Trívia e do Kaiki. Escolha uma área nos botões abaixo.'),
    footer: getText('panel_footer', 'Momozin acordado, fofo e levemente engraçadinho.'),
    image: getAssetPublicUrl('panel_main_banner'),
  });
}

function createPanelRows() {
  const buttons = Object.entries(panelAreas).map(([id, area]) => makeButton(`panel:${id}`, area.label, area.emojiCategory, area.emojiKey));
  return [
    new ActionRowBuilder().addComponents(buttons.slice(0, 4)),
    new ActionRowBuilder().addComponents(buttons.slice(4, 8)),
  ];
}

function createAreaEmbed(areaId) {
  const area = panelAreas[areaId];
  if (!area) return null;
  return momozinEmbed({
    title: area.title,
    description: `${area.description}\n\n${getText('panel_action_hint', 'Escolha uma ação abaixo, momo.')}`,
    image: getAssetPublicUrl(area.image),
  });
}

function createAreaRows(areaId) {
  const actions = areaActions[areaId] || [];
  const buttons = actions.map(([id, label, category, key]) => makeButton(id, label, category, key));
  buttons.push(makeButton('panel:home', 'Início', 'manual', 'start', ButtonStyle.Secondary));

  const rows = [];
  for (let index = 0; index < buttons.length; index += 5) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(index, index + 5)));
  }
  return rows;
}

module.exports = { createAreaEmbed, createAreaRows, createPanelEmbed, createPanelRows, panelAreas };
