const fs = require('node:fs');
const path = require('node:path');

const dotenvDirectory = path.resolve(process.cwd(), 'node_modules', 'dotenv');
if (fs.existsSync(dotenvDirectory)) require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || './data/momozin.sqlite';

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  tmdbApiKey: process.env.TMDB_API_KEY,
  adminUserId: process.env.ADMIN_USER_ID,
  triviaUserId: process.env.TRIVIA_USER_ID,
  kaikiUserId: process.env.KAIKI_USER_ID,
  pudinzinhoRoleId: process.env.PUDINZINHO_ROLE_ID,
  databasePath: path.resolve(process.cwd(), databaseUrl),
};
