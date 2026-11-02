---
name: novo-sprint
description: Prepara um sprint do Tabuada Viva: cria a spec a partir do template, a branch sprint-N/<nome> e o plano de testes primeiro. Use ao começar o Sprint N ou ao pedirem a spec de um sprint.
---

# Novo sprint

Argumento: número do sprint (0–9) e, opcionalmente, o nome. Roteiro dos sprints: `docs/roadmap/sprints.md` (se ainda não existir, fonte L381–392 em `docs/00-fonte/tabuada-viva.md`).

## Passos

1. Leia `CLAUDE.md`, `docs/roadmap/preparacao.md`, a linha do sprint e `docs/gdd/decisoes-abertas.md`. **Qualquer decisão `[PROPOSTA]` aberta bloqueia o que depende dela.**
2. Se `docs/roadmap/specs/sprint-<N>-*.md` já existe, use-a (não reescreva); se está "rascunho", peça aprovação antes de codar.
3. Se não existe, crie a partir de `docs/roadmap/specs/_template.md` (as 11 seções): critérios Dado/Quando/Então, casos de borda, fora de escopo, parâmetros (valor mudou = decisão humana), testes exigidos, impacto LGPD e checklist de segurança infantil. Cite só decisões `[APROVADO]` e os trechos do GDD por arquivo e seção. Status: `rascunho`. **Pare e peça a revisão do humano.**
4. Com a spec aprovada: `git switch -c sprint-<N>/<nome>` (1 sprint = 1 branch).
5. Plano de execução: **testes primeiro** (Vitest em `src/domain` com `Clock`/`Rng` injetados; Playwright em 360×740 para toda tela nova; `validate:content` para conteúdo), depois o código mínimo.
6. Antes de abrir PR: `npm run verify` e `npm run e2e` verdes, bundle JS < 300 KB gzip, camadas respeitadas (`npm run lint:layers`).

## Pergunte ao humano (não decida)

Valores de `params.ts` · textos de consentimento/privacidade · economia de cajus · dependência nova · ordem de mundos/fases.
