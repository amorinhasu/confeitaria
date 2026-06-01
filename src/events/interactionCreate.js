const { createAreaEmbed } = require('../components/panel');
const { respondEphemeral, scheduleDefer } = require('../utils/interactions');
const { withEmoji } = require('../utils/emojis');
const { getText } = require('../utils/texts');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName;
      const command = interaction.client.commands.get(commandName);

      console.log(`Comando recebido: ${commandName}`);

      if (!command) {
        await interaction.reply({ content: withEmoji('feedback', 'error', getText('unknown_command_error', 'Esse comando não foi encontrado no caderninho do Momozin.')), ephemeral: true });
        return;
      }

      const cancelDefer = scheduleDefer(interaction, commandName);

      try {
        await command.execute(interaction);
        cancelDefer();
        console.log(`Comando executado com sucesso: ${commandName}`);
      } catch (error) {
        cancelDefer();
        console.error(`Erro ao executar comando: ${commandName}`, error);
        await respondEphemeral(interaction, withEmoji('feedback', 'error', getText('generic_command_error', 'O Momozin tropeçou no cobertor azul. Tenta de novo daqui a pouquinho!')));
      }
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('panel:')) {
      try {
        const areaId = interaction.customId.split(':')[1];
        const embed = createAreaEmbed(areaId);
        if (!embed) {
          await interaction.reply({ content: withEmoji('feedback', 'warning', 'Área não encontrada, momo.'), ephemeral: true });
          return;
        }
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error('Erro ao responder botão do painel:', error);
        await respondEphemeral(interaction, withEmoji('feedback', 'error', getText('panel_button_error', 'Não consegui abrir essa área agora, momo. Tenta de novo já já!')));
      }
    }
  },
};
