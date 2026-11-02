# ADR 0002 — Backend: Supabase (Postgres, Auth, RLS)

Status: aceita para a fase de planejamento; **ainda não há projeto Supabase** nem a dependência `@supabase/supabase-js` (entra no Sprint 4, com sua aprovação).

## Contexto

Contas só de adultos, isolamento por família e por turma, sem servidor próprio (fonte L323, L339, L344).

## Decisão

Postgres com RLS em todas as tabelas, Supabase Auth para o login do adulto. O modelo, as policies e as funções (PIN, apagar, vínculo de turma) vivem em `supabase/migrations/` em SQL puro, testados em um Postgres local com `auth` simulado (`npm run test:db`). A autorização é feita **no banco**, não na interface.

## Consequências

- O isolamento é provado por teste, incluindo mutações das policies.
- O `auth.uid()` simulado precisa ser conferido contra um projeto real no Sprint 4.
- Trocar de provedor mexe só em `src/data` e em `supabase/`.

## Alternativas

Django + DRF + Postgres, citado na fonte como saída se for preciso controle total do backend; o núcleo em `src/domain` não muda.
