# Sprints do produto (0 a 9)

Fonte: `docs/00-fonte/tabuada-viva.md` (L379–392, imutável). Cada sprint segue: **spec aprovada → testes primeiro → código → `npm run verify` + `npm run e2e` → PR**, em uma branch `sprint-N/<nome>`. Use a skill `/novo-sprint`.

Legenda: ✅ feito · 🚧 em andamento (spec aprovada) · 🔶 spec escrita, aguardando sua aprovação · ⏳ a especificar.

| #   | Sprint                      | Entrega (fonte)                                                                                                                | Pronto quando (fonte)                                                                                | Spec                                                               | Status |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| 0   | Fundação                    | Repositório, Vite + React + TS + Tailwind, PWA, CI, CLAUDE.md, estrutura de pastas                                             | App vazio instala no celular e passa no CI                                                           | — (Fase A)                                                         | ✅     |
| 1   | Motor pedagógico            | Catálogo de fatos com raiz, estados, agendador, montador de sessão, classificador de erros, registro de apoio, regra do Portão | Testes cobrem promoção, rebaixamento, acerto com apoio, os 5 tipos de erro e cada critério do Portão | [sprint-1-motor-pedagogico.md](specs/sprint-1-motor-pedagogico.md) | ✅     |
| 2   | Loop de jogo e ferramentas  | Tela de sessão, teclado próprio, Resposta Rápida, Mãozinhas, quadro de dez, reta numérica, progresso no IndexedDB              | Uma sessão completa roda offline usando os dedos na tela                                             | [sprint-2-loop-de-jogo.md](specs/sprint-2-loop-de-jogo.md)         | ✅     |
| 3   | Mundos 1 e 2 (núcleo)       | Adição até 10 e subtração como adição ao contrário, família de fatos, mapa de mundo, estrelas, avanço de fase                  | A Ana joga 3 dias seguidos (primeiro teste real)                                                     | [sprint-3-mundos-1-2.md](specs/sprint-3-mundos-1-2.md)             | 🔶     |
| 3b  | Histórias e Ponte da Escola | Histórias dos Mundos 1 e 2, fluxo de resposta de história, Ponte da Escola com Tabela que Cresce e formulário de lição         | Histórias aprovadas por amostragem; lição de casa vira Tabela                                        | ⏳                                                                 | ⏳     |
| 4   | Contas e sincronização      | Login do adulto, perfis, termo de consentimento, RLS, sync offline → nuvem                                                     | Progresso aparece em outro aparelho; dados isolados por família                                      | ⏳ (depende da Fase D)                                             | ⏳     |
| 5   | Mundos 3 e 4 + Portão       | Colar de contas, adição e subtração até 20, Caixa do Mercadinho, Qual Conta?, Prova do Portão (D7), painel do Portão           | O alicerce completo é jogável e o Portão só abre com todos os critérios                              | ⏳                                                                 | ⏳     |
| 6   | Mundos 5, 6 e 7             | Multiplicação como soma repetida, Monta-Grupos, Fileiras, dicas que voltam à soma                                              | Cada fato de × mostra sua soma de origem; tabuadas de 2 a 10 jogáveis                                | ⏳                                                                 | ⏳     |
| 7   | Mundos 8 e 9 + recompensas  | Divisão, Fábrica de Histórias, álbum, cajus, cofrinho, lojinha                                                                 | As 4 operações completas e todas as recompensas                                                      | ⏳                                                                 | ⏳     |
| 8   | Painel                      | Resumo, mapa da tabuada, BNCC, leitura × cálculo, fatos teimosos, uso de apoio, PDF                                            | Um responsável entende o painel sem explicação                                                       | ⏳                                                                 | ⏳     |
| 9   | Turma e polimento           | Visão do professor, autorização de vínculo, acessibilidade, kit imprimível, testes em aparelhos reais                          | Piloto com 5 a 10 crianças                                                                           | ⏳                                                                 | ⏳     |

Status: **Sprint 1 concluído** e mesclado em `main` (PR #4, `sprint-1/motor-pedagogico`). **Sprint 2 concluído** e mesclado em `main` (PR #5, `sprint-2/loop-de-jogo`). Pendências humanas do Sprint 2 (amostragem dos textos novos, revisão da dica de erro, teste em aparelho real) estão no fim da spec. Próximo: Sprint 3 (Mundos 1 e 2), que ainda precisa de spec.

Nota de nomes: a fonte chama o desafio do Sprint 5 de "Prova da Ponte"; pela D7 ele é a **Prova do Portão**.

## Dependências entre sprints

- 1 → 2 → 3: o motor existe antes da tela; a tela existe antes dos mundos.
- A **Fase C, Bloco 6** (fonte Nunito, ícone do PWA, botão `#1F7A44`) deve estar pronta antes do Sprint 2 (primeira tela real).
- O Sprint 3 precisa de histórias dos Mundos 1 e 2 (skill `/nova-historia`, com amostragem humana de ~10% por lote) e do catálogo de fases (`/nova-fase`).
- O Sprint 4 depende da **Fase D** (mapa de dados, termo de consentimento revisado por você, modelo RLS). Supabase e Recharts são dependências novas: exigem sua aprovação.
- O Sprint 5 só entrega o Portão completo se o Sprint 1 já implementou G1–G6 no domínio.
- O primeiro teste real com a Ana é no fim do Sprint 3; o piloto formal é a Fase E.

## Decisões que travam cada sprint

Todas as decisões D1–D20 estão `[APROVADO]` (2026-11-02). Pendências externas que **não** travam os Sprints 1 e 2: BNCC conferida no MEC, centavos e cédulas com a professora (D19, antes do Sprint 5), aceitação da soma repetida pela escola (antes do Sprint 6), animais do álbum (antes do Sprint 7).
