# ADRs

Registro de decisões de arquitetura. Formato: Contexto · Decisão · Consequências · Alternativas. Os quatro primeiros foram redigidos na Fase D e **apenas registram o que já estava decidido**; nenhum cria decisão nova.

| #    | Título                                                                                                      | Status | Fonte                  |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------ | ---------------------- |
| 0001 | [Stack: React + Vite + TypeScript + Tailwind + PWA](0001-stack.md)                                          | aceita | fonte L331–344         |
| 0002 | [Backend: Supabase (Postgres, Auth, RLS); alternativa Django](0002-backend-supabase.md)                     | aceita | fonte L323, L339, L344 |
| 0003 | [Domínio puro em `src/domain`, `Clock` e `Rng` injetados, camadas impostas](0003-dominio-puro.md)           | aceita | fonte L325; CLAUDE.md  |
| 0004 | [Sem analytics, trackers nem CDNs externos; coleta mínima (LGPD art. 14)](0004-privacidade-sem-trackers.md) | aceita | CLAUDE.md              |
| 0005 | [Segredos e credenciais fora do código](0005-segredos-e-credenciais.md)                                     | aceita | boas práticas; Fase D  |

Candidatas (propostas, não decididas): ADR de áudio sintetizado por Web Audio (D18), de fatos por par não ordenado (D10, aprovada), de fonte Nunito em `public/fonts`.
