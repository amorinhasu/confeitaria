const { adminUserId, kaikiUserId, pudinzinhoRoleId, triviaUserId } = require('./config');

const PUBLIC_COMMANDS = new Set(['manual']);
const PUBLIC_BUTTON_PREFIXES = ['manual:'];
const PUDINZINHO_ENTRY_CUSTOM_IDS = new Set(['entry:pudinzinho']);

function isAdminUser(userId) {
  return Boolean(adminUserId && userId === adminUserId);
}

function isTriviaUser(userId) {
  return Boolean(triviaUserId && userId === triviaUserId);
}

function isKaikiUser(userId) {
  return Boolean(kaikiUserId && userId === kaikiUserId);
}

function isConfiguredEnvCoupleUser(userId) {
  return Boolean(userId && (isTriviaUser(userId) || isKaikiUser(userId)));
}

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

async function getInteractionMember(interaction) {
  if (interaction.member?.roles) return interaction.member;
  if (!interaction.guild || !interaction.user?.id) return null;

  try {
    return await interaction.guild.members.fetch(interaction.user.id);
  } catch (error) {
    console.error('Erro ao buscar membro para autorização:', error);
    return null;
  }
}

async function hasPudinzinhoRole(interaction) {
  if (!pudinzinhoRoleId) return false;
  const member = await getInteractionMember(interaction);
  return Boolean(member?.roles?.cache?.has(pudinzinhoRoleId));
}

async function isAuthorizedCouple(interaction) {
  const userId = interaction.user?.id;
  const customId = interaction.customId || '';

  if (isAdminUser(userId)) return { ok: true, reason: 'admin' };
  if (PUDINZINHO_ENTRY_CUSTOM_IDS.has(customId)) return { ok: true, reason: 'pudinzinho_entry' };
  if (isTriviaUser(userId)) return { ok: true, reason: 'trivia' };

  if (isKaikiUser(userId)) {
    if (await hasPudinzinhoRole(interaction)) return { ok: true, reason: 'kaiki_pudinzinho' };
    if (PUDINZINHO_ENTRY_CUSTOM_IDS.has(customId)) return { ok: true, reason: 'kaiki_entry' };
    return { ok: false, reason: 'kaiki_needs_pudinzinho' };
  }

  if (interaction.isChatInputCommand?.()) {
    return { ok: PUBLIC_COMMANDS.has(interaction.commandName), reason: 'public_command' };
  }

  return { ok: startsWithAny(customId, PUBLIC_BUTTON_PREFIXES), reason: 'public_component' };
}

module.exports = { hasPudinzinhoRole, isAdminUser, isAuthorizedCouple, isConfiguredEnvCoupleUser, isKaikiUser, isTriviaUser };
