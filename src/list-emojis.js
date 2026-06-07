const { REST, Routes } = require('discord.js');
const { guildId, token } = require('./utils/config');

async function listGuildEmojis() {
  if (!token || !guildId) {
    throw new Error('DISCORD_TOKEN e DISCORD_GUILD_ID precisam estar definidos para listar emojis do servidor.');
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const emojis = await rest.get(Routes.guildEmojis(guildId));

  if (emojis.length === 0) {
    console.log('Nenhum emoji customizado encontrado no servidor.');
    return;
  }

  console.log('Emojis customizados disponíveis no servidor:');
  emojis.forEach((item) => {
    const rendered = `<${item.animated ? 'a' : ''}:${item.name}:${item.id}>`;
    console.log(`- ${item.name} | id=${item.id} | animated=${item.animated} | ${rendered}`);
  });
}

listGuildEmojis().catch((error) => {
  console.error('Falha ao listar emojis do servidor:', error);
  process.exit(1);
});
