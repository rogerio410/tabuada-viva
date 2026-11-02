# Tipos de erro e dicas

Status: 5 tipos FIEL À FONTE (L203–215). Enum estendido e exemplos de dica: `[RASCUNHO – revisão humana]`. **Dicas de erro: 100% revisão humana** (CLAUDE.md). Nenhum texto aqui vai direto para o jogo. **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

## Princípios

- O jogo nunca diz "errado". Responde com dica específica e visual (L205).
- A dica **desce a cadeia** até a soma: ÷ → × irmão → soma repetida `[D11]`; − → adição inversa (L64); × → soma repetida (L115).
- A dica é mostrada uma vez por erro; o fato volta em 2–3 itens (L189).
- Nunca exibe tempo (L189).

## Enum `error_type` `[PROPOSTA]`

Fonte original + extensão para ÷, dinheiro e problemas. A coluna 3 diz como o motor detecta.

| Código                          | Quando                    | Detecção                                                                           |
| ------------------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `added_instead_of_multiplied`   | 6 × 4 = 10                | resposta = a + b                                                                   |
| `off_by_one_group`              | 7 × 6 = 36                | resposta = a × (b ± 1) ou (a ± 1) × b                                              |
| `swapped_subtraction`           | 5 − 8                     | operandos trocados                                                                 |
| `slow_counting`                 | acerto lento              | ver D3 (não é erro)                                                                |
| `wrong_operation`               | somou onde era repartir   | problema, escolha da operação; vai ao painel como **erro de interpretação** (L215) |
| `multiplied_instead_of_divided` | 12 ÷ 3 = 36               | resposta = a × b                                                                   |
| `used_wrong_divisor`            | 12 ÷ 3 = 6                | resposta = a ÷ (outro divisor da família)                                          |
| `money_change_error`            | pão R$ 3, paga 5, troco 3 | erro só na etapa de subtração do troco                                             |
| `other`                         | não reconhecido           | dica genérica de soma/família                                                      |

Erros de cálculo e de interpretação são contados separadamente (L215, L295).

## Rascunhos de dica `[RASCUNHO – revisão humana]`

Frases curtas, tom do Calú, pt-BR, sem "errado".

- `added_instead_of_multiplied`: "Vamos ver! São 6 grupos de 4 pães. Quantos pães ao todo?"
- `off_by_one_group`: "Quase! Você achou 6 × 6. Falta mais um grupo de 6."
- `swapped_subtraction`: "Se eu só tenho 5, dá pra tirar 8? Vamos olhar juntos."
- `slow_counting` (próxima vez): "Que tal um atalho? 6 + 6 é o dobro de 6."
- `wrong_operation`: relê a história destacando a palavra-chave ("repartir", "ao todo", "sobrou").
- `multiplied_instead_of_divided`: "Repartir é dividir. 12 pães em 3 sacos: quantos em cada?"

## Fluxo no motor

`Resposta` → classificador puro (`src/domain/errors`) → `error_type` → `HintPlan` com os passos da cadeia → UI renderiza. O classificador é testado por tabela (entrada → tipo).

## Painel

- Fatos teimosos mostram o erro mais comum e a dica em uso (L283).
- `wrong_operation` aparece só em "Problemas: leitura × cálculo".
- Texto do painel nunca rotula a criança.
