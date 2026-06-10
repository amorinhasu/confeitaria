const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { createManualHomeEmbed, createManualHomeRows, createManualPageEmbed, createManualPageRows, getManualPage } = require('../components/manual');
const { createAdminEmbed, createAdminRows } = require('../components/admin');
const { createAreaEmbed, createAreaRows, createPanelEmbed, createPanelRows } = require('../components/panel');
const { createGiftModal, createLoveNoteModal, createMemoryModal, createMovieModal, createPlaylistModal } = require('../components/modals');
const {
  addLoveNote,
  addMemory,
  addMovie,
  updateMemoryImage,
  buyGift,
  countLoveNotes,
  finishStudySession,
  getCoins,
  getPlaylist,
  getProfile,
  getRandomLoveNote,
  getRecentCoinTransactions,
  getStudyStats,
  giftsCatalog,
  listMemories,
  listMovies,
  setPlaylist,
  startStudySession,
} = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { isAdminUser, isAuthorizedCouple } = require('../utils/authorization');
const { enforceCommandsChannel, publishDiaryEmbed } = require('../utils/channels');
const { formatCoinTransactions } = require('../utils/coins');
const { profileEmbed, studyStatsEmbed } = require('../utils/embeds');
const { publishLoveNoteReadDiaryEntry, publishLoveNoteSavedDiaryEntry, publishPudinzinhoLetterDiaryEntry } = require('../utils/diary');
const { createPudinzinhoLetterEmbed } = require('../utils/pudinzinhoLetter');
const { givePudinzinhoRole } = require('../utils/pudinzinhoRole');
const { buttonEmoji, withEmoji } = require('../utils/emojis');
const { getImageAttachmentUrl } = require('../utils/images');
const { respondEphemeral, scheduleDefer } = require('../utils/interactions');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');



async function publishMemoryDiaryEntry(interaction, memory) {
  await publishDiaryEmbed(interaction, {
    title: `Memória registrada: ${memory.title}`,
    description: `Data: ${memory.memory_date}

${memory.description}`,
    image: memory.image_url || getAssetPublicUrl('memories_banner'),
  });
}

async function publishMovieDiaryEntry(interaction, movie) {
  await publishDiaryEmbed(interaction, {
    title: `CineMomozin: ${movie.name}`,
    description: movie.comment || 'Novo filme/série registrado no CineMomozin.',
    image: getAssetPublicUrl('cine_banner'),
    fields: [
      { name: 'Tipo', value: movie.type, inline: true },
      { name: 'Plataforma', value: movie.platform, inline: true },
      { name: 'Notas', value: `Trívia: ${movie.triviaRating}/10
Kaiki: ${movie.kaikiRating}/10`, inline: true },
    ],
  });
}

async function publishPlaylistDiaryEntry(interaction, link) {
  await publishDiaryEmbed(interaction, {
    title: 'Playlist atualizada',
    description: link,
    image: getAssetPublicUrl('playlist_banner'),
  });
}

async function publishCoinsDiaryEntry(interaction, { title, description }) {
  await publishDiaryEmbed(interaction, { title, description, image: getAssetPublicUrl('coins_banner') });
}

async function publishGiftDiaryEntry(interaction, result) {
  await publishDiaryEmbed(interaction, {
    title: 'Mimo comprado',
    description: `${result.item.labelText} ${getText('gift_bought', 'resgatado com sucesso!')}
Saldo restante: ${result.balance} MomoCoins`,
    image: getAssetPublicUrl('gifts_banner'),
  });
}

async function publishAchievementDiaryEntry(interaction, { title, description }) {
  await publishDiaryEmbed(interaction, { title, description, image: getAssetPublicUrl('profile_banner') });
}

function createMemoryEmbed(memory, useBannerFallback = false) {
  return momozinEmbed({
    title: memory.title,
    description: `Data: ${memory.memory_date}\n\n${memory.description}`,
    image: memory.image_url || (useBannerFallback ? getAssetPublicUrl('memories_banner') : undefined),
  });
}

function createMemoryListPayload(memories) {
  if (!memories.length) {
    return { embeds: [momozinEmbed({ title: 'Últimas memórias', description: 'Ainda não tem memórias no mural azul.', image: getAssetPublicUrl('memories_banner') })] };
  }

  if (!memories.some((memory) => memory.image_url)) {
    return { embeds: [momozinEmbed({
      title: 'Últimas memórias',
      description: memories.map((memory) => `**${memory.title}** (${memory.memory_date})\n${memory.description}`).join('\n\n'),
      image: getAssetPublicUrl('memories_banner'),
    })] };
  }

  return { embeds: memories.slice(0, 5).map((memory) => createMemoryEmbed(memory, true)) };
}

