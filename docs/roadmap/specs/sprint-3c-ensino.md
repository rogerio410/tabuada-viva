# Spec Sprint 3c — Camada de ensino (Mundos 1 e 2)

Status: aprovada em 2026-11-02 (storyboard, vocabulário das lições e pendências delegados pelo responsável à IA; reversíveis)
Branch: `sprint-3c/ensino`

## 1. Objetivo

Uma criança que não sabe nada abre o jogo e **aprende** juntar, tirar e os primeiros padrões da tabuada: cada uma das 15 fases de W1 e W2 começa com uma **lição** (objetos do seu mundo, mãos na massa), uma descoberta de **padrão** sem explicação direta, uma **prática guiada** com apoio que some e só então a prática livre. O motor de lições é reutilizável nos Mundos 3 a 9.

## 2. Pilares afetados

- [x] estratégia antes de memória: cada fase ensina o truque (juntar, dobro, par de 10, tirar como quanto falta) antes de pedir fatos
- [x] zero punição/zero cronômetro: lição sem tempo, sem "errado"; errar numa pergunta guiada mostra a dica visual e deixa tentar de novo
- [ ] leitura como alavanca (histórias seguem no 3b)
- [x] alicerce antes de ×/÷: só adição e subtração; o mapa de padrões de ×/÷ é só documento
- [x] adulto no controle: nada novo para o adulto; a lição nunca mostra critérios do Portão

Nenhum pilar é tensionado.

## 3. Regras do GDD relevantes

