const { getCoupleSetup } = require('../database/repositories');
const { adminUserId, kaikiUserId, triviaUserId } = require('./config');

const PUBLIC_COMMANDS_WITHOUT_SETUP = new Set(['setup', 'manual', 'painel']);
const PUBLIC_COMMANDS_WITH_SETUP = new Set(['manual']);
const PUBLIC_BUTTON_PREFIXES_WITHOUT_SETUP = ['manual:', 'panel:home', 'panel:manual'];
const PUBLIC_BUTTON_PREFIXES_WITH_SETUP = ['manual:'];

function isAdminUser(userId) {
  return Boolean(adminUserId && userId === adminUserId);
}

function isConfiguredEnvCoupleUser(userId) {
  return Boolean(userId && (userId === triviaUserId || userId === kaikiUserId));
}

function isCoupleUser(userId, setup) {
  return Boolean(setup && (userId === setup.trivia_id || userId === setup.kaiki_id));
}

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

async function isAuthorizedCouple(interaction) {
  const setup = await getCoupleSetup();
  const userId = interaction.user?.id;

  if (isAdminUser(userId)) return { ok: true, setup, reason: 'admin' };
  if (isConfiguredEnvCoupleUser(userId)) return { ok: true, setup, reason: 'env_couple' };

  if (!setup) {
    if (interaction.isChatInputCommand?.()) {
      return { ok: PUBLIC_COMMANDS_WITHOUT_SETUP.has(interaction.commandName), setup };
    }

    const customId = interaction.customId || '';
    return { ok: startsWithAny(customId, PUBLIC_BUTTON_PREFIXES_WITHOUT_SETUP), setup };
  }

  if (isCoupleUser(userId, setup)) return { ok: true, setup, reason: 'db_couple' };

  if (interaction.isChatInputCommand?.()) {
    return { ok: PUBLIC_COMMANDS_WITH_SETUP.has(interaction.commandName), setup };
  }

  const customId = interaction.customId || '';
  return { ok: startsWithAny(customId, PUBLIC_BUTTON_PREFIXES_WITH_SETUP), setup };
}

module.exports = { isAdminUser, isAuthorizedCouple, isConfiguredEnvCoupleUser, isCoupleUser };
