const fs = require('node:fs');
const path = require('node:path');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  commandFiles.forEach((file) => {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`Comando ignorado por formato inválido: ${file}`);
    }
  });
}

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  eventFiles.forEach((file) => {
    const event = require(path.join(eventsPath, file));
    const listener = (...args) => {
      Promise.resolve(event.execute(...args)).catch((error) => {
        console.error(`Erro não tratado no evento ${event.name}:`, error);
      });
    };

    if (event.once) client.once(event.name, listener);
    else client.on(event.name, listener);
  });
}

function getCommandPayloads() {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  return commandFiles.map((file) => require(path.join(commandsPath, file)).data.toJSON());
}

module.exports = { getCommandPayloads, loadCommands, loadEvents };
