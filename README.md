# 💙 Momozin

Primeira versão do **Momozin**, um bot privado de casal para Discord feito para Trívia e Kaiki, com estética azul, fofa, engraçada e clima de madrugada em call.

## Funcionalidades

- Slash commands com `discord.js` v14.
- Botões/interactions no painel principal.
- Embeds azuis e textos personalizados do casal.
- Banco SQLite local em `./data/momozin.sqlite` usando `sqlite3`.
- Recados românticos/engraçados.
- Memórias do casal.
- CineMomozin para filmes e séries assistidos.
- Playlist salva manualmente por link.
- MomoCoins, foco do casal e loja de mimos.

> Spotify API e TMDB ainda **não** foram implementados. A chave TMDB fica preparada no `.env` para uma versão futura.

## Requisitos

- Node.js 20 ou superior recomendado.
- Um aplicativo/bot criado no Discord Developer Portal.
- Bot convidado no servidor privado com permissão para usar slash commands.

## Instalação

```bash
npm install
```

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha o `.env`:

```env
DISCORD_TOKEN=seu_token_do_bot
DISCORD_CLIENT_ID=1510891897176985611
DISCORD_GUILD_ID=1505727748822270144
TMDB_API_KEY=sua_chave_tmdb_para_versao_futura
DATABASE_URL=./data/momozin.sqlite
AUTO_DEPLOY_COMMANDS=false
ADMIN_USER_ID=
TRIVIA_USER_ID=
KAIKI_USER_ID=993955981220388894
PUDINZINHO_ROLE_ID=1509920102911311943
COMMANDS_CHANNEL_ID=
ENTRY_CHANNEL_ID=1505727749631774885
RECADOS_CHANNEL_ID=1506427566590791773
MEMORIAS_CHANNEL_ID=1506427787077095505
CINEMA_CHANNEL_ID=1506427710077927475
PLAYLIST_CHANNEL_ID=1506427866278269079
ESTUDOS_CHANNEL_ID=1506427912092385333
MIMOS_CHANNEL_ID=1511468115597463562
```


## Canais de produção

Configure estes IDs no `.env` para organizar o Momozin em produção:

```env
COMMANDS_CHANNEL_ID=
ENTRY_CHANNEL_ID=1505727749631774885
RECADOS_CHANNEL_ID=1506427566590791773
MEMORIAS_CHANNEL_ID=1506427787077095505
CINEMA_CHANNEL_ID=1506427710077927475
PLAYLIST_CHANNEL_ID=1506427866278269079
ESTUDOS_CHANNEL_ID=1506427912092385333
MIMOS_CHANNEL_ID=1511468115597463562
```

- `COMMANDS_CHANNEL_ID` limita o uso normal do Momozin ao canal de comandos.
- `ENTRY_CHANNEL_ID` recebe a mensagem fixa com o botão **Virar Pudinzinho** para liberar o Kaiki.
- `RECADOS_CHANNEL_ID` recebe recados salvos e recados sorteados/lidos.
- `MEMORIAS_CHANNEL_ID` recebe memórias e a carta integral do Pudinzinho.
- `CINEMA_CHANNEL_ID` recebe registros do CineMomozin.
- `PLAYLIST_CHANNEL_ID` recebe atualizações da playlist do casal.
- `ESTUDOS_CHANNEL_ID` recebe eventos de foco/estudos e recompensas de MomoCoins por estudo.
- `MIMOS_CHANNEL_ID` recebe mimos comprados e conquistas, incluindo o recebimento do cargo Pudinzinho.
- `MEMORIES_CHANNEL_ID` antigo ainda é aceito como fallback para compatibilidade, mas o nome recomendado agora é `MEMORIAS_CHANNEL_ID`.

## Scripts

Registrar slash commands no servidor configurado:

```bash
npm run deploy
```

Rodar em modo desenvolvimento com watch:

```bash
npm run dev
```

Rodar em produção/local simples:

```bash
npm start
```

## Comandos disponíveis

- `/painel` — envia o painel principal guiado com botões e ações por área.
- `/manual` — abre o manual visual com categorias e exemplos de uso.
- `/perfil` — mostra perfil do casal, apelidos, contador desde o dia 05, status e conquistas.
- `/recado adicionar texto:` — salva uma mensagem.
- `/recado sortear` — sorteia a frase do dia.
- `/memoria adicionar titulo: descricao: data: imagem:` — salva memória do casal com imagem opcional.
- `/cine adicionar nome: tipo: plataforma: nota_trivia: nota_kaiki: comentario:` — salva filme ou série assistida.
- `/playlist definir link:` — salva o link manual da playlist.
- `/playlist ver` — mostra o link salvo.
- `/moedas ver` — mostra o saldo de MomoCoins.
- `/moedas adicionar quantidade: motivo:` — adiciona moedas manualmente.
- `/estudo iniciar` — inicia sessão de foco do casal.
- `/estudo finalizar` — finaliza sessão, calcula tempo e dá MomoCoins.
- `/mimo loja` — mostra a loja de mimos.
- `/mimo comprar item:` — compra um mimo usando moedas.

## Banco de dados

O banco é criado automaticamente na primeira execução em `./data/momozin.sqlite` com as tabelas:

- `couple_profile`
- `love_notes`
- `memories`
- `movies`
- `playlist`
- `coins`
- `gifts`
- `study_sessions`

## Estrutura

```text
src/
  commands/      Slash commands
  components/    Botões e componentes visuais
  database/      SQLite, migrações e repositórios
  events/        Eventos do Discord
  utils/         Configuração, tema e helpers
```

## Personalização futura

- Textos editáveis ficam preparados em `config/texts.json`.
- Assets visuais ficam organizados em `assets/visuals/` e cadastrados em `config/assets.json`.
- Para exibir banners/imagens em embeds futuramente, hospede os assets em uma URL pública e configure `ASSETS_BASE_URL` no ambiente.

## Emojis customizados

- Emojis ficam centralizados em `config/emojis.json`.
- O bot usa fallback Unicode quando o ID do emoji customizado ainda não foi preenchido.
- Para listar emojis do servidor Discord configurado no `.env`, rode:

```bash
npm run emojis
```

Depois copie os IDs retornados para `config/emojis.json`.


## Painel guiado

O fluxo principal do Momozin é pelo `/painel`: cada área abre botões de ação e, quando necessário, modais para preencher recados, memórias, filmes/séries, playlist e compra de mimos.

Os embeds usam banners configurados em `config/assets.json` e emojis customizados configurados em `config/emojis.json`.
