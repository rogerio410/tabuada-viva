# Tabuada Viva

PWA mobile-first para crianças de 7–8 anos. Veja `CLAUDE.md` e `docs/`.

    npm install && npm run dev

## Segurança e privacidade

- `npm run check:trackers` barra rastreadores, CDNs e URLs externas no build, e links externos ou texto livre em `src/ui` (regras em `scripts/lib/tracker-rules.mjs`).
- Cabeçalhos (CSP etc.) vêm de `config/security-headers.mjs`. Depois de mudar, rode `npm run gen:headers` para atualizar `vercel.json`; `npm run check:headers` (parte do `verify`) falha se estiver fora de sincronia.
- O `vite preview` e o e2e usam os mesmos cabeçalhos da Vercel; o `vite dev` não usa CSP (o HMR injeta scripts inline).
- `npm run test:db` aplica as migrações de `supabase/` em um Postgres local temporário e roda os testes de RLS (ver `supabase/README.md`). Roda na CI, fora do `verify`.
- `npm run check:secrets` barra senhas, chaves e tokens no repositório e no build (também no pre-commit). Credenciais só por ambiente: copie `.env.example` para `.env.local` (ignorado pelo git). Veja `docs/privacidade/seguranca-de-credenciais.md`.
