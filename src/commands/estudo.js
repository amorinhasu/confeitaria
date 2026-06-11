const { SlashCommandBuilder } = require('discord.js');
const { finishStudySession, pauseStudySession, resumeStudySession, startStudySession } = require('../database/repositories');
const { updateStudyStatusMessage } = require('../components/studyStatus');
const { getAssetPublicUrl } = require('../utils/assets');
const { formatDuration, formatDurationAllowZero } = require('../utils/date');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');
const { respond } = require('../utils/interactions');

function studySubjectText(subject) {
  return subject || 'Sem tema definido';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('estudo')
    .setDescription('Controla sessões de foco do casal.')
    .addSubcommand((subcommand) => subcommand
      .setName('iniciar')
      .setDescription('Inicia uma sessão de foco do casal.')
      .addStringOption((option) => option.setName('tema').setDescription('O que você vai estudar hoje?').setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('pausar')
      .setDescription('Pausa a sessão aberta.')
      .addStringOption((option) => option
        .setName('tipo')
        .setDescription('Tipo de pausa.')
        .setRequired(false)
        .addChoices(
          { name: 'Pausa para Água', value: 'water' },
          { name: 'Pausa para Grude', value: 'grude' },
        )))
    .addSubcommand((subcommand) => subcommand
      .setName('retomar')
      .setDescription('Retoma uma sessão pausada.'))
    .addSubcommand((subcommand) => subcommand
      .setName('finalizar')
      .setDescription('Finaliza a sessão e recompensa com MomoCoins.')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'iniciar') {
      const subject = interaction.options.getString('tema') || null;
      const result = await startStudySession(subject, interaction.user.id);
      if (!result.created) {
        await respond(interaction, { content: withEmoji('estudos', 'book', getText('study_already_open', 'Já existe uma sessão de estudo aberta. Finalize antes de iniciar outra, panquequinha.')), ephemeral: true });
        return;
      }
      await respond(interaction, { embeds: [momozinEmbed({
        title: 'Estudo iniciado',
        description: getText('study_started', 'Cronômetro ligado para o foco do casal render MomoCoins.'),
        image: getAssetPublicUrl('study_banner'),
        fields: [{ name: 'Tema', value: studySubjectText(result.session.subject), inline: false }],
      })] });
      await updateStudyStatusMessage(interaction);
      return;
    }

    if (subcommand === 'pausar') {
      const kind = interaction.options.getString('tipo') || 'water';
      const result = await pauseStudySession(kind);
      if (!result.ok) {
        await respond(interaction, { content: withEmoji('estudos', 'book', result.reason === 'already_paused' ? 'A sessão já está pausada. Use `/estudo retomar` quando quiser voltar.' : getText('study_not_open', 'Não tem sessão de estudo aberta para finalizar.')), ephemeral: true });
        return;
      }
      await updateStudyStatusMessage(interaction);
      await respond(interaction, { embeds: [momozinEmbed({ title: kind === 'grude' ? 'Pausa para Grude' : 'Pausa para Água', description: kind === 'grude' ? 'Pausa liberada para grudar um pouquinho sem perder o foco.' : 'Pausa registrada. Bebe uma água e volta com calma.', image: getAssetPublicUrl('study_banner') })] });
      return;
    }

    if (subcommand === 'retomar') {
      const result = await resumeStudySession();
      if (!result.ok) {
        await respond(interaction, { content: withEmoji('estudos', 'book', result.reason === 'not_paused' ? 'A sessão não está pausada agora.' : getText('study_not_open', 'Não tem sessão de estudo aberta para finalizar.')), ephemeral: true });
        return;
      }
      await updateStudyStatusMessage(interaction);
      await respond(interaction, { embeds: [momozinEmbed({ title: 'Foco retomado', description: `Voltamos. Tempo em pausa: ${formatDurationAllowZero(result.pauseSeconds * 1000)}.`, image: getAssetPublicUrl('study_banner') })] });
      return;
    }

    const result = await finishStudySession();
    if (!result) {
      await respond(interaction, { content: withEmoji('estudos', 'book', getText('study_not_open', 'Não tem sessão de estudo aberta para finalizar.')), ephemeral: true });
      return;
    }

    const embedPayload = {
      title: 'Estudo finalizado',
      description: `${getText('study_finished_message', 'Sessão finalizada com carinho. O Momozin ficou orgulhoso do foco do casal.')}`,
      image: getAssetPublicUrl('study_banner'),
      fields: [
        { name: 'Tempo efetivo', value: formatDuration(result.minutes * 60000), inline: true },
        { name: 'Tempo total', value: formatDurationAllowZero((result.totalSeconds || result.minutes * 60) * 1000), inline: true },
        { name: 'Tema', value: studySubjectText(result.subject), inline: true },
        { name: 'Pausas', value: `${result.pauseCount || 0} pausa(s)`, inline: true },
        { name: 'Tempo em pausas', value: formatDurationAllowZero((result.pausedSeconds || 0) * 1000), inline: true },
        { name: 'Recompensa', value: `+${result.coinsAwarded} MomoCoins`, inline: true },
        { name: 'Saldo', value: `${result.balance} MomoCoins`, inline: true },
      ],
    };
    await respond(interaction, { embeds: [momozinEmbed(embedPayload)] });
    await updateStudyStatusMessage(interaction);
  },
};
