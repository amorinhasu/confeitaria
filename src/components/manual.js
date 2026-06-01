const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji, withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');

const manualCategories = {
  recados: {
    emojiCategory: 'painel', emojiKey: 'recados', label: 'Recados', title: 'Recados do Amor',
    description: 'Guarde mensagens para o futuro: saudade, carinho, piada interna e aquele quentinho de madrugada.',
    commands: ['/recado adicionar', '/recado sortear'],
    examples: ['Quando estiver triste', 'Quando sentir saudade', 'Quando precisar sorrir'],
  },
  memorias: {
    emojiCategory: 'painel', emojiKey: 'memorias', label: 'Memórias', title: 'Memórias',
    description: 'Guarde momentos importantes do casal para não deixar nada bonito se perder.',
    commands: ['/memoria adicionar'],
    examples: ['Primeiro eu te amo', 'Primeiro filme', 'Primeira call', 'Data especial'],
  },
  cine: {
    emojiCategory: 'painel', emojiKey: 'cine', label: 'CineMomozin', title: 'CineMomozin',
    description: 'Registre filmes e séries assistidos juntinhos, com notas e comentários do casal.',
    commands: ['/cine adicionar'],
    examples: ['Nome', 'Plataforma', 'Notas', 'Comentário'],
  },
  playlist: {
    emojiCategory: 'painel', emojiKey: 'playlist', label: 'Playlist', title: 'Playlist',
    description: 'Salve a playlist oficial do casal, sem Spotify API por enquanto: só link e amor.',
    commands: ['/playlist definir', '/playlist ver'],
    examples: ['Link da playlist', 'Música da call', 'Trilha de saudade'],
  },
  estudos: {
    emojiCategory: 'painel', emojiKey: 'estudos', label: 'Estudos', title: 'Estudos',
    description: 'Acompanhe sessões de foco do Kaiki e transforme estudo em MomoCoins.',
    commands: ['/estudo iniciar', '/estudo finalizar'],
    examples: ['Iniciar foco', 'Finalizar sessão', 'Ver progresso pelo painel'],
  },
  momocoins: {
    emojiCategory: 'momocoins', emojiKey: 'coin', label: 'MomoCoins', title: 'MomoCoins',
    description: 'Moeda oficial da confeitaria para trocar por mimos e recompensas fofas.',
    commands: ['/moedas ver', '/moedas adicionar'],
    examples: ['Ver saldo', 'Ganhar por estudo', 'Comprar mimo'],
  },
  mimos: {
    emojiCategory: 'painel', emojiKey: 'mimos', label: 'Mimos', title: 'Mimos',
    description: 'Troque moedas por presentes: panquequinha, pudinzinho, cartinha e vales.',
    commands: ['/mimo loja', '/mimo comprar'],
    examples: ['Abrir loja', 'Comprar vale filme', 'Comprar carinho'],
  },
  perfil: {
    emojiCategory: 'painel', emojiKey: 'perfil', label: 'Perfil', title: 'Perfil',
    description: 'Veja a história do casal, apelidos, status, conquistas e contador desde o dia 05.',
    commands: ['/perfil'],
    examples: ['Ver status', 'Ver conquistas', 'Ver contador'],
  },
};

function makeButton(id, label, category, key, style = ButtonStyle.Primary) {
  const button = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
  const emojiValue = buttonEmoji(category, key);
  if (emojiValue) button.setEmoji(emojiValue);
  return button;
}

function createManualHomeEmbed() {
  return momozinEmbed({
    title: withEmoji('manual', 'home', getText('manual_intro_title', 'Manual do Momozin')),
    description: getText('manual_intro_description', 'Olá, Trívia e Kaiki!\n\nBem-vindos ao cantinho de vocês.\nEscolha uma categoria abaixo.'),
    image: getAssetPublicUrl('manual_home_banner'),
  });
}

function createManualHomeRows() {
  const buttons = Object.entries(manualCategories).map(([id, category]) => makeButton(`manual:${id}`, category.label, category.emojiCategory, category.emojiKey));
  return [
    new ActionRowBuilder().addComponents(buttons.slice(0, 4)),
    new ActionRowBuilder().addComponents(buttons.slice(4, 8)),
  ];
}

function createManualCategoryEmbed(categoryId) {
  const category = manualCategories[categoryId];
  if (!category) return null;

  return momozinEmbed({
    title: withEmoji(category.emojiCategory, category.emojiKey, category.title),
    description: category.description,
    image: getAssetPublicUrl('manual_category_banner'),
    fields: [
      { name: 'Comandos', value: category.commands.map((command) => `• ${command}`).join('\n'), inline: false },
      { name: 'Exemplos', value: category.examples.map((example) => `• ${example}`).join('\n'), inline: false },
    ],
  });
}

function createManualNavigationRows() {
  return [new ActionRowBuilder().addComponents(
    makeButton('manual:home', 'Início', 'manual', 'start', ButtonStyle.Secondary),
    makeButton('manual:back', 'Voltar', 'manual', 'back', ButtonStyle.Secondary),
  )];
}

module.exports = { createManualCategoryEmbed, createManualHomeEmbed, createManualHomeRows, createManualNavigationRows, manualCategories };
