const { adminUserId, kaikiUserId, triviaUserId } = require('./config');

const PUBLIC_COMMANDS = new Set(['manual', 'painel']);
const PUBLIC_BUTTON_PREFIXES = ['manual:', 'panel:home', 'panel:manual'];

function isAdminUser(userId) {
  return Boolean(adminUserId && userId === adminUserId);
}

function isConfiguredEnvCoupleUser(userId) {
  return Boolean(userId && (userId === triviaUserId || userId === kaikiUserId));
}

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

async function isAuthorizedCouple(interaction) {
  const userId = interaction.user?.id;

  if (isAdminUser(userId)) return { ok: true, reason: 'admin' };
  if (isConfiguredEnvCoupleUser(userId)) return { ok: true, reason: 'env_couple' };

  if (interaction.isChatInputCommand?.()) {
    return { ok: PUBLIC_COMMANDS.has(interaction.commandName), reason: 'public_command' };
  }

  const customId = interaction.customId || '';
  return { ok: startsWithAny(customId, PUBLIC_BUTTON_PREFIXES), reason: 'public_component' };
}

module.exports = { isAdminUser, isAuthorizedCouple, isConfiguredEnvCoupleUser };
