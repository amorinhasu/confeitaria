const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { ready } = require('./database/db');
const { token } = require('./utils/config');
const { loadCommands, loadEvents } = require('./utils/loaders');

async function start() {
  if (!token) {
    console.error('DISCORD_TOKEN não definido no .env. O Momozin não consegue ligar sem token.');
    process.exit(1);
  }

  await ready;

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();

  loadCommands(client);
  loadEvents(client);

  await client.login(token);
}

start().catch((error) => {
  console.error('Erro ao ligar o Momozin:', error);
  process.exit(1);
});
