# Tabuada Viva

Jogo web (PWA) mobile-first para crianças de 7–8 anos dominarem as tabuadas. Fonte de verdade do design: `docs/00-fonte/tabuada-viva.md` (imutável). GDD fatiado em `docs/gdd/`. Plano de preparação: `~/.claude/plans/neste-diret-rio-vamos-criar-fluttering-sky.md`.

## Antes de qualquer tarefa, leia (nesta ordem)

1. A spec do sprint em `docs/roadmap/specs/` · 2. O GDD do tema em `docs/gdd/` · 3. ADRs em `docs/adr/`.

## Regras inegociáveis

- Mobile-first: testar sempre em viewport 360x740, retrato.
- Nada de cronômetro visível, vidas, punição ou som de fracasso. Sem anúncios, compras, chat, ranking.
- Textos para a criança: frases curtas, pt-BR, tom do Calú (gentil e animado).
- Coleta mínima de dados da criança (LGPD art. 14): apelido, ano escolar, respostas. Sem analytics/trackers/CDNs externos (fontes self-hosted).
- Nunca texto livre vindo da criança; Fábrica de Histórias usa cartões pré-definidos.
- Alicerce primeiro: × e ÷ só abrem pelo Portão (`src/domain/gate`), sem atalho.
- Todo fato de −, × e ÷ aponta para seu fato raiz de adição; dicas de erro voltam à soma.
- Apoios (dedos, quadro de dez, contas) são permitidos, registrados e nunca promovem a Fluente.
- Nunca inventar códigos BNCC nem artigos de lei; usar `docs/pedagogia/bncc-mapa.md` e sinalizar o que não foi verificado.

## Arquitetura (imposta por `npm run lint:layers`)

- `src/domain` → motor pedagógico em TS puro (sem React, I/O, zod, dexie). Sem `Date.now()`/`Math.random()`: injetar `Clock`/`Rng` (`src/domain/ports/clock.ts`). Parâmetros pedagógicos só em `src/domain/config/params.ts`.
- `src/content` → mundos, fases, fatos e histórias em JSON validado por Zod.
- `src/data` → repositórios (Dexie local, Supabase remoto) atrás de interfaces de `domain/ports`.
- `src/ui` → telas, componentes, minijogos. `src/dashboard` → painel de adultos. Um não importa o outro.
- Aliases: `@domain/* @content/* @data/* @ui/* @dashboard/*`.

## Comandos

`npm run dev | test | e2e | lint | typecheck | validate:content | verify` (verify = lint + tsc + testes + conteúdo + build + bundle + trackers).

## Definition of Done

`npm run verify` e `npm run e2e` verdes; bundle JS < 300 KB gzip; teste novo para toda mudança em `src/domain` (escrever o teste antes); teste Playwright em 360x740 para toda tela nova; conteúdo novo passa em `validate:content`.

## Decisões que a IA NÃO toma sozinha (pedir ao humano)

Mudar valores de `params.ts`; textos de consentimento/privacidade; economia de cajus; adicionar dependência; mudar ordem de mundos/fases.

## Conteúdo

Lotes de histórias/dicas: validador determinístico + subagente revisor + **amostragem humana de ~10% por lote** (responsável pelo projeto). Textos de consentimento e dicas de erro: 100% humano.

## Convenções

Código em inglês, conteúdo/UI em pt-BR. Commits convencionais. 1 sprint = 1 branch.
