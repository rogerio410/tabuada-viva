# ADR 0001 — Stack: React + Vite + TypeScript + Tailwind + PWA

Status: aceita (registra o que a fonte e a Fase A já decidiram; sem decisão nova).

## Contexto

Jogo mobile-first, instalável e offline, feito em sprints curtos com Claude Code (fonte L331–344).

## Decisão

React + Vite + TypeScript + Tailwind; PWA com `vite-plugin-pwa` (Workbox); animação com Framer Motion, uso contido; dados locais em IndexedDB via Dexie; testes com Vitest (motor) e Playwright em 360×740.

## Consequências

- Bundle JS < 300 KB gzip imposto por `npm run check:bundle`.
- Tudo funciona offline; a nuvem é opcional e só vem no Sprint 4.
- Fontes self-hosted (Nunito em `public/fonts`).

## Alternativas

Framework com SSR e app nativo: descartados por peso, custo e ritmo de entrega (fonte).
