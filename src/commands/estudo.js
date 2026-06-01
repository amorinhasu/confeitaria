const { SlashCommandBuilder } = require('discord.js');
const { finishStudySession, startStudySession } = require('../database/repositories');
const { formatDuration } = require('../utils/date');
const { momozinEmbed } = require('../utils/theme');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('estudo')
    .setDescription('Controla sessões de estudo do Kaiki.')
    .addSubcommand((subcommand) => subcommand
      .setName('iniciar')
      .setDescription('Inicia uma sessão de estudo do Kaiki.'))
    .addSubcommand((subcommand) => subcommand
      .setName('finalizar')
      .setDescription('Finaliza a sessão e recompensa com MomoCoins.')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'iniciar') {
      const result = await startStudySession();
      if (!result.created) {
        await interaction.reply({ content: '📚 Já existe uma sessão de estudo aberta. Finalize antes de iniciar outra, panquequinha.', ephemeral: true });
        return;
      }
      await interaction.reply({ embeds: [momozinEmbed({ title: '📚 Estudo iniciado', description: 'Cronômetro ligado para o Kaiki farmar foco e MomoCoins.' })] });
      return;
    }

    const result = await finishStudySession();
    if (!result) {
      await interaction.reply({ content: '📚 Não tem sessão de estudo aberta para finalizar.', ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [momozinEmbed({
      title: '📚 Estudo finalizado',
      description: 'Kaiki estudou bonito e o Momozin ficou orgulhoso.',
      fields: [
        { name: 'Tempo', value: formatDuration(result.minutes * 60000), inline: true },
        { name: 'Recompensa', value: `+${result.coinsAwarded} MomoCoins`, inline: true },
        { name: 'Saldo', value: `${result.balance} MomoCoins`, inline: true },
      ],
    })] });
  },
};
