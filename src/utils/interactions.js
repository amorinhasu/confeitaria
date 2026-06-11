const DEFER_PROMISE = Symbol('momozinDeferPromise');

function withoutEphemeral(options) {
  if (!options || typeof options !== 'object' || !('ephemeral' in options)) return options;
  const { ephemeral, ...rest } = options;
  return rest;
}

function scheduleDefer(interaction, commandName, delay = 1500) {
  const timer = setTimeout(() => {
    if (interaction.deferred || interaction.replied || interaction[DEFER_PROMISE]) return;

    interaction[DEFER_PROMISE] = interaction.deferReply().catch((error) => {
      console.error(`Erro ao deferir comando: ${commandName}`, error);
      return false;
    });
  }, delay);

  return () => clearTimeout(timer);
}

async function waitForPendingDefer(interaction) {
  if (!interaction[DEFER_PROMISE]) return;

  try {
    await interaction[DEFER_PROMISE];
  } finally {
    delete interaction[DEFER_PROMISE];
  }
}

async function respond(interaction, options) {
  await waitForPendingDefer(interaction);

  if (interaction.deferred) {
    return interaction.editReply(withoutEphemeral(options));
  }

  if (interaction.replied) {
    return interaction.followUp(options);
  }

  return interaction.reply(options);
}

async function respondEphemeral(interaction, content) {
  const payload = typeof content === 'string' ? { content } : content;
  const ephemeralPayload = { ...payload, ephemeral: true };

  await waitForPendingDefer(interaction);

  if (interaction.deferred) {
    try {
      await interaction.deleteReply();
    } catch (deleteError) {
      console.error('Não foi possível apagar a resposta deferida antes do erro:', deleteError);
    }
    return interaction.followUp(ephemeralPayload);
  }

  if (interaction.replied) {
    return interaction.followUp(ephemeralPayload);
  }

  return interaction.reply(ephemeralPayload);
}

module.exports = { respond, respondEphemeral, scheduleDefer };
