const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { momozinEmbed } = require('../utils/theme');

const panelAreas = {
  recados: {
    label: '💌 Recados',
    title: '💌 Recados do Momozin',
    description: 'Guarda as frases românticas, engraçadinhas e absurdamente específicas que só Trívia e Kaiki entendem.',
  },
  cine: {
    label: '🎬 CineMomozin',
    title: '🎬 CineMomozin',
    description: 'O cantinho dos filmes e séries assistidos na vibe azul de madrugada. TMDB fica preparado para uma versão futura.',
  },
  playlist: {
    label: '🎧 Playlist',
    title: '🎧 Playlist do casal',
    description: 'Um link salvo manualmente para a trilha sonora de call, saudade e risadas. Spotify API ainda não foi implementada.',
  },
  memorias: {
    label: '📸 Memórias',
    title: '📸 Memórias',
    description: 'Registro dos momentos que viram print mental: datas, descrições e aquele quentinho no coração.',
  },
  estudos: {
    label: '📚 Estudos do Kaiki',
    title: '📚 Estudos do Kaiki',
    description: 'Cronômetro fofo de estudos: inicia, finaliza e transforma foco em MomoCoins.',
  },
  mimos: {
    label: '🎁 Mimos',
    title: '🎁 Loja de Mimos',
    description: 'A lojinha oficial para trocar MomoCoins por panquequinha, pudinzinho, cartinha e vales especiais.',
  },
  perfil: {
    label: '💙 Perfil do casal',
    title: '💙 Perfil do casal',
    description: 'Resumo azulzinho da Trívia e do Kaiki: apelidos, status, conquistas e contador desde o dia 05.',
  },
};

function createPanelEmbed() {
  return momozinEmbed({
    title: '💙 Painel Momozin',
    description: 'Bem-vindos ao quartinho azul de madrugada da Trívia e do Kaiki. Escolha uma área nos botões abaixo.',
    footer: 'Momozin acordado, fofo e levemente engraçadinho.',
  });
}

function createPanelRows() {
  const buttons = Object.entries(panelAreas).map(([id, area]) => new ButtonBuilder()
    .setCustomId(`panel:${id}`)
    .setLabel(area.label)
    .setStyle(ButtonStyle.Primary));

  return [
    new ActionRowBuilder().addComponents(buttons.slice(0, 4)),
    new ActionRowBuilder().addComponents(buttons.slice(4)),
  ];
}

function createAreaEmbed(areaId) {
  const area = panelAreas[areaId];
  if (!area) return null;
  return momozinEmbed({ title: area.title, description: area.description });
}

module.exports = { createPanelEmbed, createPanelRows, createAreaEmbed };
