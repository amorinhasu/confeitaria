const { REST, Routes } = require('discord.js');
const { ready } = require('./database/db');
const { clientId, guildId, token } = require('./utils/config');
const { getCommandPayloads } = require('./utils/loaders');

async function deploy() {
  if (!token || !clientId || !guildId) {
    throw new Error('DISCORD_TOKEN, DISCORD_CLIENT_ID e DISCORD_GUILD_ID precisam estar definidos no .env.');
  }

  await ready;

  const commands = getCommandPayloads();
  const rest = new REST({ version: '10' }).setToken(token);

  console.log(`Registrando ${commands.length} slash commands no servidor ${guildId}...`);
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log('Slash commands do Momozin registrados com sucesso.');
}

if (require.main === module) {
  deploy().catch((error) => {
    console.error('Falha ao registrar slash commands:', error);
    process.exit(1);
  });
}

module.exports = { deploy };
