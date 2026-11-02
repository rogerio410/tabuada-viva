---
name: nova-historia
description: Gera um lote de histórias (situações-problema) do Tabuada Viva no schema de src/content, valida com validate:content e chama o revisor pedagógico. Use quando pedirem novas histórias, problemas ou um lote para uma fase ou mundo.
---

# Nova história (lote)

Argumentos esperados: fase(s) alvo (`W<n>-P<nn>`), quantidade, e opcionalmente contexto/tipo desejados. Se faltar a fase, pergunte.

## Leia antes (nesta ordem)

1. `docs/gdd/mundos-e-fases.md` — a linha da fase: fatos novos, estratégia, tipo · contexto, BNCC.
2. `docs/pedagogia/checklist-conteudo.md` — itens A a I.
3. `docs/ux/voz-do-calu.md` — regras de escrita e palavras que não usamos.
4. `src/content/schema/problem.ts` e `src/content/stories/exemplo-1.json` — formato exato.
5. `src/domain/facts/fact-id.ts` — ids de fato e `rootChain` (D11).

## Passos

1. **Escolha os fatos** só entre os já apresentados até a fase (catálogo em `src/content/phases/`; fase fora do catálogo gera aviso — confira à mão em `mundos-e-fases.md`).
2. **Escreva o lote** em `src/content/stories/<lote>.json` no formato `{ batch, problems }`:
   - `id` = `<fase>-H<nn>`, único; `origin: "ia"`, `reviewer: null`, `humanSample: "pendente"`.
   - Texto: 2 a 4 frases, até 10 palavras cada, a última (e só ela) é a pergunta; números em algarismo; vocabulário de 2º ano; pt-BR, tom gentil, sem piadas, sem pressão de tempo, tratamento neutro quanto a gênero; sem marcas, pessoas reais, URL.
   - Contexto ∈ casa, rua, escola, compras, festa; tipo ∈ juntar, acrescentar, retirar, comparar, completar, grupos iguais, "a cada", retangular, repartir, medir. Nenhum contexto/tipo acima de 30% do lote.
   - `fact` em id canônico; `rootChain` = `rootChain(fact)` (vazio em adição); em × inclua `repeatedSum` (ex.: 3×4 → `[4,4,4]`). "Completar" em adição: a resposta é a parcela que falta.
   - `numbers` = algarismos do texto, na ordem; 2 ou mais `distractors` plausíveis (erros típicos: somar em vez de multiplicar, errar um grupo), nunca iguais à resposta.
   - Para ×, comece pela soma repetida e só depois o produto (alicerce primeiro).
3. **Valide:** `npm run validate:content`. Corrija até 0 erros. Palavra fora de `src/content/vocab/palavras-2ano.json` reprova: reescreva a frase; **não** acrescente palavras à lista sem pedir ao humano.
4. **Revise:** chame os subagentes `revisor-pedagogico` e `revisor-seguranca-infantil` com o caminho do lote. Aplique as correções e valide de novo.
5. **Relate:** quantas histórias, avisos restantes, pendências dos revisores e que o lote exige **amostragem humana de ~10%** (`humanSample` continua `"pendente"` até o responsável revisar).

## Não faça

- Não escreva dicas de erro nem textos de consentimento/privacidade (100% humano).
- Não altere schema, validador, vocabulário, `params.ts` nem a ordem de mundos/fases.
- Não marque `humanSample` como aprovado.
