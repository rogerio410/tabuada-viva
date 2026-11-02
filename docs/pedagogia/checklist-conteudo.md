# Checklist de conteúdo

Status: `[PROPOSTA]` para aprovação. Usado por (1) o validador determinístico `validate:content`, (2) o subagente revisor e (3) o humano na amostragem. Vale para histórias, dicas, cartões da Fábrica de Histórias e textos do Calú.

## Quem revisa o quê

| Quem                                              | Faz                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Validador (`scripts/validate-content.ts`, Fase C) | tudo o que é determinístico: itens A a E                                                                |
| Subagente revisor                                 | itens F a I (ambiguidade, tom, adequação)                                                               |
| **Humano**                                        | **~10% de cada lote**; **100% das dicas de erro e dos textos de consentimento/privacidade** (CLAUDE.md) |

Um lote só é aceito se o validador passa e o subagente não deixa pendência.

## A. Estrutura (validador)

- [ ] Passa no schema Zod (`Fact`, `Phase`, `World`, `Problem`); ID único e estável (`W<n>-P<nn>` para fases).
- [ ] Tem `contexto` (casa, rua, escola, compras, festa) e `tipo` (juntar, acrescentar, retirar, comparar, completar, grupos iguais, "a cada", retangular, repartir, medir).
- [ ] Referencia fase e fato que existem em `mundos-e-fases.md`.
- [ ] Todo fato de −, × e ÷ aponta para o fato raiz de adição (D11).

## B. Matemática (validador)

- [ ] A conta é **recalculada**; a resposta bate.
- [ ] Números dentro da faixa do mundo (W1 até 10; W2 até 10; W3–W4 até 20; W5–W9 fatos de 0 a 10 e produtos até 100; dinheiro inteiro até R$ 20).
- [ ] Só os fatos já apresentados até aquela fase (mais os da fase atual).
- [ ] Distratores (alternativas erradas) existem, são plausíveis e **não** coincidem com a resposta certa.
- [ ] Problema com resto só em W8-P07 em diante.

## C. Texto (validador)

- [ ] Frases com até ~10 palavras; história com 2 a 4 frases (L30).
- [ ] Números em algarismo.
- [ ] Nenhuma palavra da lista proibida (`voz-do-calu.md`).
- [ ] Vocabulário dentro da lista de palavras permitidas de 2º ano `[lista a criar na Fase C]`.
- [ ] Sem texto livre da criança, sem pergunta aberta.
- [ ] Sem URL, e-mail, telefone ou marca.

## D. Segurança infantil (validador + subagente)

- [ ] Nada de medo, violência, perigo, morte, corpo/peso, religião, política.
- [ ] Sem nomes de pessoas reais ou de marcas; sem preços de marcas reais.
- [ ] Sem ligação entre recompensa e comida como prêmio moral.
- [ ] Personagens sozinhos à noite: não.

## E. Tom (validador + subagente)

- [ ] Voz do Calú: gentil, animado, sem bronca, **sem piadas**.
- [ ] Sem pressão de tempo e sem comparação com outras crianças.
- [ ] Tratamento neutro quanto a gênero.

## F. Ambiguidade (subagente)

- [ ] Só uma resposta correta possível; o enunciado diz o que se pergunta.
- [ ] A **palavra-chave** da operação aparece no texto, sem pistas enganosas.
- [ ] Interpretar vem antes de calcular em problemas (L31).
- [ ] Dados desnecessários só em problemas marcados como tais.

## G. Adequação pedagógica (subagente)

- [ ] Coerente com a estratégia da fase (`mundos-e-fases.md`).
- [ ] Respeita C–P–A: o objeto/desenho existe antes da conta.
- [ ] Contexto é familiar a criança de Teresina, compreensível fora do Piauí.
- [ ] Distribuição do lote: nenhum contexto/tipo passa de 30% do lote.

## H. Dicas de erro (100% humano)

- [ ] Descem a cadeia até a soma (D11); mostram o caminho, não dizem "errado".
- [ ] Uma ideia por dica; texto curto; sem culpa nem ironia.
- [ ] Não revelam a resposta de forma que impeça pensar.

## I. Registro

- [ ] Origem do texto (IA/humano), data, revisor, resultado da amostragem humana por lote.

## Resultado do lote

Aprovado · Aprovado com ajustes · Reprovado. Reprovação humana de qualquer item em H reprova o lote inteiro de dicas.
