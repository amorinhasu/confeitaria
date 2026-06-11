# Auditoria de textos e assets visuais do Momozin

Este documento lista os pontos atuais e futuros em que o Momozin pode usar imagens, GIFs, banners e textos personalizáveis.

## Estrutura recomendada de assets

```text
assets/
  README.md
  visuals/
    panel/
    manual/
    recados/
    memorias/
    cine/
    playlist/
    estudos/
    momocoins/
    mimos/
    perfil/
    feedback/
config/
  assets.json
  texts.json
```

## Imagens, GIFs e banners por categoria

| Categoria | Arquivo recomendado | Formato | Tamanho | Pasta | Embed/comando |
| --- | --- | --- | --- | --- | --- |
| Painel principal | `painel-principal-banner.png` | PNG | 1200x400 | `assets/visuals/panel/` | Embed principal de `/painel` |
| Manual | `manual-home-banner.png` | PNG | 1200x400 | `assets/visuals/manual/` | Embed inicial de `/manual` |
| Manual | `manual-categoria-banner.png` | PNG | 1200x400 | `assets/visuals/manual/` | Categorias do manual |
| Recados | `recados-banner.gif` | GIF | 800x300 | `assets/visuals/recados/` | `/recado adicionar` e `/recado sortear` |
| Memórias | `memorias-banner.png` | PNG | 1200x400 | `assets/visuals/memorias/` | `/memoria adicionar` |
| CineMomozin | `cinemomozin-banner.jpg` | JPG | 1200x400 | `assets/visuals/cine/` | `/cine adicionar` |
| Playlist | `playlist-banner.gif` | GIF | 800x300 | `assets/visuals/playlist/` | `/playlist definir` e `/playlist ver` |
| Estudos do Kaiki | `estudos-kaiki-banner.png` | PNG | 1200x400 | `assets/visuals/estudos/` | `/estudo iniciar` e `/estudo finalizar` |
| MomoCoins | `momocoins-banner.png` | PNG | 1200x400 | `assets/visuals/momocoins/` | `/moedas ver` e `/moedas adicionar` |
| Mimos | `loja-mimos-banner.png` | PNG | 1200x400 | `assets/visuals/mimos/` | `/mimo loja` e `/mimo comprar` |
| Perfil do casal | `perfil-casal-banner.png` | PNG | 1200x400 | `assets/visuals/perfil/` | `/perfil` |
| Mensagens de erro/sucesso | `sucesso-momozin.gif` | GIF | 600x240 | `assets/visuals/feedback/` | Mensagens de sucesso |
| Mensagens de erro/sucesso | `erro-momozin.gif` | GIF | 600x240 | `assets/visuals/feedback/` | Mensagens de erro |

## Textos personalizáveis

| Categoria | Onde aparece | Nome recomendado | Texto atual | Melhor local |
| --- | --- | --- | --- | --- |
| Mensagem de boas-vindas | Futuro onboarding/manual | `welcome_message` | `Bem-vindos ao quartinho azul de madrugada da Trívia e do Kaiki.` | `config/texts.json` |
| Manual | Futuro `/manual` | `manual_intro_title` | `💙 Manual do Momozin` | `config/texts.json` |
| Manual | Futuro `/manual` | `manual_intro_description` | `Olá, Trívia e Kaiki!...` | `config/texts.json` |
| Perfil do casal | `/perfil` | `profile_title` | `💙 Perfil do casal` | `config/texts.json` |
| Perfil do casal | `/perfil` | `profile_description` | `O arquivo oficial, fofo e de madrugada do casal Momozin.` | `config/texts.json` |
| Perfil do casal | Banco inicial | `profile_status_default` | `Em call de madrugada, rindo baixo e se escolhendo todo dia 💙` | Banco para status editável; fallback em `config/texts.json` |
| Recados | `/recado adicionar` | `recado_saved` | `O Momozin guardou essa frase no potinho azul.` | `config/texts.json` |
| Recados | `/recado sortear` vazio | `recado_empty` | `💌 Ainda não tem recados salvos. Use /recado adicionar primeiro.` | `config/texts.json` |
| Memórias | `/memoria adicionar` | `memoria_saved` | `Essa memória foi colocada no mural azul do Momozin.` | `config/texts.json` |
| CineMomozin | `/cine adicionar` | `cine_saved` | `entrou para a listinha azul do casal.` | `config/texts.json` |
| Playlist | `/playlist definir` | `playlist_saved` | `Link guardado. Sem Spotify API por enquanto, só o aconchego manual.` | `config/texts.json` |
| Playlist | `/playlist ver` vazio | `playlist_empty` | `🎧 Nenhuma playlist salva ainda. Use /playlist definir.` | `config/texts.json` |
| Estudos | `/estudo iniciar` | `study_started` | `Cronômetro ligado para o Kaiki farmar foco e MomoCoins.` | `config/texts.json` |
| Estudos | `/estudo finalizar` | `study_finished_message` | `Kaiki estudou bonito e o Momozin ficou orgulhoso.` | `config/texts.json` |
| MomoCoins | `/moedas ver` | `coins_balance_prefix` | `Saldo atual` | `config/texts.json` |
| Loja de Mimos | `/mimo loja` | `gifts_shop_description` | `Troque MomoCoins por recompensas fofas...` | `config/texts.json` |
| Conquistas | Banco inicial | `profile_achievements_default` | `Sobreviver a saudade; Maratonar juntinhos; Estudar sem surtar; Farmar MomoCoins` | Banco para personalização do casal; fallback em `config/texts.json` |
| Mensagens de erro | comando desconhecido | `unknown_command_error` | `💙 Esse comando não foi encontrado no caderninho do Momozin.` | `config/texts.json` |
| Mensagens de erro | erro genérico | `generic_command_error` | `💙 O Momozin tropeçou no cobertor azul. Tenta de novo daqui a pouquinho!` | `config/texts.json` |
| Mensagens de erro | botão do painel | `panel_button_error` | `💙 Não consegui abrir essa área agora, momo. Tenta de novo já já!` | `config/texts.json` |
| Mensagens de sucesso | `/moedas adicionar` | `coins_added_title` | `🪙 MomoCoins adicionadas` | `config/texts.json` |
| Painel principal | `/painel` | `panel_title` | `💙 Painel Momozin` | `config/texts.json` |
| Painel principal | `/painel` | `panel_description` | `Bem-vindos ao quartinho azul de madrugada...` | `config/texts.json` |
| Painel principal | `/painel` | `panel_footer` | `Momozin acordado, fofo e levemente engraçadinho.` | `config/texts.json` |
| Mensagens automáticas futuras | Boa noite | `future_goodnight_message` | `Boa noite, momo. Dorme com o coração quentinho 💙` | `config/texts.json` |
| Mensagens automáticas futuras | Lembrete de call | `future_call_reminder` | `Já separou a água e o cobertor para a call?` | `config/texts.json` |

## Forma recomendada de personalização futura

1. Textos fixos e globais devem ficar em `config/texts.json`.
2. Textos que o casal edita dentro do Discord, como status, conquistas, playlist e recados, devem ficar no SQLite.
3. Assets devem ser cadastrados em `config/assets.json` e armazenados em `assets/visuals/...`.
4. Para exibir imagens em embeds, hospede os arquivos publicamente e defina `ASSETS_BASE_URL`; o helper `getAssetPublicUrl()` monta a URL pública para uso futuro em `momozinEmbed({ image })`.
