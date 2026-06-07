const { SlashCommandBuilder } = require('discord.js');
const { addLoveNote, getRandomLoveNote } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recado')
    .setDescription('Gerencia recados românticos ou engraçados.')
    .addSubcommand((subcommand) => subcommand
      .setName('adicionar')
      .setDescription('Salva uma mensagem romântica ou engraçada.')
      .addStringOption((option) => option.setName('texto').setDescription('Texto do recado.').setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('sortear')
      .setDescription('Sorteia um recado salvo como frase do dia.')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'adicionar') {
      const text = interaction.options.getString('texto', true);
      await addLoveNote(text);
      await respond(interaction, { embeds: [momozinEmbed({ title: 'Recado salvo', description: getText('recado_saved', 'O Momozin guardou essa frase no potinho azul.'), image: getAssetPublicUrl('love_notes_banner') })] });
      return;
    }

    const note = await getRandomLoveNote();
    if (!note) {
      await respond(interaction, { content: withEmoji('recados', 'letter', getText('recado_empty', 'Ainda não tem recados salvos. Use `/recado adicionar` primeiro.')), ephemeral: true });
      return;
    }

    await respond(interaction, { embeds: [momozinEmbed({ title: 'Frase do dia', description: note.text, image: getAssetPublicUrl('love_notes_banner') })] });
  },
};