async function collectOptionalMemoryImage(interaction, memoryId, memoryData) {
  if (!interaction.channel?.awaitMessages) {
    await publishMemoryDiaryEntry(interaction, memoryData);
    return;
  }

  let imageUrl = null;

  const filter = (message) => {
    if (message.author.id !== interaction.user.id) return false;
    return message.attachments.some((attachment) => Boolean(getImageAttachmentUrl(attachment)));
  };

  try {
    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const message = collected.first();
    const attachment = message?.attachments.find((item) => Boolean(getImageAttachmentUrl(item)));
    imageUrl = getImageAttachmentUrl(attachment);
    if (!imageUrl) return;

    await updateMemoryImage(memoryId, imageUrl);
    await interaction.followUp({ content: 'Imagem anexada à memória com sucesso.', ephemeral: true });
  } catch {
    // Imagem é opcional. Se não chegar em 60s, a memória continua salva sem imagem.
  }

  await publishMemoryDiaryEntry(interaction, { ...memoryData, image_url: imageUrl });
}

function parseModalRating(value) {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;

  const rating = Number(normalized);
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) return null;
  return rating;
}

function giftButtons() {
  const buttons = giftsCatalog.map((gift) => {
    const button = new ButtonBuilder()
      .setCustomId(`gift:buy:${gift.key}`)
      .setLabel(`${gift.cost} moedas`)
      .setStyle(ButtonStyle.Secondary);
    const emojiValue = buttonEmoji('mimos', gift.emojiKey || 'gift');
    if (emojiValue) button.setEmoji(emojiValue);
    return button;
  });
  return [
    new ActionRowBuilder().addComponents(buttons.slice(0, 3)),
    new ActionRowBuilder().addComponents(buttons.slice(3, 6)),
  ];
}

async function safeReply(interaction, payload, ephemeral = true) {
  if (interaction.deferred || interaction.replied) return interaction.followUp({ ...payload, ephemeral });
  return interaction.reply({ ...payload, ephemeral });
}

async function denyUnauthorized(interaction) {
  await respondEphemeral(interaction, withEmoji('feedback', 'warning', 'Esse cantinho é reservado para a Trívia e o Kaiki.'));
}

async function ensureAuthorized(interaction) {
  const authorization = await isAuthorizedCouple(interaction);
  if (authorization.ok) return true;
  await denyUnauthorized(interaction);
  return false;
}

function canUseAdmin(interaction) {
  return isAdminUser(interaction.user?.id) || Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
}

