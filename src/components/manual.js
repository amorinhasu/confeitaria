const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { giftsCatalog } = require('../database/repositories');
const { getAssetPublicUrl } = require('../utils/assets');
const { buttonEmoji } = require('../utils/emojis');
const { momozinEmbed } = require('../utils/theme');

function giftCostList() {
  return giftsCatalog.map((gift) => `• ${gift.labelText} — ${gift.cost} MomoCoins: ${gift.description}`).join('\n');
}

const manualPages = [
  {
    id: 'home',
    title: 'Manual do Momozin',
    emojiCategory: 'manual',
    emojiKey: 'home',
    banner: 'manual_home_banner',
    description: [
      'Bem-vinda ao Momozin.',
      '',
      'Este é o guia do cantinho da Trívia e do Kaiki: um lugar para guardar recados, memórias, filmes, músicas, estudos, mimos e pequenas conquistas do casal.',
      '',
      '**Como usar:**',
      '• Pelo **Painel**, clicando nos botões e escolhendo uma ação.',
      '• Por **comandos slash**, digitando `/` quando quiser ir direto ao ponto.',
      '',
      '**Jeito mais fácil:**',
      '1. Abra `/painel`.',
      '2. Escolha uma área.',
      '3. Clique no botão da ação.',
      '4. Preencha o que o Momozin pedir.',
      '',
      '**Importante:** quando algo especial é salvo, o Momozin também pode registrar no canal certo, como um diário permanente do casal.',
      '',
      '**Dica rápida:** se ficar perdida, volte para esta página ou clique em **Abrir Painel**.',
    ].join('\n'),
    actionRows: [
      [
        ['manual:page:entrada', 'Entrada', 'mimos', 'pudding'],
        ['manual:page:recados', 'Recados', 'recados', 'letter'],
        ['manual:page:memorias', 'Memórias', 'memorias', 'photo'],
      ],
      [
        ['manual:page:cine', 'CineMomozin', 'cine', 'movie'],
        ['manual:page:playlist', 'Playlist', 'playlist', 'music'],
        ['manual:page:estudos', 'Estudos', 'estudos', 'coffee'],
      ],
      [
        ['manual:page:momocoins', 'MomoCoins', 'momocoins', 'coin'],
        ['manual:page:mimos', 'Mimos', 'mimos', 'pudding'],
        ['manual:page:perfil', 'Perfil', 'perfil', 'heart'],
        ['manual:page:diario', 'Diário', 'memorias', 'photo'],
      ],
      [
        ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ],
    ],
  },
  {
    id: 'entrada',
    title: 'Entrada Pudinzinho',
    emojiCategory: 'mimos',
    emojiKey: 'pudding',
    banner: 'gifts_banner',
    description: [
      '**O que essa etapa faz:**',
      'A entrada Pudinzinho é o começo especial do Kaiki no Momozin.',
      '',
      '**Como usar:**',
      '1. Kaiki deve ir ao canal de entrada.',
      '2. Clicar no botão **Virar Pudinzinho**.',
      '3. Ler a surpresa preparada pela Trívia.',
      '4. Depois disso, o acesso ao Momozin fica liberado para usar painel, registros e mimos.',
      '',
      '**O que acontece depois do clique:**',
      '• Kaiki recebe a mensagem especial.',
      '• A carta fica registrada no diário do casal.',
      '• O Momozin passa a deixar Kaiki explorar as áreas principais.',
      '',
      '**Exemplo simples:**',
      'Entrar no canal de entrada → clicar em **Virar Pudinzinho** → ler a carta → abrir `/painel`.',
      '',
      '**Dica rápida:** esse botão é só do Kaiki. A Trívia já pode usar o Momozin normalmente.',
    ].join('\n'),
    actionRows: [[
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'recados',
    title: 'Recados',
    emojiCategory: 'recados',
    emojiKey: 'letter',
    banner: 'love_notes_banner',
    description: [
      '**O que essa área faz:**',
      'Guarda mensagens especiais para serem encontradas quando menos esperar.',
      'Pode ser declaração, frase do dia, piada interna, saudade ou carinho de madrugada.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Recados**.',
      '2. Clique em **Adicionar Recado**.',
      '3. Escreva a mensagem no modal.',
      '4. Se quiser, cole uma URL de imagem no campo opcional.',
      '5. Envie.',
      '',
      '**Para sortear ou reler:**',
      '1. Clique em **Sortear Recado**.',
      '2. O Momozin escolhe uma mensagem salva.',
      '',
      '**Campos do modal:**',
      '• texto do recado',
      '• imagem opcional por URL',
      '',
      '**Onde fica registrado:**',
      'Recados salvos e recados lidos aparecem automaticamente no canal de **Recados**, com autor, data, conteúdo e imagem quando existir.',
      '',
      '**Comandos slash equivalentes:**',
      '`/recado adicionar texto: image_url:`',
      '`/recado sortear`',
      '',
      '**Exemplo simples:**',
      '“abre quando estiver com saudade de mim.”',
      '',
      '**Dica rápida:** use recados para guardar frases, declarações, prints por URL e piadas internas.',
    ].join('\n'),
    actionRows: [[
      ['panel:recados:add', 'Adicionar Recado', 'recados', 'letter'],
      ['panel:recados:random', 'Sortear Recado', 'recados', 'letter'],
      ['panel:recados:count', 'Quantidade', 'momocoins', 'coin'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'memorias',
    title: 'Memórias',
    emojiCategory: 'memorias',
    emojiKey: 'photo',
    banner: 'memories_banner',
    description: [
      '**O que essa área faz:**',
      'Guarda momentos importantes do casal, dos enormes aos pequenininhos.',
      'É o mural de lembranças que vocês podem abrir sempre que bater saudade.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Memórias**.',
      '2. Clique em **Adicionar Memória**.',
      '3. Preencha título, descrição e data.',
      '4. Envie.',
      '5. Se quiser colocar imagem, envie o arquivo no canal quando o Momozin pedir.',
      '',
      '**Campos do modal:**',
      '• título',
      '• descrição',
      '• data',
      '• imagem opcional depois do modal',
      '',
      '**Onde fica registrado:**',
      'Toda memória salva aparece automaticamente no canal de **Memórias**. Se tiver imagem, o Momozin mostra a imagem no embed.',
      '',
      '**Comando slash equivalente:**',
      '`/memoria adicionar titulo: descricao: data: imagem:`',
      '',
      '**Exemplo simples:**',
      'Título: primeiro eu te amo',
      'Descrição: declaração em call antes de dormir',
      'Data: 05/06/2026',
      'Imagem: print da call ou foto do momento',
      '',
      '**Dica rápida:** registre momentos pequenos também. Às vezes eles viram os mais importantes.',
    ].join('\n'),
    actionRows: [[
      ['panel:memorias:add', 'Adicionar Memória', 'memorias', 'photo'],
      ['panel:memorias:list', 'Ver Últimas', 'memorias', 'photo'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'cine',
    title: 'CineMomozin',
    emojiCategory: 'cine',
    emojiKey: 'movie',
    banner: 'cine_banner',
    description: [
      '**O que essa área faz:**',
      'Registra filmes, séries e animes que fizeram parte da história de vocês.',
      'Cada registro guarda onde assistiram e as notas da Trívia e do Kaiki.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **CineMomozin**.',
      '2. Clique em **Adicionar Filme/Série**.',
      '3. Preencha os campos do modal.',
      '4. Envie.',
      '',
      '**Campos do modal pelo painel:**',
      '• nome',
      '• tipo',
      '• plataforma',
      '• nota da Trívia',
      '• nota do Kaiki',
      '',
      '**Diferença no comando slash:**',
      'Pelo comando `/cine adicionar`, também existe o campo **comentario** para registrar uma observação do casal.',
      '',
      '**Regra importante:**',
      'As notas precisam ser números de **0 a 10** para Trívia e Kaiki.',
      '',
      '**Busca de catálogo:**',
      'Quando a busca de catálogo estiver ativa, o Momozin mostra opções com título, ano, sinopse, nota e capa antes de salvar. Se nenhuma opção for a certa, escolha **Salvar sem TMDB** e o registro manual continua funcionando normalmente.',
      '',
      '**Sorteio pelo painel:**',
      'Depois de cadastrar alguns itens, use **Sortear qualquer**, **Sortear filme** ou **Sortear série** para escolher algo já salvo no CineMomozin.',
      'O sorteio usa o tipo escrito no cadastro. Para o botão de filme funcionar bem, escreva **filme** no tipo. Para o botão de série, escreva **série**. Se tiver dúvida ou cadastrou como anime, dorame ou outro nome, use **Sortear qualquer**.',
      '',
      '**Histórico e sorteio:**',
      '**Ver Histórico** mostra os últimos registros salvos. Os botões de sorteio escolhem entre os itens cadastrados que combinam com o tipo escolhido.',
      '',
      '**Onde fica registrado:**',
      'Filmes, séries e animes salvos aparecem automaticamente no canal **Cinema**.',
      '',
      '**Comando slash equivalente:**',
      '`/cine adicionar nome: tipo: plataforma: nota_trivia: nota_kaiki: comentario:`',
      '',
      '**Exemplo simples:**',
      'Nome: Shrek 2',
      'Tipo: filme',
      'Plataforma: Netflix',
      'Nota da Trívia: 10',
      'Nota do Kaiki: 9',
      'Comentário: assistimos rindo juntos de madrugada',
      '',
      '**Dica rápida:** use **Ver Histórico** para lembrar o que vocês já assistiram juntos.',
    ].join('\n'),
    actionRows: [
      [
        ['panel:cine:add', 'Adicionar Filme/Série', 'cine', 'movie'],
        ['panel:cine:list', 'Ver Histórico', 'cine', 'movie'],
        ['panel:cine:random_all', 'Sortear Qualquer', 'cine', 'movie'],
      ],
      [
        ['panel:cine:random_movie', 'Sortear Filme', 'cine', 'movie'],
        ['panel:cine:random_series', 'Sortear Série', 'cine', 'movie'],
        ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ],
    ],
  },
  {
    id: 'playlist',
    title: 'Playlist',
    emojiCategory: 'playlist',
    emojiKey: 'music',
    banner: 'playlist_banner',
    description: [
      '**O que essa área faz:**',
      'Salva a playlist oficial do casal, porque toda história merece uma trilha sonora.',
      'Pode ser qualquer link que vocês queiram guardar e abrir de novo depois.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Playlist**.',
      '2. Clique em **Definir Playlist**.',
      '3. Cole o link no modal.',
      '4. Use **Ver Playlist** quando quiser abrir de novo.',
      '',
      '**Campos do modal:**',
      '• link da playlist',
      '',
      '**Onde fica registrado:**',
      'Quando a playlist é atualizada, o Momozin registra automaticamente no canal **Playlist**.',
      '',
      '**Comandos slash equivalentes:**',
      '`/playlist definir link:`',
      '`/playlist ver`',
      '',
      '**Exemplo simples:**',
      'https://open.spotify.com/playlist/...',
      '',
      '**Dica rápida:** use esse espaço para guardar a trilha sonora de vocês, seja música, vídeo ou qualquer link especial.',
    ].join('\n'),
    actionRows: [[
      ['panel:playlist:set', 'Definir Playlist', 'playlist', 'music'],
      ['panel:playlist:view', 'Ver Playlist', 'playlist', 'music'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'estudos',
    title: 'Estudos',
    emojiCategory: 'estudos',
    emojiKey: 'coffee',
    banner: 'study_banner',
    description: [
      '**O que essa área faz:**',
      'Acompanha o foco da Trívia e do Kaiki, transformando estudo em MomoCoins para usar na lojinha.',
      '',
      '**Como iniciar pelo painel:**',
      '1. Clique em **Estudos**.',
      '2. Clique em **Iniciar estudo**.',
      '3. Informe, se quiser, o tema do estudo.',
      '4. O Momozin começa a contar o tempo.',
      '',
      '**Tema do estudo:**',
      'Você pode escrever algo como Matemática, Programação, Faculdade, Inglês ou Concurso. Se deixar vazio, a sessão continua sem tema definido.',
      '',
      '**Sessão aberta:**',
      'O Momozin trabalha com uma sessão de estudo aberta por vez para o casal. Se já existir uma sessão em andamento, finalize ou retome essa sessão antes de iniciar outra.',
      '',
      '**Pausas e acompanhamento:**',
      '• **Pausa para Água:** pausa a contagem para respirar, beber água e voltar com calma.',
      '• **Pausa para Grude:** pausa a contagem para um momentinho de carinho do casal.',
      '• **Retomar:** continua a sessão do ponto em que parou.',
      '• **Ver tempo atual:** mostra a sessão aberta agora, com tema, quem iniciou, tempo efetivo, tempo pausado, tempo total e pausas.',
      '• **Ver progresso:** mostra o acumulado das sessões já finalizadas, como histórico de foco do casal.',
      '',
      '**Como finalizar:**',
      '1. Clique em **Finalizar estudo**.',
      '2. O Momozin mostra o tempo efetivo estudando.',
      '3. Também mostra tempo total, quantidade de pausas e tempo total pausado.',
      '4. O tempo pausado não entra como estudo efetivo.',
      '',
      '**MomoCoins:**',
      'Ao finalizar, o Momozin calcula a recompensa pelo tempo efetivo estudado. Hoje a regra é simples: **1 MomoCoin a cada 10 minutos efetivos completos**, com mínimo de **1 MomoCoin** ao finalizar.',
      'Sessões muito curtinhas ainda podem render 1 MomoCoin, então use com carinho para registrar foco de verdade.',
      '',
      '**Onde fica registrado:**',
      'Sessões iniciadas e finalizadas aparecem automaticamente no canal **Estudos**, com quem estudou, tema, tempo e recompensa.',
      '',
      '**Comandos slash equivalentes:**',
      '`/estudo iniciar tema:`',
      '`/estudo pausar tipo:`',
      '`/estudo retomar`',
      '`/estudo finalizar`',
      'Pelo painel, também existem **Ver tempo atual** para a sessão aberta e **Ver progresso** para o histórico acumulado.',
      '',
      '**Exemplo simples:**',
      'Tema: Programação JavaScript → estudar → Pausa para Água → Retomar → Finalizar estudo.',
      '',
      '**Dica rápida:** use **Ver Tempo Atual** durante a sessão e **Ver Progresso** quando quiser ver o histórico do casal.',
    ].join('\n'),
    actionRows: [
      [
        ['panel:estudos:start', 'Iniciar Estudo', 'estudos', 'coffee'],
        ['panel:estudos:pause_water', 'Pausa Água', 'estudos', 'coffee'],
        ['panel:estudos:pause_grude', 'Pausa Grude', 'perfil', 'heart'],
      ],
      [
        ['panel:estudos:resume', 'Retomar Estudo', 'feedback', 'success'],
        ['panel:estudos:time', 'Ver Tempo Atual', 'estudos', 'coffee'],
        ['panel:estudos:finish', 'Finalizar Estudo', 'estudos', 'book'],
        ['panel:estudos:stats', 'Ver Progresso', 'momocoins', 'coin'],
        ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ],
    ],
  },
  {
    id: 'momocoins',
    title: 'MomoCoins',
    emojiCategory: 'momocoins',
    emojiKey: 'coin',
    banner: 'coins_banner',
    description: [
      '**O que essa área faz:**',
      'MomoCoins são as moedinhas do casal dentro do Momozin.',
      'Elas servem para comprar mimos simbólicos na lojinha.',
      '',
      '**Como ganhar MomoCoins hoje:**',
      '• Finalizando sessões de estudo pelo Foco do Casal.',
      '• Recebendo bônus manual quando alguém responsável pelo Momozin quiser presentear o casal.',
      '',
      '**Regra de estudo:**',
      'A recompensa usa o tempo efetivo estudado. O tempo em pausa não conta como estudo. Ao finalizar uma sessão, o Momozin entrega **1 MomoCoin a cada 10 minutos efetivos completos**, sempre com mínimo de **1 MomoCoin**.',
      '',
      '**Como ver saldo pelo painel:**',
      '1. Clique em **Mimos**.',
      '2. Clique em **Ver Moedas**.',
      '3. O Momozin mostra o saldo atual e as últimas movimentações.',
      '',
      '**Relação com Mimos:**',
      'As MomoCoins ficam no cofrinho do casal. Quando vocês compram um mimo, o valor é descontado e a compra fica registrada.',
      '',
      '**Comando slash equivalente:**',
      '`/moedas ver`',
      '',
      '**Comando de bônus:**',
      '`/moedas adicionar quantidade: motivo:`',
      '',
      '**Exemplo simples:**',
      'Finalizou uma sessão de estudo? Abra **Mimos > Ver Moedas** para conferir o cofrinho.',
      '',
      '**Dica rápida:** o saldo é do casal, não individual.',
    ].join('\n'),
    actionRows: [[
      ['panel:mimos:coins', 'Ver Moedas', 'momocoins', 'coin'],
      ['panel:mimos:shop', 'Abrir Loja', 'mimos', 'gift'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'mimos',
    title: 'Mimos',
    emojiCategory: 'mimos',
    emojiKey: 'gift',
    banner: 'gifts_banner',
    description: [
      '**O que essa área faz:**',
      'A lojinha transforma MomoCoins em presentes simbólicos, combinados e carinhosos para o casal.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Mimos**.',
      '2. Clique em **Abrir loja** para ver itens e preços.',
      '3. Escolha um item pelos botões da loja ou clique em **Comprar Mimo**.',
      '4. Se abrir modal, escreva o nome do item desejado.',
      '5. O valor é descontado das MomoCoins.',
      '',
      '**Itens e custos atuais:**',
      giftCostList(),
      '',
      '**Onde fica registrado:**',
      'Compras de mimos e conquistas especiais aparecem automaticamente no canal **Mimos**.',
      '',
      '**Comandos slash equivalentes:**',
      '`/mimo loja`',
      '`/mimo comprar item:`',
      '',
      '**Exemplo simples:**',
      'Juntou moedas estudando? Abra a loja e compre um **Pudinzinho**, uma **Cartinha** ou um vale especial.',
      '',
      '**Dica rápida:** mimos são lembrancinhas simbólicas para deixar a rotina de vocês mais doce.',
    ].join('\n'),
    actionRows: [[
      ['panel:mimos:shop', 'Abrir Loja', 'mimos', 'gift'],
      ['panel:mimos:buy', 'Comprar Mimo', 'mimos', 'pudding'],
      ['panel:mimos:coins', 'Ver Moedas', 'momocoins', 'coin'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'perfil',
    title: 'Perfil',
    emojiCategory: 'perfil',
    emojiKey: 'heart',
    banner: 'profile_banner',
    description: [
      '**O que essa área faz:**',
      'Mostra o resumo do casal: status, conquistas, tempo juntos e apelidos.',
      'É como uma capinha do álbum vivo de vocês.',
      '',
      '**Como usar pelo painel:**',
      '1. Clique em **Perfil**.',
      '2. Escolha **Ver Perfil**, **Conquistas** ou **Status**.',
      '',
      '**O que cada botão mostra:**',
      '• **Ver Perfil:** resumo completo do casal.',
      '• **Conquistas:** marcos registrados e momentos especiais.',
      '• **Status:** frase/status atual do casal.',
      '',
      '**Comando slash equivalente:**',
      '`/perfil`',
      '',
      '**Exemplo simples:**',
      'Use **Ver Perfil** para abrir o álbum vivo da história de vocês.',
      '',
      '**Dica rápida:** volte aqui quando quiser lembrar o quanto a história já cresceu.',
    ].join('\n'),
    actionRows: [[
      ['panel:perfil:view', 'Ver Perfil', 'perfil', 'heart'],
      ['panel:perfil:achievements', 'Conquistas', 'perfil', 'achievement'],
      ['panel:perfil:status', 'Status', 'perfil', 'heart'],
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'diario',
    title: 'Diário do casal',
    emojiCategory: 'memorias',
    emojiKey: 'photo',
    banner: 'manual_category_banner',
    description: [
      '**O que essa seção explica:**',
      'O Momozin não serve só para responder comandos. Ele também ajuda a montar um diário permanente da história de vocês.',
      '',
      '**Como funciona:**',
      'Quando vocês salvam algo importante pelo painel ou por comando, o Momozin pode registrar automaticamente no canal correspondente.',
      '',
      '**Para onde cada coisa vai:**',
      '• Recados salvos e lidos → canal **Recados**.',
      '• Memórias → canal **Memórias**.',
      '• Filmes, séries e animes → canal **Cinema**.',
      '• Playlist atualizada → canal **Playlist**.',
      '• Estudos e recompensas → canal **Estudos**.',
      '• Compras, mimos e conquistas → canal **Mimos**.',
      '• Carta Pudinzinho → canal **Memórias**.',
      '',
      '**Por que isso é legal:**',
      'Com o tempo, os canais viram um álbum organizado: mensagens, filmes, fotos, estudos, mimos e conquistas ficam fáceis de reler.',
      '',
      '**Exemplo simples:**',
      'Salvar uma memória com imagem → o Momozin confirma para você → a memória aparece no canal **Memórias**.',
      '',
      '**Dica rápida:** se algo for muito especial, registre pelo painel para ele não se perder na conversa.',
    ].join('\n'),
    actionRows: [[
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
    ]],
  },
  {
    id: 'dicas',
    title: 'Dicas',
    emojiCategory: 'manual',
    emojiKey: 'home',
    banner: 'manual_category_banner',
    description: [
      '**Se estiver perdido:**',
      '1. Abra `/painel`.',
      '2. Escolha uma área.',
      '3. Clique em uma ação.',
      '4. Preencha o modal se aparecer.',
      '5. Pronto.',
      '',
      '**Lembretes importantes:**',
      '• `/manual` abre esse guia.',
      '• `/painel` abre a central.',
      '• O botão **Abrir Painel** sempre ajuda a voltar para o começo.',
      '',
      '**Como usar melhor:**',
      'Use o painel quando quiser rapidez e use os comandos slash quando já souber exatamente o que quer fazer.',
      '',
      '**Exemplo simples:**',
      '`/painel` → Recados → Adicionar Recado → escrever no modal → enviar.',
      '',
      '**Dica rápida:** basta clicar nos botões e aproveitar os momentos. O Momozin cuida do resto com carinho.',
    ].join('\n'),
    actionRows: [[
      ['panel:home', 'Abrir Painel', 'manual', 'panel'],
      ['manual:page:home', 'Voltar ao Manual', 'manual', 'home'],
    ]],
  },
];

const manualPageMap = new Map(manualPages.map((page, index) => [page.id, { ...page, index }]));
const manualCategories = Object.fromEntries(manualPages.filter((page) => page.id !== 'home').map((page) => [page.id, page]));

function makeButton(id, label, category, key, style = ButtonStyle.Primary) {
  const button = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
  const emojiValue = buttonEmoji(category, key);
  if (emojiValue) button.setEmoji(emojiValue);
  return button;
}

function createManualPageEmbed(pageId = 'home') {
  const page = manualPageMap.get(pageId) || manualPageMap.get('home');
  return momozinEmbed({
    title: page.title,
    description: page.description,
    image: getAssetPublicUrl(page.banner),
  });
}

function createActionRows(page) {
  return page.actionRows.map((row) => new ActionRowBuilder().addComponents(
    row.map(([id, label, category, key]) => makeButton(id, label, category, key)),
  ));
}

function getRowCustomIds(rows) {
  return rows.flatMap((row) => row.components.map((component) => component.data.custom_id).filter(Boolean));
}

function collectCustomIds(rows) {
  return new Set(getRowCustomIds(rows));
}

function warnDuplicateCustomId(customId) {
  console.warn(`[Manual] Duplicate custom_id removed: ${customId}`);
}

function logManualCustomIds(pageId, rows) {
  console.log(`[Manual] Page: ${pageId}`);
  console.log('[Manual] custom ids:');
  getRowCustomIds(rows).forEach((customId) => console.log(`* ${customId}`));
}

function createNavigationRow(page, usedCustomIds = new Set()) {
  const buttons = [];

  function addNavigationButton(customId, label, category, key) {
    if (usedCustomIds.has(customId)) {
      warnDuplicateCustomId(customId);
      return;
    }
    buttons.push(makeButton(customId, label, category, key, ButtonStyle.Secondary));
    usedCustomIds.add(customId);
  }

  if (page.id !== 'home') addNavigationButton('manual:page:home', 'Início', 'manual', 'start');
  if (page.index > 0) addNavigationButton(`manual:page:${manualPages[page.index - 1].id}`, 'Anterior', 'manual', 'previous');
  if (page.index < manualPages.length - 1) addNavigationButton(`manual:page:${manualPages[page.index + 1].id}`, 'Próximo', 'manual', 'next');

  if (buttons.length === 0) return null;
  return new ActionRowBuilder().addComponents(buttons);
}

function removeDuplicateButtons(rows) {
  const usedCustomIds = new Set();

  return rows
    .map((row) => {
      const uniqueComponents = row.components.filter((component) => {
        const customId = component.data.custom_id;
        if (!customId) return true;
        if (usedCustomIds.has(customId)) {
          warnDuplicateCustomId(customId);
          return false;
        }
        usedCustomIds.add(customId);
        return true;
      });

      if (uniqueComponents.length === row.components.length) return row;
      if (uniqueComponents.length === 0) return null;
      return new ActionRowBuilder().addComponents(uniqueComponents);
    })
    .filter(Boolean);
}

function createManualPageRows(pageId = 'home') {
  const page = manualPageMap.get(pageId) || manualPageMap.get('home');
  const rows = createActionRows(page);
  const navigationRow = createNavigationRow(page, collectCustomIds(rows));
  if (navigationRow) rows.push(navigationRow);
  const uniqueRows = removeDuplicateButtons(rows);
  logManualCustomIds(page.id, uniqueRows);
  return uniqueRows;
}

function getManualPage(pageId) {
  return manualPageMap.get(pageId) || null;
}

function createManualHomeEmbed() {
  return createManualPageEmbed('home');
}

function createManualHomeRows() {
  return createManualPageRows('home');
}

function createManualCategoryEmbed(categoryId) {
  return createManualPageEmbed(categoryId);
}

function createManualNavigationRows(categoryId = 'home') {
  return createManualPageRows(categoryId);
}

module.exports = {
  createManualCategoryEmbed,
  createManualHomeEmbed,
  createManualHomeRows,
  createManualNavigationRows,
  createManualPageEmbed,
  createManualPageRows,
  getManualPage,
  manualCategories,
  manualPages,
};
