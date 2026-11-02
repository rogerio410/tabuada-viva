# ADR 0003 — Domínio puro, `Clock`/`Rng` injetados, camadas impostas

Status: aceita (fonte L325; CLAUDE.md).

## Contexto

O motor pedagógico (estados, revisão espaçada, Portão, limite do PIN) precisa ser 100% testável e independente de interface e banco.

## Decisão

`src/domain` é TypeScript puro: sem React, I/O, zod ou Dexie. Nada de `Date.now()` nem `Math.random()`: o tempo e o sorteio entram por `Clock` e `Rng` (`src/domain/ports/clock.ts`). Repositórios são interfaces em `src/domain/ports`; as implementações ficam em `src/data`. Parâmetros pedagógicos só em `src/domain/config/params.ts`; parâmetros de segurança em `config/security.ts`. As camadas são impostas por `npm run lint:layers` (dependency-cruiser).

## Consequências

- Testes determinísticos com `seededRng` e relógio falso.
- Contratos de repositório compartilhados (`repo.contract.ts`) servem aos fakes e ao Dexie.
- Mudar valor de `params.ts` é decisão humana.

## Alternativas

Lógica dentro dos componentes React: descartada por ser difícil de testar e de trocar a camada de dados.
