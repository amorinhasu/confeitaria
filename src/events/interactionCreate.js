const { createAreaEmbed } = require('../components/panel');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Erro no comando /${interaction.commandName}:`, error);
        const payload = { content: '💙 O Momozin tropeçou no cobertor azul. Tenta de novo daqui a pouquinho!', ephemeral: true };
        if (interaction.deferred || interaction.replied) await interaction.followUp(payload);
        else await interaction.reply(payload);
      }
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('panel:')) {
      const areaId = interaction.customId.split(':')[1];
      const embed = createAreaEmbed(areaId);
      if (!embed) {
        await interaction.reply({ content: 'Área não encontrada, momo.', ephemeral: true });
        return;
      }
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
