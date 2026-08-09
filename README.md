# Checklist Stardew Valley

Projeto completo do checklist colaborativo de fazendas, pronto para GitHub e Cloudflare Workers. A autenticação, as fazendas, os convites, os integrantes e o progresso compartilhado continuam usando o Supabase.

## Rodar no computador

Requisitos: Node.js 22.13 ou mais recente.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal.

## Enviar ao GitHub

1. Crie um repositório vazio no GitHub.
2. Extraia este pacote.
3. Envie **o conteúdo desta pasta** para o repositório — `app`, `public`, `supabase`, `package.json` etc.
4. Não envie `node_modules`, `dist`, `.env` ou chaves privadas. O `.gitignore` já bloqueia esses arquivos.

## Publicar no Cloudflare Workers

### Pelo painel do Cloudflare

1. Entre em **Workers & Pages**.
2. Clique em **Create** e depois **Import a repository**.
3. Conecte o GitHub e escolha este repositório.
4. Use estas configurações:

   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`

5. Salve e aguarde a publicação.

O arquivo `wrangler.jsonc` já informa ao Cloudflare qual Worker e quais arquivos estáticos devem ser publicados.

### Pelo terminal

```bash
npm install
npx wrangler login
npm run deploy
```

## Supabase

O projeto está ligado ao Supabase usado pelo site atual. Antes de publicar para outras pessoas, confirme no painel do Supabase:

- se as políticas RLS das tabelas estão ativas;
- se o domínio do Cloudflare está em **Authentication > URL Configuration > Redirect URLs**;
- se a função `manage-farm-invites` está publicada;
- se as migrações da pasta `supabase/migrations` já foram aplicadas.

A chave presente no frontend é a chave **publishable/anon**, feita para uso público com RLS. Nunca coloque a chave `service_role` no GitHub ou no navegador.

## Estrutura principal

- `app/`: interface e regras do site
- `public/`: imagens, sprites e fontes visuais
- `supabase/`: migrações e função de convites
- `worker/`: entrada do Cloudflare Worker
- `wrangler.jsonc`: configuração de publicação no Cloudflare

## Aviso

Este é um projeto de fãs e não é afiliado nem endossado por Stardew Valley ou ConcernedApe. Stardew Valley e seus assets pertencem aos seus respectivos proprietários.
