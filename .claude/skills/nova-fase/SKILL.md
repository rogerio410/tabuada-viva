---
name: nova-fase
description: Cria ou atualiza o catálogo de uma fase (ou mundo) em src/content/phases a partir de docs/gdd/mundos-e-fases.md, com ids de fato canônicos. Use ao catalogar fases novas para o validador de histórias.
---

# Nova fase (catálogo)

Argumento: mundo ou fase (`W3`, `W5-P02`). A fonte de verdade é `docs/gdd/mundos-e-fases.md`; **nunca mude a ordem, os nomes ou os fatos de uma fase** (decisão do humano). Se o documento estiver ambíguo, pare e pergunte.

## Passos

1. Leia a seção do mundo em `docs/gdd/mundos-e-fases.md`, as convenções no topo e `docs/gdd/decisoes-abertas.md` (D9, D10, D16 — contagem de fatos, par não ordenado, regras).
2. Veja o formato em `src/content/phases/world-1.json` e o schema em `src/content/schema/phase.ts` e `world.ts`.
3. Escreva `src/content/phases/world-<n>.json`: fases `W<n>-P<nn>` na ordem do documento; `newFacts` com ids canônicos (`add:a+b` e `mul:axb` com a ≤ b; `sub:a-b`; `div:a/b`); Grande Desafio com `newFacts: []` e `grandChallenge: true`. Nome da fase sem o prefixo "GD:" é aceito, mas siga o documento.
4. **Confira a contagem** contra o documento (ex.: Mundo 1 = 36 fatos de adição; Mundo 2 = 66 de subtração). Gere a lista por script em vez de digitar à mão quando for longa; divergência de contagem = pare e relate.
5. Rode `npm run validate:content` e `npm test`. Rode também as histórias de exemplo: avisos "fase fora do catálogo" devem sumir para as fases novas.
6. Regras (+0, ×0, ×1, ÷1, n÷n, 0÷n) não são "fases de fato novo" no catálogo da v1 do validador: liste os fatos cobertos individualmente (D16a) e avise no relato.

## Relate

Fatos por fase, total do mundo, divergências com o documento e tudo que ficou como suposição.
