const { SlashCommandBuilder } = require('discord.js');
const { finishStudySession, startStudySession } = require('../database/repositories');
const { formatDuration } = require('../utils/date');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

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
        await respond(interaction, { content: withEmoji('estudos', 'book', getText('study_already_open', 'Já existe uma sessão de estudo aberta. Finalize antes de iniciar outra, panquequinha.')), ephemeral: true });
        return;
      }
      await respond(interaction, { embeds: [momozinEmbed({ title: withEmoji('estudos', 'book', 'Estudo iniciado'), description: getText('study_started', 'Cronômetro ligado para o Kaiki farmar foco e MomoCoins.') })] });
      return;
    }

    const result = await finishStudySession();
    if (!result) {
      await respond(interaction, { content: withEmoji('estudos', 'book', getText('study_not_open', 'Não tem sessão de estudo aberta para finalizar.')), ephemeral: true });
      return;
    }

    await respond(interaction, { embeds: [momozinEmbed({
      title: withEmoji('estudos', 'book', 'Estudo finalizado'),
      description: getText('study_finished_message', 'Kaiki estudou bonito e o Momozin ficou orgulhoso.'),
      fields: [
        { name: 'Tempo', value: formatDuration(result.minutes * 60000), inline: true },
        { name: 'Recompensa', value: `+${result.coinsAwarded} MomoCoins`, inline: true },
        { name: 'Saldo', value: `${result.balance} MomoCoins`, inline: true },
      ],
    })] });
  },
};
