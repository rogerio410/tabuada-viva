# ADR 0005 — Segredos e credenciais fora do código

Status: aceita (decisão técnica; os valores do PIN continuam `[PROPOSTA D22]`).

## Contexto

O projeto lida com dados de crianças e vai ter login de adultos (Sprint 4). Um vazamento de chave `service_role` ou de senha anularia o RLS e o consentimento.

## Decisão

- Nenhuma senha, chave ou token no repositório: `npm run check:secrets` roda no `verify` e no pre-commit e também varre o build.
- Credenciais só por ambiente (`.env.local` fora do git, `~/.pgpass`, segredos do CI/Vercel). `.env.example` só com nomes.
- `service_role` nunca no cliente; só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` podem ir para o bundle.
- Senha do adulto: só Supabase Auth. PIN: bcrypt custo 10 no servidor e PBKDF2 (WebCrypto) no aparelho, sempre com limite de tentativas.
- Sem `console.*` em `src/` (evita vazar dado pessoal em log).
- `npm audit` no CI.

## Consequências

- Rodar `npm run test:db` exige `PGPASSWORD` ou `.env.local`.
- Valor de teste que pareça segredo precisa de placeholder ou de `secret-scan: ignore` justificado.
- O scanner é por padrões: não substitui rotação de chaves nem revisão de código.

## Alternativas

Gerenciador de segredos externo (Vault, 1Password CLI): descartado por ora, por custo e por não haver servidor próprio.
