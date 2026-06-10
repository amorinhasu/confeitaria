const fs = require('node:fs');
const path = require('node:path');

const dotenvDirectory = path.resolve(process.cwd(), 'node_modules', 'dotenv');
if (fs.existsSync(dotenvDirectory)) require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || './data/momozin.sqlite';
const defaultKaikiUserId = '993955981220388894';
const defaultPudinzinhoRoleId = '1509920102911311943';

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  tmdbApiKey: process.env.TMDB_API_KEY,
  adminUserId: process.env.ADMIN_USER_ID,
  triviaUserId: process.env.TRIVIA_USER_ID,
  kaikiUserId: process.env.KAIKI_USER_ID || defaultKaikiUserId,
  pudinzinhoRoleId: process.env.PUDINZINHO_ROLE_ID || defaultPudinzinhoRoleId,
  commandsChannelId: process.env.COMMANDS_CHANNEL_ID,
  memoriesChannelId: process.env.MEMORIES_CHANNEL_ID,
  databasePath: path.resolve(process.cwd(), databaseUrl),
};