async function handlePanelButton(interaction) {
  console.log(`Botão recebido: panel | customId: ${interaction.customId}`);
  const [, areaId, action] = interaction.customId.split(':');
  console.log(`Painel solicitado: area=${areaId || 'home'} action=${action || 'none'}`);

  if (!areaId || areaId === 'home') {
    await interaction.reply({ embeds: [createPanelEmbed()], components: createPanelRows(), ephemeral: true });
    return;
  }

  if (!action) {
    const embed = createAreaEmbed(areaId);
    if (!embed) {
      await interaction.reply({ content: 'Área não encontrada, momo.', ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [embed], components: createAreaRows(areaId), ephemeral: true });
    return;
  }

  if (areaId === 'manual' && action === 'open') {
    console.log('Manual aberto via painel: customId=panel:manual:open página=home encontrada=true');
    await interaction.reply({ embeds: [createManualHomeEmbed()], components: createManualHomeRows(), ephemeral: true });
    return;
  }

  if (areaId === 'recados' && action === 'add') return interaction.showModal(createLoveNoteModal());
  if (areaId === 'memorias' && action === 'add') return interaction.showModal(createMemoryModal());
  if (areaId === 'cine' && action === 'add') return interaction.showModal(createMovieModal());
  if (areaId === 'playlist' && action === 'set') return interaction.showModal(createPlaylistModal());
  if (areaId === 'mimos' && action === 'buy') return interaction.showModal(createGiftModal());

  await interaction.deferReply({ ephemeral: true });

  if (areaId === 'recados' && action === 'random') {
    const note = await getRandomLoveNote();
    await interaction.editReply(note
      ? { embeds: [momozinEmbed({ title: 'Frase do dia', description: note.text, image: getAssetPublicUrl('love_notes_banner') })] }
      : { content: withEmoji('recados', 'letter', getText('recado_empty', 'Ainda não tem recados salvos. Use `/recado adicionar` primeiro.')) });
    if (note) await publishLoveNoteReadDiaryEntry(interaction, note);
    return;
  }

  if (areaId === 'recados' && action === 'count') {
    const total = await countLoveNotes();
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Recados guardados', description: `O potinho azul tem **${total}** recado(s).`, image: getAssetPublicUrl('love_notes_banner') })] });
    return;
  }

  if (areaId === 'memorias' && action === 'list') {
    const memories = await listMemories(5);
    await interaction.editReply(createMemoryListPayload(memories));
    return;
  }

  if (areaId === 'cine' && action === 'list') {
    const movies = await listMovies(5);
    await interaction.editReply({ embeds: [momozinEmbed({
      title: 'Histórico CineMomozin',
      description: movies.length ? movies.map((movie) => `**${movie.name}** — ${movie.platform}\nTrívia ${movie.trivia_rating}/10 • Kaiki ${movie.kaiki_rating}/10\n${movie.comment}`).join('\n\n') : 'Ainda não tem filme ou série no CineMomozin.',
      image: getAssetPublicUrl('cine_banner'),
    })] });
    return;
  }

  if (areaId === 'playlist' && action === 'view') {
    const playlist = await getPlaylist();
    await interaction.editReply(playlist
      ? { embeds: [momozinEmbed({ title: 'Playlist do casal', description: playlist.link, image: getAssetPublicUrl('playlist_banner') })] }
      : { content: withEmoji('playlist', 'music', getText('playlist_empty', 'Nenhuma playlist salva ainda. Use `/playlist definir`.')) });
    return;
  }

  if (areaId === 'estudos' && action === 'start') {
    const result = await startStudySession();
    await interaction.editReply(result.created
      ? { embeds: [momozinEmbed({ title: 'Estudo iniciado', description: getText('study_started', 'Cronômetro ligado para o foco do casal render MomoCoins.'), image: getAssetPublicUrl('study_banner') })] }
      : { content: withEmoji('estudos', 'book', getText('study_already_open', 'Já existe uma sessão de estudo aberta. Finalize antes de iniciar outra, panquequinha.')) });
    return;
  }

  if (areaId === 'estudos' && action === 'finish') {
    const result = await finishStudySession();
    await interaction.editReply(result
      ? { embeds: [momozinEmbed({ title: 'Estudo finalizado', description: `${getText('study_finished_message', 'Sessão finalizada com carinho. O Momozin ficou orgulhoso do foco do casal.')}\n+${result.coinsAwarded} MomoCoins • Saldo ${result.balance}`, image: getAssetPublicUrl('study_banner') })] }
      : { content: withEmoji('estudos', 'book', getText('study_not_open', 'Não tem sessão de estudo aberta para finalizar.')) });
    if (result) await publishCoinsDiaryEntry(interaction, { title: 'MomoCoins por estudo', description: `+${result.coinsAwarded} MomoCoins por ${result.minutes} minuto(s) de foco.\nSaldo atual: ${result.balance} MomoCoins.` });
    return;
  }

  if (areaId === 'estudos' && action === 'stats') {
    await interaction.editReply({ embeds: [studyStatsEmbed(await getStudyStats())] });
    return;
  }

  if (areaId === 'mimos' && action === 'shop') {
    await interaction.editReply({ embeds: [momozinEmbed({
      title: 'Loja de Mimos',
      description: getText('gifts_shop_description', 'Troque MomoCoins por recompensas fofas, caóticas e aprovadas pelo departamento azul.'),
      image: getAssetPublicUrl('gifts_banner'),
      fields: giftsCatalog.map((gift) => ({ name: `${gift.labelText} — ${gift.cost} moedas`, value: gift.description, inline: false })),
    })], components: giftButtons() });
    return;
  }

  if ((areaId === 'mimos' && action === 'coins') || areaId === 'momocoins') {
    const balance = await getCoins();
    const transactions = await getRecentCoinTransactions(5);
    await interaction.editReply({ embeds: [momozinEmbed({
      title: 'Cofrinho Momozin',
      description: `Saldo atual: **${balance} MomoCoins**.`,
      image: getAssetPublicUrl('coins_banner'),
      fields: [{ name: 'Últimas movimentações', value: formatCoinTransactions(transactions), inline: false }],
    })] });
    return;
  }

  if (areaId === 'perfil' && action === 'pudinzinho') {
    const result = await givePudinzinhoRole(interaction);
    if (result.ok && result.code === 'added') {
      await interaction.editReply({ content: result.message, embeds: [createPudinzinhoLetterEmbed()] });
      await publishAchievementDiaryEntry(interaction, { title: 'Cargo Pudinzinho recebido', description: 'Kaiki recebeu o cargo Pudinzinho no Momozin pela primeira vez.' });
      await publishPudinzinhoLetterDiaryEntry(interaction);
      return;
    }

    await interaction.editReply({ content: result.message });
    return;
  }

  if (areaId === 'perfil') {
    const mode = action === 'achievements' ? 'achievements' : action === 'status' ? 'status' : 'full';
    await interaction.editReply({ embeds: [profileEmbed(await getProfile(), mode)] });
  }
}

async function handleManualButton(interaction) {
  console.log(`Botão recebido: manual | customId: ${interaction.customId}`);
  const [, type, pageId] = interaction.customId.split(':');
  const targetPage = type === 'page' ? pageId : type === 'back' ? 'home' : type;
  console.log(`Página solicitada no manual: ${targetPage}`);
  const page = getManualPage(targetPage);
  console.log(`Página encontrada no manual: ${Boolean(page)}`);

  if (!page) {
    await interaction.reply({ content: withEmoji('feedback', 'warning', 'Página do manual não encontrada.'), ephemeral: true });
    return;
  }

  console.log(`Página do manual aberta: ${page.id}`);
  await interaction.update({ embeds: [createManualPageEmbed(page.id)], components: createManualPageRows(page.id) });
}

async function handleAdminButton(interaction) {
  console.log(`Botão recebido: admin | customId: ${interaction.customId}`);
  if (!canUseAdmin(interaction)) {
    await interaction.reply({ content: withEmoji('feedback', 'warning', 'Apenas administradores podem usar esse painel.'), ephemeral: true });
    return;
  }

  const tab = interaction.customId.split(':')[1] || 'sistema';
  await interaction.update({ embeds: [await createAdminEmbed(tab, interaction)], components: createAdminRows(tab === 'diagnostico' ? 'sistema' : tab) });
}

async function handleGiftButton(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const key = interaction.customId.split(':')[2];
  const result = await buyGift(key);
  if (!result.ok && result.reason === 'no_coins') {
    await interaction.editReply(`${withEmoji('mimos', 'gift', getText('gift_no_coins', 'Ainda faltam MomoCoins para comprar este mimo.'))} Saldo: ${result.balance}.`);
    return;
  }
  if (!result.ok) {
    await interaction.editReply(withEmoji('mimos', 'gift', getText('gift_not_found', 'Item não encontrado na lojinha.')));
    return;
  }
  await interaction.editReply({ embeds: [momozinEmbed({ title: 'Mimo comprado', description: `${result.item.labelText} ${getText('gift_bought', 'resgatado com sucesso!')}\nSaldo restante: ${result.balance} MomoCoins`, image: getAssetPublicUrl('gifts_banner') })] });
  await publishGiftDiaryEntry(interaction, result);
}

async function handleModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const [, areaId, action] = interaction.customId.split(':');

  if (areaId === 'recados' && action === 'add') {
    const text = interaction.fields.getTextInputValue('text');
    await addLoveNote(text);
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Recado salvo', description: getText('recado_saved', 'O Momozin guardou essa frase no potinho azul.'), image: getAssetPublicUrl('love_notes_banner') })] });
    await publishLoveNoteSavedDiaryEntry(interaction, text);
    return;
  }

  if (areaId === 'memorias' && action === 'add') {
    const title = interaction.fields.getTextInputValue('title');
    const description = interaction.fields.getTextInputValue('description');
    const memoryDate = interaction.fields.getTextInputValue('date');
    const result = await addMemory(title, description, memoryDate);
    await interaction.editReply({ embeds: [momozinEmbed({
      title: 'Memória salva',
      description: `${getText('memoria_saved', 'Essa memória foi colocada no mural azul do Momozin.')}

Se quiser anexar uma imagem, envie um PNG, JPG, GIF ou WEBP neste canal em até 60 segundos. Se não enviar nada, a memória fica salva sem imagem mesmo.`,
      image: getAssetPublicUrl('memories_banner'),
    })] });
    collectOptionalMemoryImage(interaction, result.lastID, { title, description, memory_date: memoryDate }).catch((error) => console.error('Erro ao anexar imagem na memória:', error));
    return;
  }

  if (areaId === 'cine' && action === 'add') {
    const name = interaction.fields.getTextInputValue('name');
    const type = interaction.fields.getTextInputValue('type');
    const platform = interaction.fields.getTextInputValue('platform');
    const triviaRating = parseModalRating(interaction.fields.getTextInputValue('triviaRating'));
    const kaikiRating = parseModalRating(interaction.fields.getTextInputValue('kaikiRating'));

    if (triviaRating === null || kaikiRating === null) {
      await interaction.editReply(withEmoji('feedback', 'warning', 'As notas precisam ser números de 0 a 10. Exemplo: 8.5'));
      return;
    }

    const comment = 'Registrado pelo painel do Momozin.';
    await addMovie(name, type, platform, triviaRating, kaikiRating, comment);
    await interaction.editReply({ embeds: [momozinEmbed({
      title: 'CineMomozin atualizado',
      description: `${name} ${getText('cine_saved', 'entrou para a listinha azul do casal.')}`,
      image: getAssetPublicUrl('cine_banner'),
      fields: [
        { name: 'Tipo', value: type, inline: true },
        { name: 'Plataforma', value: platform, inline: true },
        { name: 'Notas', value: `Trívia: ${triviaRating}/10\nKaiki: ${kaikiRating}/10`, inline: true },
      ],
    })] });
    await publishMovieDiaryEntry(interaction, { name, type, platform, triviaRating, kaikiRating, comment });
    return;
  }

  if (areaId === 'playlist' && action === 'set') {
    const link = interaction.fields.getTextInputValue('link');
    await setPlaylist(link);
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Playlist salva', description: getText('playlist_saved', 'Link guardado. Sem Spotify API por enquanto, só o aconchego manual.'), image: getAssetPublicUrl('playlist_banner') })] });
    await publishPlaylistDiaryEntry(interaction, link);
    return;
  }

  if (areaId === 'mimos' && action === 'buy') {
    const key = interaction.fields.getTextInputValue('item').trim().toLowerCase().replace(/\s+/g, '_');
    const result = await buyGift(key);
    await interaction.editReply(result.ok
      ? { embeds: [momozinEmbed({ title: 'Mimo comprado', description: `${result.item.labelText} ${getText('gift_bought', 'resgatado com sucesso!')}\nSaldo restante: ${result.balance} MomoCoins`, image: getAssetPublicUrl('gifts_banner') })] }
      : { content: withEmoji('mimos', 'gift', result.reason === 'no_coins' ? getText('gift_no_coins', 'Ainda faltam MomoCoins para comprar este mimo.') : getText('gift_not_found', 'Item não encontrado na lojinha.')) });
    if (result.ok) await publishGiftDiaryEntry(interaction, result);
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName;
      const command = interaction.client.commands.get(commandName);
      console.log(`Comando recebido: ${commandName}`);
      if (!command) {
        await safeReply(interaction, { content: withEmoji('feedback', 'error', getText('unknown_command_error', 'Esse comando não foi encontrado no caderninho do Momozin.')) });
        return;
      }

      let cancelDefer = () => {};
      try {
        if (!(await enforceCommandsChannel(interaction))) return;
        if (commandName !== 'admin' && !(await ensureAuthorized(interaction))) return;
        cancelDefer = scheduleDefer(interaction, commandName);
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

    try {
      if (!(await enforceCommandsChannel(interaction))) return;
      if (interaction.isButton() && interaction.customId.startsWith('admin:')) return await handleAdminButton(interaction);
      if ((interaction.isButton() || interaction.isModalSubmit()) && !(await ensureAuthorized(interaction))) return;
      if (interaction.isButton() && interaction.customId.startsWith('panel:')) return await handlePanelButton(interaction);
      if (interaction.isButton() && interaction.customId.startsWith('manual:')) return await handleManualButton(interaction);
      if (interaction.isButton() && interaction.customId.startsWith('gift:buy:')) return await handleGiftButton(interaction);
      if (interaction.isModalSubmit() && interaction.customId.startsWith('modal:')) return await handleModalSubmit(interaction);
    } catch (error) {
      console.error(`Erro ao processar interaction ${interaction.customId || interaction.commandName}:`, error);
      await respondEphemeral(interaction, withEmoji('feedback', 'error', getText('generic_command_error', 'O Momozin tropeçou no cobertor azul. Tenta de novo daqui a pouquinho!')));
    }
  },
};
