const { SlashCommandBuilder } = require('discord.js');
const { addLoveNote, getRandomLoveNote } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { publishLoveNoteReadDiaryEntry, publishLoveNoteSavedDiaryEntry } = require('../utils/diary');
const { normalizeImageUrl } = require('../utils/images');
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
      .addStringOption((option) => option.setName('texto').setDescription('Texto do recado.').setRequired(true))
      .addStringOption((option) => option.setName('image_url').setDescription('URL opcional de imagem para o recado.').setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('sortear')
      .setDescription('Sorteia um recado salvo como frase do dia.')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'adicionar') {
      const text = interaction.options.getString('texto', true);
      const imageUrl = normalizeImageUrl(interaction.options.getString('image_url'));
      await addLoveNote(text, imageUrl);
      await respond(interaction, { embeds: [momozinEmbed({ title: 'Recado salvo', description: getText('recado_saved', 'O Momozin guardou essa frase no potinho azul.'), image: imageUrl || getAssetPublicUrl('love_notes_banner') })] });
      await publishLoveNoteSavedDiaryEntry(interaction, text, imageUrl);
      return;
    }

    const note = await getRandomLoveNote();
    if (!note) {
      await respond(interaction, { content: withEmoji('recados', 'letter', getText('recado_empty', 'Ainda não tem recados salvos. Use `/recado adicionar` primeiro.')), ephemeral: true });
      return;
    }

    await respond(interaction, { embeds: [momozinEmbed({ title: 'Frase do dia', description: note.text, image: note.image_url || getAssetPublicUrl('love_notes_banner') })] });
    await publishLoveNoteReadDiaryEntry(interaction, note);
  },
};
