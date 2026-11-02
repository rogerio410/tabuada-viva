# Roteiro de preparação (Fases A a E)

**Este é o documento para acompanhar e retomar o trabalho entre sessões.** Origem: o plano de inicialização (fora do repositório, em `~/.claude/plans/neste-diret-rio-vamos-criar-fluttering-sky.md`), copiado aqui para ficar versionado. Atualize a coluna Status ao fechar cada item.

Depois da preparação vêm os 10 sprints do produto (fonte L377–392), detalhados em `docs/roadmap/sprints.md` (a criar na Fase C).

## Como retomar numa sessão nova

1. Leia `CLAUDE.md` e este arquivo; ache a primeira linha com status ⏳ ou 🔶.
2. Leia `docs/gdd/decisoes-abertas.md`: o que está `[PROPOSTA]` **não pode ser implementado** sem sua aprovação.
3. Diga ao Claude: "Retome a Fase X, item Y de `docs/roadmap/preparacao.md`".
4. Regras: 1 fase = 1 branch (`docs/fase-b`, `chore/fase-c`…), commits convencionais, PR no fim.

Legenda: ✅ feito · 🔶 feito com pendência humana · ⏳ a fazer.

## Fase A — Fundação do repositório · ✅ (commit `efdef4a`)

Vite, React, TS, Tailwind, PWA, Vitest, Playwright, oxlint, dependency-cruiser, husky, CI, scripts `check:bundle` e `check:trackers`.

## Fase B — Documentação de design · 🔶 (branch `docs/fase-b`, PR aberto)

| Item                                       | Onde                                           | Status                                                                    |
| ------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------- |
| GDD fatiado                                | `docs/gdd/`                                    | ✅                                                                        |
| Registro de decisões                       | `docs/gdd/decisoes-abertas.md`                 | 🔶 D10, D17–D20 aprovadas; **D1–D9, D11–D16 e cajus (D15) aguardam você** |
| Mundos e fases (71)                        | `docs/gdd/mundos-e-fases.md`                   | 🔶 falta amostragem humana de ~10%                                        |
| UX: interface, acessibilidade, voz do Calú | `docs/ux/`                                     | ✅ aprovados                                                              |
| Arte e áudio                               | `docs/art/`, `docs/audio-brief.md`             | ✅ (lista de animais a conferir)                                          |
| Pedagogia                                  | `docs/pedagogia/`                              | 🔶 BNCC sem verificação oficial                                           |
| Template de spec e índice de ADRs          | `docs/roadmap/specs/_template.md`, `docs/adr/` | ✅ (ADRs só índice)                                                       |

**Para fechar a Fase B:** aprovar/ajustar D1–D9 e D11–D16; conferir BNCC no texto do MEC; amostrar `mundos-e-fases.md`.

## Fase C — Contratos para a IA desenvolver · ⏳ (próxima)

Pré-requisito: decisões D1, D2, D4, D5, D9, D11, D12 e D16 fechadas (elas definem schema e motor).

| #   | Item                                                                                                                                     | Entregável                                                                                                                                 | Status                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| 10  | Esquemas Zod de conteúdo + 5 histórias de exemplo + validador que recalcula a conta, faixa, contexto/tipo, vocabulário, tamanho de frase | `src/content/schema/`, `scripts/validate-content.ts`                                                                                       | ⏳                           |
| 11  | Ports de repositório + fake em memória (`FactStateRepo`, `AttemptRepo`, `SessionRepo`, `WalletRepo`)                                     | `src/domain/ports/`                                                                                                                        | ⏳                           |
| 12  | Skills e subagentes                                                                                                                      | `.claude/skills/{nova-historia,nova-fase,novo-sprint}`, `.claude/agents/{revisor-pedagogico,revisor-seguranca-infantil,revisor-ui-mobile}` | ⏳                           |
| 13  | Specs completas dos Sprints 1 e 2                                                                                                        | `docs/roadmap/specs/sprint-1-*.md`, `sprint-2-*.md`, `docs/roadmap/sprints.md`                                                             | ⏳                           |
| 14  | Mapa BNCC com pendências                                                                                                                 | `docs/pedagogia/bncc-mapa.md`                                                                                                              | 🔶 existe; falta conferência |
| —   | Parâmetros novos em `params.ts` (com sua aprovação)                                                                                      | `src/domain/config/params.ts`                                                                                                              | ⏳                           |
| —   | Fonte Nunito em `public/fonts`, ícone do PWA, botão `#1F7A44`                                                                            | `public/`, `src/index.css`                                                                                                                 | ⏳                           |

**Saída da Fase C:** `validate:content` falha com conta errada e passa nos 5 exemplos; `/nova-historia` e `revisor-pedagogico` produzem saída aderente ao schema; specs 1 e 2 revisadas por você; teste de "prompt frio" (sessão nova, só `CLAUDE.md` + spec do Sprint 1, começa o agendador com testes primeiro).

## Fase D — Privacidade e segurança infantil · ⏳

| #   | Item                                                                                | Entregável                                                                             |
| --- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 15  | Mapa de dados, retenção, direito de apagar, termo v1, política                      | `docs/privacidade/` (consentimento: 100% revisão humana; revisão jurídica recomendada) |
| 16  | `check-no-trackers` ampliado, CSP restritiva, sem links externos na área da criança | `scripts/`, `index.html`                                                               |
| 17  | Modelo RLS e migrações Supabase testadas localmente; limite de tentativas do PIN    | `supabase/`                                                                            |

Adicionar Supabase ou Recharts exige sua aprovação (dependência nova).

## Fase E — Piloto e métricas · ⏳

`docs/piloto/protocolo-ana.md` (semana 0, 3 carinhas, perguntas à professora) e instrumentação local, sem analytics externo.

## Depois: Sprints 0 a 9 do produto

Ver `docs/roadmap/sprints.md` (Fase C, item 13) e a fonte L377–392. Cada sprint segue: spec → testes primeiro → código → `npm run verify` + `npm run e2e` → PR.
