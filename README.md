# Tabuada Viva

PWA mobile-first para crianças de 7–8 anos. Veja `CLAUDE.md` e `docs/`.

    npm install && npm run dev

## Segurança e privacidade

- `npm run check:trackers` barra rastreadores, CDNs e URLs externas no build, e links externos ou texto livre em `src/ui` (regras em `scripts/lib/tracker-rules.mjs`).
- Cabeçalhos (CSP etc.) vêm de `config/security-headers.mjs`. Depois de mudar, rode `npm run gen:headers` para atualizar `vercel.json`; `npm run check:headers` (parte do `verify`) falha se estiver fora de sincronia.
- O `vite preview` e o e2e usam os mesmos cabeçalhos da Vercel; o `vite dev` não usa CSP (o HMR injeta scripts inline).
