const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { createManualHomeEmbed, createManualHomeRows, createManualPageEmbed, createManualPageRows, getManualPage } = require('../components/manual');
const { createAdminEmbed, createAdminRows } = require('../components/admin');
const { createAreaEmbed, createAreaRows, createPanelEmbed, createPanelRows } = require('../components/panel');
const { createGiftModal, createLoveNoteModal, createMemoryModal, createMovieModal, createPlaylistModal } = require('../components/modals');
const {
  addLoveNote,
  addMemory,
  addMovie,
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
const { formatCoinTransactions } = require('../utils/coins');
const { profileEmbed, studyStatsEmbed } = require('../utils/embeds');
const { givePudinzinhoRole } = require('../utils/pudinzinhoRole');
const { buttonEmoji, withEmoji } = require('../utils/emojis');
const { respondEphemeral, scheduleDefer } = require('../utils/interactions');
const { getText } = require('../utils/texts');
const { momozinEmbed } = require('../utils/theme');

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
  await respondEphemeral(interaction, withEmoji('feedback', 'warning', 'Esse cantinho é reservado para a Trívia e o Kaiki. Se ainda não configurou, use `/setup casal`.'));
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
    return;
  }

  if (areaId === 'recados' && action === 'count') {
    const total = await countLoveNotes();
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Recados guardados', description: `O potinho azul tem **${total}** recado(s).`, image: getAssetPublicUrl('love_notes_banner') })] });
    return;
  }

  if (areaId === 'memorias' && action === 'list') {
    const memories = await listMemories(5);
    await interaction.editReply({ embeds: [momozinEmbed({
      title: 'Últimas memórias',
      description: memories.length ? memories.map((memory) => `**${memory.title}** (${memory.memory_date})\n${memory.description}`).join('\n\n') : 'Ainda não tem memórias no mural azul.',
      image: getAssetPublicUrl('memories_banner'),
    })] });
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
}

async function handleModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const [, areaId, action] = interaction.customId.split(':');

  if (areaId === 'recados' && action === 'add') {
    await addLoveNote(interaction.fields.getTextInputValue('text'));
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Recado salvo', description: getText('recado_saved', 'O Momozin guardou essa frase no potinho azul.'), image: getAssetPublicUrl('love_notes_banner') })] });
    return;
  }

  if (areaId === 'memorias' && action === 'add') {
    await addMemory(interaction.fields.getTextInputValue('title'), interaction.fields.getTextInputValue('description'), interaction.fields.getTextInputValue('date'));
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Memória salva', description: getText('memoria_saved', 'Essa memória foi colocada no mural azul do Momozin.'), image: getAssetPublicUrl('memories_banner') })] });
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

    await addMovie(name, type, platform, triviaRating, kaikiRating, 'Registrado pelo painel do Momozin.');
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
    return;
  }

  if (areaId === 'playlist' && action === 'set') {
    await setPlaylist(interaction.fields.getTextInputValue('link'));
    await interaction.editReply({ embeds: [momozinEmbed({ title: 'Playlist salva', description: getText('playlist_saved', 'Link guardado. Sem Spotify API por enquanto, só o aconchego manual.'), image: getAssetPublicUrl('playlist_banner') })] });
    return;
  }

  if (areaId === 'mimos' && action === 'buy') {
    const key = interaction.fields.getTextInputValue('item').trim().toLowerCase().replace(/\s+/g, '_');
    const result = await buyGift(key);
    await interaction.editReply(result.ok
      ? { embeds: [momozinEmbed({ title: 'Mimo comprado', description: `${result.item.labelText} ${getText('gift_bought', 'resgatado com sucesso!')}\nSaldo restante: ${result.balance} MomoCoins`, image: getAssetPublicUrl('gifts_banner') })] }
      : { content: withEmoji('mimos', 'gift', result.reason === 'no_coins' ? getText('gift_no_coins', 'Ainda faltam MomoCoins para comprar este mimo.') : getText('gift_not_found', 'Item não encontrado na lojinha.')) });
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
