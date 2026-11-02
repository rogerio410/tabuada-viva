# ADR 0004 — Sem analytics, trackers nem CDNs externos; coleta mínima

Status: aceita (CLAUDE.md; fonte L366–376). Os números de retenção (D21), de PIN (D22) e a CSP restritiva em estilo (D23) são **propostas** aguardando sua aprovação.

## Contexto

O público é criança de 7 e 8 anos; a LGPD art. 14 pede tratamento no melhor interesse da criança e consentimento do responsável. Os artigos e parágrafos além do art. 14 estão **não verificados**.

## Decisão

- Coleta mínima: apelido, ano escolar e respostas. Nunca texto livre da criança.
- Nenhum analytics, rastreador, anúncio, CDN ou fonte externa. `npm run check:trackers` barra rastreadores, URLs absolutas fora de uma allowlist e, em `src/ui`, links externos, `iframe`, `fetch` e campos de texto.
- CSP restritiva e cabeçalhos de segurança de uma única fonte (`config/security-headers.mjs`), publicados em `vercel.json` e conferidos por `npm run check:headers` e pelo e2e.
- Apagar tudo da criança é uma ação do responsável (`delete_child_data` + `deleteByChild`).
- PIN: limite de tentativas no aparelho (`pin-guard`) e no servidor (`verify_adult_pin`); é um portão, não a autenticação.

## Consequências

- Sem métricas de produto de terceiros; o piloto usa instrumentação local (Fase E).
- Qualquer serviço novo (analytics, e-mail transacional, mapas) exige revisar este ADR e sua aprovação.
- A URL do Supabase entra na CSP (`connect-src`) e na allowlist do `check:trackers` no Sprint 4.

## Alternativas

Analytics anonimizado de terceiros: descartado por risco e por ir contra o CLAUDE.md.
