const { getAssetPublicUrl } = require('./assets');
const { publishDiaryEmbed, publishToMemoriesChannel } = require('./channels');
const { createPudinzinhoLetterEmbed } = require('./pudinzinhoLetter');

function formatDiaryTimestamp(date = new Date()) {
  return `<t:${Math.floor(date.getTime() / 1000)}:f>`;
}

function getInteractionUserLabel(interaction, fallback = 'Casal Momozin') {
  return interaction.user?.toString?.() || interaction.user?.username || fallback;
}

async function publishLoveNoteSavedDiaryEntry(interaction, text) {
  await publishDiaryEmbed(interaction, {
    title: 'Recado guardado no diário',
    description: text,
    image: getAssetPublicUrl('love_notes_banner'),
    fields: [
      { name: 'Autor', value: getInteractionUserLabel(interaction), inline: true },
      { name: 'Data', value: formatDiaryTimestamp(), inline: true },
    ],
  });
}

async function publishLoveNoteReadDiaryEntry(interaction, note) {
  await publishDiaryEmbed(interaction, {
    title: 'Recado lido no diário',
    description: note.text,
    image: getAssetPublicUrl('love_notes_banner'),
    fields: [
      { name: 'Lido por', value: getInteractionUserLabel(interaction), inline: true },
      { name: 'Data da leitura', value: formatDiaryTimestamp(), inline: true },
      { name: 'Guardado em', value: note.created_at ? formatDiaryTimestamp(new Date(`${note.created_at}Z`)) : 'Data não registrada', inline: true },
    ],
  });
}

async function publishPudinzinhoLetterDiaryEntry(interaction) {
  await publishToMemoriesChannel(interaction, { embeds: [createPudinzinhoLetterEmbed()] });
}

module.exports = {
  formatDiaryTimestamp,
  publishLoveNoteSavedDiaryEntry,
  publishLoveNoteReadDiaryEntry,
  publishPudinzinhoLetterDiaryEntry,
};