- `docs/gdd/mundos-e-fases.md` (estratégia e CPA por fase) · fonte L165–173 (anatomia da fase: apresentação CPA, prática guiada 6–8, prática intercalada).
- `docs/gdd/mecanica-aprendizagem.md` ("Apoios e a retirada") · `docs/gdd/tipos-de-erro-e-dicas.md` · `docs/ux/ui-rules.md` · `docs/ux/acessibilidade.md` · `docs/ux/voz-do-calu.md`.
- Decisões `[APROVADO]`: D1, D2, D3/D24 (contou de um em um), D4, D5, D11, D12/D25, D16 (triângulo), D17, D18. **D27** (esta camada) `[DECIDIDO PELA IA a pedido do responsável]`.
- **Pré-requisitos:** Sprints 1 a 3 mesclados em `main` (PRs #4, #5, #6).

## 4. Critérios de aceite (Dado / Quando / Então)

### 4.1 Lição na primeira vez

- **Dado** uma fase com fato novo e **nenhuma resposta** da criança nela, **quando** ela toca na fase no mapa, **então** abre a **lição** antes de qualquer pergunta; ao terminar, vem a prática guiada e depois o fluxo normal.
- **Dado** uma fase já jogada, **então** a lição **não** abre sozinha; o mapa tem "Ver a lição" para rever e a ajuda tem "Ver o truque".
- **Dado** os Grandes Desafios (sem fato novo), **então** abrem uma lição curta (festa/feira) que revisa os truques por escolha de cartões, sem fato novo.

### 4.2 Passos da lição

- **Dado** qualquer passo, **então** há um botão "Continuar" (≥ 56 px), nada depende de tempo, e a lição pode ser retomada do começo.
- **Dado** `join`/`remove`/`tenframe`/`numline`/`swap`/`family`, **então** a criança manipula por toque (sem arrastar obrigatório) e vê o resultado.
- **Dado** uma pergunta `ask` ou `choose` com resposta fora do esperado, **então** a dica visual aparece e a criança tenta de novo; **nenhum `Attempt` é gravado e nenhuma ferramenta da lição entra em `supportsUsed`**.

### 4.3 Padrão do dia

- **Dado** a tira de contas da fase, **quando** a criança escolhe um de 3 cartões para a próxima, **então** acerta ou vê a tira se completar sozinha; só depois o Calú diz **uma** frase que nomeia o padrão.
- **Dado** um padrão, **então** ele nunca é pedido por texto livre.

### 4.4 Prática guiada

- **Dado** a 1ª sessão de uma fase nova, **então** vêm 6 a 8 itens (`PARAMS.guidedPracticeItems`) cobrindo cada fato novo ao menos 2 vezes; o apoio some: 1º terço com ferramenta aberta, 2º no botão, último sem apoio.
- **Dado** esses itens, **então** são `Attempt` normais (apoio registrado, nunca promove a Fluente).

### 4.5 "Ver o truque"

- **Dado** um fato com `needsStrategyHint` (acerto sem apoio, > 2× o limiar rápido, 2 vezes seguidas, D24), **quando** ele é apresentado, **então** a tela oferece "Ver o truque" (abre a parte da lição daquele fato); nunca interrompe, nunca é erro.

### 4.6 Conteúdo e validação

- **Dado** `lessons/world-1.json` e `world-2.json`, **então** `validate:content` falha com: palavra proibida, palavra fora do vocabulário das lições, frase com mais de ~10 palavras, número por extenso, `target` que não bate com o fato, fase com fato novo sem lição.
- **Dado** o lote, **então** `review.origin = "ia"` e `humanSample = "pendente"` até a amostragem humana (~10%); dicas de erro seguem 100% humanas.

## 5. Casos de borda

Fase sem fato novo (Grande Desafio) · recarregar no meio da lição (recomeça a lição, nada gravado) · voltar do mapa durante a lição · offline · "reduzir movimento" (animações só em CSS) · criança que já sabe (a lição é curta e "Continuar" não pune) · lição repetida muitas vezes (não grava nada) · leitor de tela (cada passo tem texto) · relógio de dia diferente (sem efeito).

## 6. Fora de escopo

× e ÷ e Mundos 3–9 (só o mapa de padrões como documento) · histórias e Ponte da Escola (3b) · minijogos Monta-Grupos, Fileiras, Qual Conta?, Caixa do Mercadinho · dominó/dados de relance como aquecimento · narração por voz · arte final · cajus e álbum · contas, sync e painel · mudar `params.ts`, schema do Dexie ou a lista de vocabulário das histórias.

## 7. Parâmetros

Nenhum valor novo. Usa `PARAMS.guidedPracticeItems` (6–8), `slowCountingFactor`, `slowCountingStreak`, `phaseSessions` já aprovados. **Mudança de valor = decisão humana.**

## 8. Testes exigidos

- Domínio (Vitest, **antes do código**): `guidedItems` (tamanho 6–8, cada fato novo ≥ 2×, determinismo com `seededRng`) e `scaffoldFor` (apoio não cresce).
- Conteúdo: `validateLesson` (falhas listadas em 4.6) e teste "toda fase com `newFacts` tem lição".
- Controlador (fakes em memória): ordem lição → guiada → livre; repetir a lição não grava; apoio da lição não conta; retomar no meio; `strategyHint` chega à UI.
- Playwright 360×740: lição obrigatória na 1ª vez e não na 2ª; "Ver a lição"; padrão por cartões; guiada com apoio sumindo; nenhuma lição gera `Attempt`; alvos ≥ 56 px e espaço ≥ 12 px em todos os passos; sem rolagem horizontal; sem cronômetro; offline; sem `<input>`; foco ao trocar de passo; `reducedMotion`.
- Camadas: `npm run lint:layers`; sem dependência nova (animações só em CSS).

## 9. Impacto em dados e LGPD

Nenhum dado novo. A lição vista é **derivada** das respostas existentes (sem tabela nem campo). Sem analytics, trackers ou CDN. Direito de apagar já coberto.

## 10. Checklist de segurança infantil

- [ ] Sem anúncio, compra, chat, ranking, link externo na área da criança
- [ ] Sem texto livre da criança
- [ ] Sem som ou texto de fracasso; sem cronômetro visível
- [ ] Tempo de resposta nunca mostrado à criança
- [ ] Textos revisados (amostragem ~10%; **dicas de erro 100%**)

## 11. Definition of Done

`npm run verify` e `npm run e2e` verdes · bundle JS < 300 KB gzip · teste para toda mudança em `src/domain` (escrito antes) · conteúdo novo passa em `validate:content` · revisores `revisor-pedagogico`, `revisor-ui-mobile` e `revisor-seguranca-infantil` · PR com o checklist acima.

## Pendências humanas

1. Ler o **storyboard** (`docs/pedagogia/ensino-por-fase.md`) e aprovar/ajustar as 15 lições e os padrões.
2. Aprovar a lista de **vocabulário das lições** (diff proposto no storyboard; não altero a lista das histórias).
3. Amostragem (~10%) das falas; dicas de erro 100%.
4. Arte provisória dos objetos (`OBJ-*`) e do Calú; teste com a Ana depois do sprint.
