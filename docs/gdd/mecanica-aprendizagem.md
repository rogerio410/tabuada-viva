# Mecânica de aprendizagem

Status: base FIEL À FONTE (L175–215); lacunas fechadas como `[PROPOSTA D<n>]` (ver `decisoes-abertas.md`). Destino dos números no código: `src/domain/config/params.ts`. **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

## Estados de um fato

Um fato é um par não ordenado quando a operação é comutativa `[APROVADO D10]`. Subtração e divisão são ordenadas.

| Estado     | Significa                                       | Entra por                                                                 | Revisão (`reviewIntervalDays`) |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------ |
| Novo       | Ainda não apresentado                           | início                                                                    | —                              |
| Aprendendo | Visto; precisa de apoio visual                  | apresentado na fase                                                       | `0` = toda sessão              |
| Praticando | Acerta sem apoio, mas devagar ou oscilando      | 3 acertos seguidos sem apoio (`streakToPracticing`)                       | 2 dias                         |
| Fluente    | Acerta rápido em dias diferentes                | 2 acertos rápidos, sem apoio, em 2 dias de calendário diferentes `[D1]`   | 5 dias                         |
| Dominado   | Acerto rápido mantido depois de intervalo longo | acerto rápido, sem apoio, em revisão vencida de Fluente (≥ 5 dias) `[D1]` | 14 dias                        |

[FONTE L181–187]

"Rápido" = tempo ≤ `fastAnswerMs` (4 s). Ajuste por dígito e operação em `[APROVADO D2]`. O tempo vai do aparecimento da conta ao primeiro toque de resposta.

## Tabela de transições (resposta → novo estado) `[APROVADO D1]`

Uma resposta tem três atributos: correta?, com apoio?, rápida?

| Estado atual | Correta, sem apoio, rápida         | Correta, sem apoio, lenta | Correta, com apoio         | Errada                        |
| ------------ | ---------------------------------- | ------------------------- | -------------------------- | ----------------------------- |
| Novo         | vira Aprendendo ao ser apresentado | —                         | —                          | —                             |
| Aprendendo   | conta para a sequência de 3        | conta para a sequência    | fica; sequência não avança | fica; fato volta em 2–3 itens |
| Praticando   | conta para Fluente (dia 1)         | fica                      | fica                       | desce para Aprendendo         |
| Fluente      | acerto do dia                      | fica                      | fica; **não** promove      | desce para Praticando         |
| Dominado     | mantém; próxima revisão em 14 dias | fica; revisão em 5 dias   | volta a Fluente            | desce para Fluente            |

Regras comuns:

- Erro nunca desce abaixo de Aprendendo (L189), reinicia o intervalo do novo estado e reinsere o fato na mesma sessão após `errorReturnAfterItems` (2–3 itens).
- Acerto com ajuda mantém Aprendendo ou Praticando e nunca promove a Fluente (L191). O apoio é registrado em `attempt.apoio_usado`.
- Acerto lento sem apoio nunca rebaixa.
- A sequência de 3 é zerada por erro, não por acerto lento.

## Montagem de uma sessão (`sessionMinutes` 10–12)

[FONTE L193–199]

1. **Aquecimento:** 3 fatos já dominados (começar acertando). Sem fatos dominados, 3 fatos de maior estado disponível.
2. **Revisões vencidas:** priorizando os de nível mais baixo.
3. **Conteúdo novo:** fase atual, no máximo `maxNewFactsPerSession` = 2 fatos novos.
4. **História:** 1 ou 2 situações-problema.
5. **Fechamento:** um item fácil e a recompensa.

### Regras de dosagem

- Proporção-alvo: cerca de 70% conhecidos e 30% novos ou frágeis (L201).
- Acerto da sessão < `easeBelowAccuracy` (0,70): reduz itens novos e volta o apoio visual.
- Acerto > `accelerateAboveAccuracy` (0,90) por `accelerateAfterSessions` (3) sessões: acelera.
- Zona 70–80% e 90%+ por menos de 3 sessões: sem mudança. **Reduzir vence acelerar** `[D4]`.
- A sessão para sozinha após 10–12 min com o Calú: "Bora descansar? Amanhã tem mais!" (L312). Progresso é guardado a qualquer momento.
- Aprendendo "toda sessão" respeita o teto de novos: entram só os Aprendendo da fase atual; os mais antigos competem por vaga nas revisões `[D12]`.

## Fase e sessão `[APROVADO D12]`

Uma fase leva cerca de 2 a 3 sessões: apresentação e prática guiada (6 a 8 itens) na primeira; prática intercalada e história na seguinte. A fase libera a próxima com ≥ 80% de acerto (2 estrelas); ver estrelas em `recompensas-e-economia.md`.

## Apoios e a "retirada"

[FONTE L80–90]. Regras de sumiço, gatilho por estado do fato (proposta `[D8]`):

- Mãozinhas e quadro de dez: aparecem automáticos enquanto o fato está em Aprendendo; em Praticando ficam disponíveis no botão de ajuda; em Fluente só no botão.
- Colar de contas: Mundo 3 automático; depois só no botão.
- Reta: automática em problemas de comparar; depois, botão.
- Nunca se proíbe um apoio.

## Tabela valor → fonte → parâmetro

| Valor               | Fonte    | `params.ts`                                         |
| ------------------- | -------- | --------------------------------------------------- |
| Intervalos 0/2/5/14 | L184–187 | `reviewIntervalDays` ✅                             |
| 4 s                 | L186     | `fastAnswerMs` ✅                                   |
| 3 acertos           | L185     | `streakToPracticing` ✅                             |
| ≤ 2 novos           | L197     | `maxNewFactsPerSession` ✅                          |
| 80–85%              | L32      | `targetAccuracy` ✅                                 |
| < 70% reduz         | L201     | `easeBelowAccuracy` ✅                              |
| > 90% acelera       | L201     | `accelerateAboveAccuracy` ✅                        |
| 3 sessões           | L201     | `accelerateAfterSessions` ✅                        |
| 10–12 min           | L193     | `sessionMinutes` ✅                                 |
| volta em 2–3 itens  | L189     | `errorReturnAfterItems` ✅                          |
| Aquecimento 3       | L195     | `warmupFacts` ✅                                    |
| Prática guiada 6–8  | L168     | `guidedPracticeItems` ✅                            |
| 70/30               | L201     | `knownToNewRatio` ✅                                |
| Fluente: 2 dias     | L186     | `fluentDistinctDays` ✅ (D1)                        |
| +1 s/dígito         | —        | `fastAnswerExtraMsPerDigit` ✅ (D2)                 |
| Estrelas            | L173     | `starThresholds` ✅ (D5)                            |
| Portão              | L96–103  | `gate` ✅ (G1–G6)                                   |
| Contou de um em um  | D3       | `slowCountingFactor`, `slowCountingStreak` ✅ (D24) |
| Sessões por fase    | D12      | `phaseSessions` ✅ (D25)                            |

✅ existe em `params.ts` (novos criados na Fase C, Bloco 1) · mudar valor exige aprovação (CLAUDE.md).

## Testes de domínio exigidos (para o Sprint 1)

Escrever antes do código: cada linha da tabela de transições; erro em Aprendendo não desce; apoio não promove; sessão com `Rng` semeado é determinística; reduzir vence acelerar; teto de 2 novos.
