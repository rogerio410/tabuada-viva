# GDD — Tabuada Viva

Game Design Document fatiado por tema. A fonte de verdade é `docs/00-fonte/tabuada-viva.md` (imutável); estes arquivos a detalham, tornam testável e sinalizam o que ela deixa em aberto.

## Ordem de leitura

1. `pilares-e-regras.md` — o que nunca muda.
2. `mecanica-aprendizagem.md` — estados, sessão, parâmetros.
3. `portao.md` · `mundos-e-fases.md` · `tipos-de-erro-e-dicas.md` · `recompensas-e-economia.md` · `painel.md`.
4. `decisoes-abertas.md` — tudo o que depende de aprovação humana.

## Convenção de rótulos

Cada arquivo abre com um bloco de status. Cada regra carrega um destes rótulos:

| Rótulo                        | Significado                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `[FONTE L<n>]`                | Vem do documento-fonte; `n` é a linha em `docs/00-fonte/tabuada-viva.md`.                                                 |
| `[PROPOSTA D<n>]`             | A fonte não define. Proposta da IA, ligada a uma decisão em `decisoes-abertas.md`. **Não implementar antes de aprovada.** |
| `[RASCUNHO – revisão humana]` | Texto ou valor provisório. Dicas de erro, termos de consentimento e voz do Calú exigem 100% de revisão humana.            |
| `[APROVADO]`                  | Decisão fechada pelo responsável (data e quem).                                                                           |

Números pedagógicos têm um único destino em código: `src/domain/config/params.ts`. Os documentos citam o nome do parâmetro. Mudar valor ali exige aprovação humana (CLAUDE.md).

## Glossário

- **Fato:** uma conta básica com resposta única (ex.: 7 × 8). Em +, −, ×, ÷.
- **Fato raiz:** o fato de adição do qual outro fato deriva. Todo fato de −, × e ÷ aponta para um.
- **Família de fatos:** o triângulo de 3 números e suas 4 contas (3 + 5, 5 + 3, 8 − 3, 8 − 5).
- **Estado:** Novo, Aprendendo, Praticando, Fluente, Dominado.
- **Apoio:** ferramenta aberta pela criança (Mãozinhas, quadro de dez, colar de contas, reta). Permitido, registrado, nunca promove a Fluente.
- **Sessão:** uma visita de 10 a 12 minutos. **Fase:** unidade de conteúdo com 5 partes. Uma sessão pode cobrir parte de uma fase ou mais de uma (ver D12).
- **Portão:** regra de domínio que abre os mundos de × e ÷.
- **Prova do Portão:** o desafio de 40 itens da fonte (L103, "Prova da Ponte"). Renomeada aqui para não colidir com Ponte do Poti e Ponte da Escola (D7).
- **Calú:** calango guia. Gentil, animado, nunca dá bronca.
- **Base e extensão:** o escopo "0 a 10" da fonte (L15) é a base da tabuada; adição e subtração vão até 20 (L56, Mundo 3).

## Consistência com o código

- Camadas impostas por `npm run lint:layers` (dependency-cruiser) e `oxlint`; não há ESLint no projeto.
- `src/domain` não usa `Date.now()` nem `Math.random()`; injeta `Clock` e `Rng` (`src/domain/ports/clock.ts`).
