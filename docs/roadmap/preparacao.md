# Roteiro de preparação (Fases A a E)

**Este é o documento para acompanhar e retomar o trabalho entre sessões.** Origem: o plano de inicialização (fora do repositório, em `~/.claude/plans/neste-diret-rio-vamos-criar-fluttering-sky.md`), copiado aqui para ficar versionado. Atualize a coluna Status ao fechar cada item.

Depois da preparação vêm os 10 sprints do produto (fonte L377–392), detalhados em `docs/roadmap/sprints.md` (criado na Fase C, Bloco 5).

## Como retomar numa sessão nova

1. Leia `CLAUDE.md` e este arquivo; ache a primeira linha com status ⏳ ou 🔶.
2. Leia `docs/gdd/decisoes-abertas.md`: o que está `[PROPOSTA]` **não pode ser implementado** sem sua aprovação.
3. Diga ao Claude: "Retome a Fase X, item Y de `docs/roadmap/preparacao.md`".
4. Regras: 1 fase = 1 branch (`docs/fase-b`, `chore/fase-c`…), commits convencionais, PR no fim.

Legenda: ✅ feito · 🔶 feito com pendência humana · ⏳ a fazer.

## Fase A — Fundação do repositório · ✅ (commit `efdef4a`)

Vite, React, TS, Tailwind, PWA, Vitest, Playwright, oxlint, dependency-cruiser, husky, CI, scripts `check:bundle` e `check:trackers`.

## Fase B — Documentação de design · ✅ (aprovada em 2026-11-02)

| Item                                       | Onde                                           | Status                                                         |
| ------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------- |
| GDD fatiado                                | `docs/gdd/`                                    | ✅                                                             |
| Registro de decisões                       | `docs/gdd/decisoes-abertas.md`                 | ✅ D1–D20 aprovadas (cajus inclusos, valores iniciais)         |
| Mundos e fases (71)                        | `docs/gdd/mundos-e-fases.md`                   | ✅ aprovado                                                    |
| UX: interface, acessibilidade, voz do Calú | `docs/ux/`                                     | ✅                                                             |
| Arte e áudio                               | `docs/art/`, `docs/audio-brief.md`             | ✅                                                             |
| Pedagogia                                  | `docs/pedagogia/`                              | ✅ aprovado; ⚠ BNCC sem conferência registrada no texto do MEC |
| Template de spec e índice de ADRs          | `docs/roadmap/specs/_template.md`, `docs/adr/` | ✅                                                             |

**Pendências que não bloqueiam a Fase C:** conferir BNCC no MEC; confirmar com a professora centavos/cédulas (D19) e a aceitação da soma repetida (L483); verificar a ocorrência dos animais do álbum; revisão 100% humana das dicas de erro e da voz quando virarem conteúdo.

## Fase C — Contratos para a IA desenvolver · ✅ (fechada em 2026-11-02, com pendências humanas)

Pré-requisito: decisões D1–D20 ✅ fechadas. **Pode começar.** Primeiro item sugerido: 13 (sprints.md) e os parâmetros novos, depois 10 e 11.

| #   | Item                                                                                                                                     | Entregável                                                                                                                                 | Status                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| 10  | Esquemas Zod de conteúdo + 5 histórias de exemplo + validador que recalcula a conta, faixa, contexto/tipo, vocabulário, tamanho de frase | `src/content/schema/`, `scripts/validate-content.ts`                                                                                       | ✅                                      |
| 11  | Ports de repositório + fake em memória (`FactStateRepo`, `AttemptRepo`, `SessionRepo`, `WalletRepo`)                                     | `src/domain/ports/`                                                                                                                        | ✅                                      |
| 12  | Skills e subagentes                                                                                                                      | `.claude/skills/{nova-historia,nova-fase,novo-sprint}`, `.claude/agents/{revisor-pedagogico,revisor-seguranca-infantil,revisor-ui-mobile}` | ✅ testado (revisores e /nova-historia) |
| 13  | Specs completas dos Sprints 1 e 2                                                                                                        | `docs/roadmap/specs/sprint-1-*.md`, `sprint-2-*.md`, `docs/roadmap/sprints.md`                                                             | ✅ escritas; revisão humana dispensada  |
| 14  | Mapa BNCC com pendências                                                                                                                 | `docs/pedagogia/bncc-mapa.md`                                                                                                              | 🔶 existe; falta conferência            |
| —   | Parâmetros novos em `params.ts` (com sua aprovação)                                                                                      | `src/domain/config/params.ts`                                                                                                              | ✅ (Bloco 1)                            |
| —   | Fonte Nunito em `public/fonts`, ícone do PWA, botão `#1F7A44`                                                                            | `public/`, `src/index.css`                                                                                                                 | ✅ (Bloco 6; ícone provisório)          |

**Saída da Fase C (fechada em 2026-11-02, ver nota abaixo):** `validate:content` falha com conta errada e passa nos 5 exemplos; `/nova-historia` e `revisor-pedagogico` produzem saída aderente ao schema; specs 1 e 2 revisadas por você; teste de "prompt frio" (sessão nova, só `CLAUDE.md` + spec do Sprint 1, começa o agendador com testes primeiro).

**Fechamento da Fase C (2026-11-02):** `validate:content` falha com conta errada e passa nos 5 exemplos ✅ · skills e revisores testados em sessão nova ✅ · prompt frio feito: o agente escreveu o teste vermelho antes de qualquer código; 4 lacunas da spec (entrada de `applyAnswer`, `nextReview`, formato de `fastDays`, "acerto do dia") foram corrigidas ✅ · **specs 1 e 2 sem revisão do responsável** (ele dispensou); cada uma termina com um "padrão provisório" que só usa o já aprovado. **Pendências humanas que continuam:** conferir BNCC no MEC (item 14), amostragem humana das 5 histórias, aprovar `slowCountingFactor` (D3), teto do `timeMs` e `fake-indexeddb` se quiser; ícone e arte são provisórios.

## Fase D — Privacidade e segurança infantil · ⏳

| #   | Item                                                                                | Entregável                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15  | Mapa de dados, retenção, direito de apagar, termo v1, política                      | `docs/privacidade/` (consentimento: 100% revisão humana; revisão jurídica recomendada). **Bloco 1 ✅** mapa de dados e retenção; Bloco 5: termo e política |
| 16  | `check-no-trackers` ampliado, CSP restritiva, sem links externos na área da criança | `scripts/`, `index.html`                                                                                                                                   |
| 17  | Modelo RLS e migrações Supabase testadas localmente; limite de tentativas do PIN    | `supabase/`                                                                                                                                                |

Adicionar Supabase ou Recharts exige sua aprovação (dependência nova).

## Fase E — Piloto e métricas · ⏳

`docs/piloto/protocolo-ana.md` (semana 0, 3 carinhas, perguntas à professora) e instrumentação local, sem analytics externo.

## Depois: Sprints 0 a 9 do produto

Ver `docs/roadmap/sprints.md` (Fase C, item 13) e a fonte L377–392. Cada sprint segue: spec → testes primeiro → código → `npm run verify` + `npm run e2e` → PR.
