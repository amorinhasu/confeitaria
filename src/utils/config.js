const path = require('node:path');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || './data/momozin.sqlite';

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  tmdbApiKey: process.env.TMDB_API_KEY,
  databasePath: path.resolve(process.cwd(), databaseUrl),
};
