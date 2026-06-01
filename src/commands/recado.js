const { SlashCommandBuilder } = require('discord.js');
const { addLoveNote, getRandomLoveNote } = require('../database/repositories');
const { momozinEmbed } = require('../utils/theme');

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
      addLoveNote(text);
      await interaction.reply({ embeds: [momozinEmbed({ title: '💌 Recado salvo', description: 'O Momozin guardou essa frase no potinho azul.' })] });
      return;
    }

    const note = getRandomLoveNote();
    if (!note) {
      await interaction.reply({ content: '💌 Ainda não tem recados salvos. Use `/recado adicionar` primeiro.', ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [momozinEmbed({ title: '💌 Frase do dia', description: note.text })] });
  },
};
