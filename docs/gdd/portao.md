# Portão da Multiplicação

Status: critérios FIEL À FONTE (L92–105); formalização e prazos `[PROPOSTA D6, D7, D8]`. Implementação em `src/domain/gate`; a interface só pergunta "está aberto?" (L362).

## O que fecha e o que abre

- Fechado até o Portão: Mundos 5, 6, 7, 8 e 9 (× e ÷) `[D6]`. Sem atalho no painel.
- Aberto desde o início: Mundos 1–4 em ordem fixa, e a Ponte da Escola (soma repetida; ver D13).
- Revisão espaçada de + e − continua para sempre (L105).

## Critérios como predicados

Todos precisam ser verdadeiros ao mesmo tempo. Cada um vira uma função pura `(estado, relógio) → {ok, progresso}`.

| #   | Critério           | Predicado                                                                                              | Fonte |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------ | ----- |
| G1  | Adição             | todos os 66 fatos de adição (121 células, 0+0..10+10, D10) em Fluente ou Dominado, e ≥ 90% em Dominado | L98   |
| G2  | Subtração até 20   | o mesmo de G1 sobre os 121 fatos de subtração `[D9]`                                                   | L99   |
| G3  | Família de fatos   | acerto ≥ 90% nos triângulos completados                                                                | L100  |
| G4  | Problemas aditivos | ≥ 85% na escolha da operação **e** no cálculo (juntar, acrescentar, retirar, comparar, completar)      | L101  |
| G5  | Uso de apoio       | < 10% das respostas nas últimas 2 semanas `[D8]`                                                       | L102  |
| G6  | Prova do Portão    | 40 itens mistos, sem apoio, ≥ 95%, concluída 2 vezes com ≥ 7 dias entre elas                           | L103  |

Convenções:

- G5 conta só respostas em fatos já em Praticando ou acima e fora de fases que apresentam a ferramenta `[D8]`.
- G6: item = fato de + ou −, família ou problema curto; sorteado por `Rng` injetado. Sem cronômetro visível. Pode ser repetida; só a melhor das tentativas válidas conta, e a 2ª só vale ≥ 7 dias após a 1ª aprovada.
- Estados e datas vêm de `FactStateRepo`/`AttemptRepo`; relógio via `Clock`.

## Abertura

Com G1–G6 verdadeiros, o painel avisa o adulto ("Ana está pronta para multiplicar", L105). **Só a confirmação do adulto (PIN) abre.** A criança não vê o critério nem o que falta. Fechar de novo não existe; se um critério voltar a falhar depois de aberto, nada fecha (sem punição).

## Prazo mínimo teórico `[D8]`

O caminho mais curto de Aprendendo a Dominado soma intervalos de 2 + 5 dias até Fluente e uma revisão de 5 dias para Dominado; com a revisão seguinte de 14 dias e a 2ª prova 7 dias após a 1ª, o melhor caso fica em **4 a 5 semanas** de prática constante. A fonte admite que no piloto a multiplicação provavelmente não abre no 1º mês (L469). O painel mostra o prazo estimado, sem prometer data.

## Testes de domínio exigidos

G1 com 89%/90% em Dominado; G5 na fronteira de 10%; G6 com 6 dias vs 7 dias; Portão nunca abre sem confirmação; apoio aberto não conta como acerto sem apoio; Portão independe de ordem das respostas; relógio fake.
