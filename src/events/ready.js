const { guildId } = require('../utils/config');
const { configureAvailableEmojis } = require('../utils/emojis');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Momozin ligado como ${client.user.tag}.`);

    try {
      if (!guildId) {
        configureAvailableEmojis([]);
        console.warn('DISCORD_GUILD_ID não definido; emojis customizados usarão fallback Unicode.');
        return;
      }

      const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);
      const emojis = await guild.emojis.fetch();
      const result = configureAvailableEmojis(emojis.values());
      console.log(`Emojis do servidor auditados: ${result.available} disponível(is).`);
    } catch (error) {
      configureAvailableEmojis([]);
      console.error('Não foi possível auditar emojis do servidor; usando fallback Unicode para evitar texto cru de emoji e COMPONENT_INVALID_EMOJI.', error);
    }
  },
};
