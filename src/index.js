const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { ready } = require('./database/db');
const { ensureInitialCoupleMemory } = require('./database/repositories');
const { deploy } = require('./deploy-commands');
const { token } = require('./utils/config');
const { loadCommands, loadEvents } = require('./utils/loaders');

async function start() {
  if (!token) {
    console.error('DISCORD_TOKEN não definido no .env. O Momozin não consegue ligar sem token.');
    process.exit(1);
  }

  await ready;
  await ensureInitialCoupleMemory();

  if (process.env.AUTO_DEPLOY_COMMANDS === 'true') {
    console.log('AUTO_DEPLOY_COMMANDS=true detectado. Registrando slash commands antes de iniciar o bot...');
    await deploy();
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
  client.commands = new Collection();

  loadCommands(client);
  loadEvents(client);

  await client.login(token);
}

start().catch((error) => {
  console.error('Erro ao ligar o Momozin:', error);
  process.exit(1);
});
