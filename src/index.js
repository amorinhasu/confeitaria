const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./utils/config');
const { loadCommands, loadEvents } = require('./utils/loaders');
require('./database/db');

if (!token) {
  console.error('DISCORD_TOKEN não definido no .env. O Momozin não consegue ligar sem token.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

loadCommands(client);
loadEvents(client);

client.login(token);
