# Sistema de emojis customizados do Momozin

O Momozin agora centraliza emojis em `config/emojis.json`, organizados por categoria. Quando um emoji tiver `id`, o bot renderiza o emoji customizado do Discord (`<:nome:id>` ou `<a:nome:id>`). Enquanto o `id` estiver `null`, o bot usa o `fallback` Unicode para continuar funcionando.

## Emojis disponíveis no servidor

Este ambiente não possui `.env` com `DISCORD_TOKEN` e `DISCORD_GUILD_ID`, então não foi possível consultar a API do Discord daqui para listar os emojis reais do servidor.

Para listar os emojis no ambiente com token configurado, rode:

```bash
npm run emojis
```

Depois copie os IDs retornados para `config/emojis.json`.

## Categorias configuradas

- `manual`
- `painel`
- `perfil`
- `recados`
- `memórias`
- `cine`
- `playlist`
- `estudos`
- `momocoins`
- `mimos`
- `feedback`
- `reações`

## Como preencher um emoji customizado

```json
{
  "name": "momozin_azul",
  "id": "123456789012345678",
  "animated": false,
  "fallback": "💙"
}
```

Com `id` preenchido, o helper troca o fallback por `<:momozin_azul:123456789012345678>` automaticamente.


## Mapeamento visual final

O mapeamento atual prioriza estética de confeitaria, madrugada e casal: `cookieheart` para perfil, `melodyheart` para recados, `bookcoffee` para estudos, `happypudding`/`cakecreamy` para mimos e `skyky`/`heartsparkles` para navegação e painel.

Todos os emojis configurados atualmente têm IDs reais e `animated: false`.
