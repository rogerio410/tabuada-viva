# Recompensas e economia

Status: princípios FIEL À FONTE (L259–269). Estrelas `[PROPOSTA D5]`. **Todos os valores de cajus são `[RASCUNHO – decisão humana D15]`**: a fonte não traz números e o CLAUDE.md reserva a economia ao responsável.

## Princípios (inegociáveis)

1. Premiam esforço e acerto, **nunca velocidade** (L261).
2. Nada se perde por errar ou por ficar um dia sem jogar (L261, L267).
3. Nenhuma recompensa é aleatória (sem caixas de sorte).
4. Nenhuma recompensa depende de tempo de resposta, de comparação com outra criança ou de gastar dinheiro real.
5. Poupar e esperar são escolhas, não obrigações; a criança nunca fica "sem nada para fazer".
6. A economia não pode empurrar para sessões longas: há teto diário.

## Componentes

| Componente              | Regra                                                                                       | Fonte     |
| ----------------------- | ------------------------------------------------------------------------------------------- | --------- |
| Estrelas (1–3 por fase) | pelo % de acerto da fase; vale o melhor resultado; ver tabela                               | L263 · D5 |
| Álbum Bichos do Piauí   | figurinha ao terminar fase; página completa = bônus de cajus                                | L264      |
| Cajus                   | moeda por sessão concluída; gasta na lojinha (decorar a casa do Calú)                       | L265      |
| Cofrinho                | cajus guardados rendem bônus semanal pequeno; itens especiais exigem juntar por alguns dias | L266      |
| Jardim da semana        | planta cresce um estágio por dia de prática; pular um dia = não cresce; **nunca murcha**    | L267      |
| Avatar                  | itens de roupa/cor/acessório liberados com o progresso                                      | L226      |

## Estrelas `[PROPOSTA D5]`

| Estrelas | Acerto na fase | Efeito                                           |
| -------- | -------------- | ------------------------------------------------ |
| 1        | ≥ 60%          | recompensa pequena; fase seguinte **não** libera |
| 2        | ≥ 80%          | libera a próxima fase                            |
| 3        | ≥ 95%          | figurinha rara da fase                           |

Refazer a fase usa itens diferentes; vale o melhor resultado. Texto ao 1 estrela: "Boa! Vamos treinar mais um pouquinho com o Calú?" (nunca "você não passou").

## Cajus — rascunho de valores `[RASCUNHO – D15]`

| Evento                        | Cajus                          | Observação                                                                                               |
| ----------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Sessão concluída (fechamento) | 10                             | por dia; a 2ª sessão no mesmo dia rende 0 (teto diário, sem punição: o Calú diz "Já ajudou muito hoje!") |
| Fase concluída (≥ 1 estrela)  | +5                             | uma vez por fase                                                                                         |
| Página do álbum completa      | +15                            |                                                                                                          |
| Cofrinho semanal              | 5% do saldo guardado, máx. +10 | calculado no domingo sobre o saldo; não depende de dias jogados                                          |

Preços na lojinha:

| Tipo                                                    | Preço | Equivale a         |
| ------------------------------------------------------- | ----- | ------------------ |
| Item pequeno                                            | 30    | ~3 dias de prática |
| Item médio                                              | 50    | ~5 dias            |
| Item especial (exige guardar ≥ 3 dias antes de comprar) | 120   | ~2 semanas         |

### Simulação de 4 semanas (prática de 5 dias por semana, ~2 fases por semana)

- Ganho por semana: 5 × 10 + 2 × 5 = 60 cajus; em 4 semanas ≈ 240.
- Gasto exemplo: 1 especial (120) + 2 médios (100) + 1 pequeno (30) = 250 ≈ 240 + bônus de cofrinho (poucos cajus). Equilibrado: a criança compra algo toda semana, e o especial pede esperar.
- Criança que joga 3 dias por semana ganha 38/semana e ainda compra um pequeno em 1 semana. Nada fica fora de alcance.

### Salvaguardas

- Saldo nunca diminui, exceto por compra voluntária.
- Sem itens de duração limitada nem "só hoje".
- Sem compra em um toque: toda compra tem confirmação com a figura do item (evita erro de criança de 7 anos).
- Os valores moram em `src/domain/config` quando aprovados; testes cobrem teto diário e bônus do cofrinho.

## Fora

Anúncios · compras reais · caixas de sorte · ranking · contagem regressiva nas fases de aprendizagem (L269).
