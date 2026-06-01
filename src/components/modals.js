const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
function input(customId, label, style = TextInputStyle.Short, required = true, placeholder) {
  const field = new TextInputBuilder().setCustomId(customId).setLabel(label).setStyle(style).setRequired(required);
  if (placeholder) field.setPlaceholder(placeholder);
  return new ActionRowBuilder().addComponents(field);
}

function createLoveNoteModal() {
  return new ModalBuilder()
    .setCustomId('modal:recados:add')
    .setTitle('Adicionar recado')
    .addComponents(input('text', 'Texto do recado', TextInputStyle.Paragraph, true, 'Escreva algo fofo, engraçado ou de madrugada...'));
}

function createMemoryModal() {
  return new ModalBuilder()
    .setCustomId('modal:memorias:add')
    .setTitle('Adicionar memória')
    .addComponents(
      input('title', 'Título', TextInputStyle.Short, true, 'Primeira call'),
      input('description', 'Descrição', TextInputStyle.Paragraph, true, 'Conta o momento do jeitinho de vocês'),
      input('date', 'Data', TextInputStyle.Short, true, '2026-06-01'),
    );
}

function createMovieModal() {
  return new ModalBuilder()
    .setCustomId('modal:cine:add')
    .setTitle('Adicionar CineMomozin')
    .addComponents(
      input('name', 'Nome', TextInputStyle.Short, true, 'Filme ou série'),
      input('type', 'Tipo', TextInputStyle.Short, true, 'Filme, série, anime...'),
      input('platform', 'Plataforma', TextInputStyle.Short, true, 'Netflix, Discord, cinema...'),
      input('triviaRating', 'Nota da Trívia', TextInputStyle.Short, true, '0 a 10'),
      input('kaikiRating', 'Nota do Kaiki', TextInputStyle.Short, true, '0 a 10'),
    );
}

function createPlaylistModal() {
  return new ModalBuilder()
    .setCustomId('modal:playlist:set')
    .setTitle('Definir playlist')
    .addComponents(input('link', 'Link da playlist', TextInputStyle.Short, true, 'https://...'));
}

function createGiftModal() {
  return new ModalBuilder()
    .setCustomId('modal:mimos:buy')
    .setTitle('Comprar mimo')
    .addComponents(input('item', 'Item', TextInputStyle.Short, true, 'panquequinha, pudinzinho, cartinha...'));
}

module.exports = { createGiftModal, createLoveNoteModal, createMemoryModal, createMovieModal, createPlaylistModal };
