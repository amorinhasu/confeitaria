const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji, withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');

const panelAreas = {
  recados: {
    emojiCategory: 'painel',
    emojiKey: 'recados',
    label: 'Recados',
    title: 'Recados do Momozin',
    description: 'Guarda as frases românticas, engraçadinhas e absurdamente específicas que só Trívia e Kaiki entendem.',
  },
  cine: {
    emojiCategory: 'painel',
    emojiKey: 'cine',
    label: 'CineMomozin',
    title: 'CineMomozin',
    description: 'O cantinho dos filmes e séries assistidos na vibe azul de madrugada. TMDB fica preparado para uma versão futura.',
  },
  playlist: {
    emojiCategory: 'painel',
    emojiKey: 'playlist',
    label: 'Playlist',
    title: 'Playlist do casal',
    description: 'Um link salvo manualmente para a trilha sonora de call, saudade e risadas. Spotify API ainda não foi implementada.',
  },
  memorias: {
    emojiCategory: 'painel',
    emojiKey: 'memorias',
    label: 'Memórias',
    title: 'Memórias',
    description: 'Registro dos momentos que viram print mental: datas, descrições e aquele quentinho no coração.',
  },
  estudos: {
    emojiCategory: 'painel',
    emojiKey: 'estudos',
    label: 'Estudos do Kaiki',
    title: 'Estudos do Kaiki',
    description: 'Cronômetro fofo de estudos: inicia, finaliza e transforma foco em MomoCoins.',
  },
  mimos: {
    emojiCategory: 'painel',
    emojiKey: 'mimos',
    label: 'Mimos',
    title: 'Loja de Mimos',
    description: 'A lojinha oficial para trocar MomoCoins por panquequinha, pudinzinho, cartinha e vales especiais.',
  },
  perfil: {
    emojiCategory: 'painel',
    emojiKey: 'perfil',
    label: 'Perfil do casal',
    title: 'Perfil do casal',
    description: 'Resumo azulzinho da Trívia e do Kaiki: apelidos, status, conquistas e contador desde o dia 05.',
  },
};

function createPanelEmbed() {
  return momozinEmbed({
    title: withEmoji('painel', 'main', getText('panel_title', 'Painel Momozin')),
    description: getText('panel_description', 'Bem-vindos ao quartinho azul de madrugada da Trívia e do Kaiki. Escolha uma área nos botões abaixo.'),
    footer: getText('panel_footer', 'Momozin acordado, fofo e levemente engraçadinho.'),
    image: getAssetPublicUrl('panel_main_banner'),
  });
}

function createPanelRows() {
  const buttons = Object.entries(panelAreas).map(([id, area]) => {
    const button = new ButtonBuilder()
      .setCustomId(`panel:${id}`)
      .setLabel(area.label)
      .setStyle(ButtonStyle.Primary);

    const emojiValue = buttonEmoji(area.emojiCategory, area.emojiKey);
    if (emojiValue) button.setEmoji(emojiValue);

    return button;
  });

  return [
    new ActionRowBuilder().addComponents(buttons.slice(0, 4)),
    new ActionRowBuilder().addComponents(buttons.slice(4)),
  ];
}

function createAreaEmbed(areaId) {
  const area = panelAreas[areaId];
  if (!area) return null;
  return momozinEmbed({
    title: withEmoji(area.emojiCategory, area.emojiKey, area.title),
    description: area.description,
  });
}

module.exports = { createPanelEmbed, createPanelRows, createAreaEmbed };
