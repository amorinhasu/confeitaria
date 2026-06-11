const { kaikiUserId, pudinzinhoRoleId } = require('./config');
const { getText } = require('./texts');

function getPermissionFlagsBits() {
  return require('discord.js').PermissionFlagsBits;
}

function canUsePudinzinhoButton(userId) {
  return Boolean(kaikiUserId && userId === kaikiUserId);
}

function compareRolePosition(botMember, role) {
  if (!botMember || !role) return null;
  return botMember.roles.highest.comparePositionTo(role);
}

async function getPudinzinhoRoleDiagnostics(guild) {
  const diagnostics = {
    configured: Boolean(pudinzinhoRoleId),
    found: false,
    botCanManageRoles: false,
    botAboveRole: false,
    roleName: null,
    error: null,
  };

  if (!guild || !pudinzinhoRoleId) return diagnostics;

  try {
    const role = await guild.roles.fetch(pudinzinhoRoleId);
    diagnostics.found = Boolean(role);
    diagnostics.roleName = role?.name || null;

    const botMember = guild.members.me || await guild.members.fetchMe();
    diagnostics.botCanManageRoles = Boolean(botMember.permissions.has(getPermissionFlagsBits().ManageRoles));
    diagnostics.botAboveRole = role ? compareRolePosition(botMember, role) > 0 : false;
  } catch (error) {
    diagnostics.error = error.message;
  }

  return diagnostics;
}

async function givePudinzinhoRole(interaction) {
  if (!canUsePudinzinhoButton(interaction.user?.id)) {
    return { ok: false, code: 'reserved', message: getText('pudinzinho_reserved', 'Esse botão é reservado para o Kaiki virar Pudinzinho.') };
  }

  if (!pudinzinhoRoleId) {
    return { ok: false, code: 'missing_config', message: getText('pudinzinho_role_missing', 'O cargo Pudinzinho ainda não foi configurado no ambiente.') };
  }

  if (!interaction.guild) {
    return { ok: false, code: 'missing_guild', message: 'Esse botão só funciona dentro do servidor.' };
  }

  const role = await interaction.guild.roles.fetch(pudinzinhoRoleId);
  if (!role) {
    return { ok: false, code: 'role_not_found', message: getText('pudinzinho_role_missing', 'O cargo Pudinzinho ainda não foi configurado no ambiente.') };
  }

  const botMember = interaction.guild.members.me || await interaction.guild.members.fetchMe();
  if (!botMember.permissions.has(getPermissionFlagsBits().ManageRoles)) {
    return { ok: false, code: 'missing_permission', message: getText('pudinzinho_permission_error', 'Não consegui entregar o cargo. Verifique se o bot tem Gerenciar Cargos e está acima do cargo Pudinzinho.') };
  }

  if (compareRolePosition(botMember, role) <= 0) {
    return { ok: false, code: 'role_above_bot', message: getText('pudinzinho_role_above_bot', 'O cargo Pudinzinho está acima ou no mesmo nível do cargo do bot. Suba o cargo do bot na hierarquia.') };
  }

  const member = interaction.member?.roles?.add ? interaction.member : await interaction.guild.members.fetch(interaction.user.id);
  if (member.roles.cache.has(pudinzinhoRoleId)) {
    return { ok: true, code: 'already', message: getText('pudinzinho_already', 'Kaiki já é Pudinzinho.') };
  }

  try {
    await member.roles.add(role, 'Momozin: botão Virar Pudinzinho');
    return { ok: true, code: 'added', message: getText('pudinzinho_success', 'Pronto. Kaiki agora está com o cargo Pudinzinho.') };
  } catch (error) {
    console.error('Erro ao adicionar cargo Pudinzinho:', error);
    return { ok: false, code: 'add_failed', message: getText('pudinzinho_permission_error', 'Não consegui entregar o cargo. Verifique se o bot tem Gerenciar Cargos e está acima do cargo Pudinzinho.') };
  }
}

module.exports = { canUsePudinzinhoButton, getPudinzinhoRoleDiagnostics, givePudinzinhoRole };
