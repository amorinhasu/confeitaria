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
- MomoCoins, estudos do Kaiki e loja de mimos.

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
```

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
- `/memoria adicionar titulo: descricao: data:` — salva memória do casal.
- `/cine adicionar nome: tipo: plataforma: nota_trivia: nota_kaiki: comentario:` — salva filme ou série assistida.
- `/playlist definir link:` — salva o link manual da playlist.
- `/playlist ver` — mostra o link salvo.
- `/moedas ver` — mostra o saldo de MomoCoins.
- `/moedas adicionar quantidade: motivo:` — adiciona moedas manualmente.
- `/estudo iniciar` — inicia sessão de estudo do Kaiki.
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
