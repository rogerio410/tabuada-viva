# Spec Sprint 1 — Motor pedagógico

Status: rascunho. O responsável dispensou a revisão em 2026-11-02; vale o **padrão provisório** do fim do arquivo, que só usa o que já está aprovado.
Branch: `sprint-1/motor-pedagogico`

## 1. Objetivo

O jogo passa a ter um cérebro testado: dado o histórico de respostas de uma criança, o motor diz **qual é o estado de cada fato, o que revisar hoje, quais itens montam a próxima sessão, que tipo de erro foi cometido e se o Portão da Multiplicação pode abrir**. Tudo em TypeScript puro (`src/domain`), sem tela.

## 2. Pilares afetados

Marcar (`docs/gdd/pilares-e-regras.md`):

- [x] estratégia antes de memória: todo fato do catálogo aponta para o fato raiz (D11)
- [x] zero punição/zero cronômetro: o tempo é medido em silêncio; erro nunca desce abaixo de Aprendendo; nada fecha de novo no Portão
- [ ] leitura como alavanca (sem impacto: não há conteúdo de história neste sprint)
- [x] alicerce antes de ×/÷: o Portão é uma função pura sem atalho
- [x] adulto no controle: o Portão só abre com confirmação do adulto

Nenhum pilar é tensionado.

## 3. Regras do GDD relevantes

- `docs/gdd/mecanica-aprendizagem.md`: estados, **tabela de transições**, montagem de sessão, dosagem, apoios, testes exigidos.
- `docs/gdd/portao.md`: critérios G1–G6 como predicados, abertura, prazo, testes exigidos.
- `docs/gdd/tipos-de-erro-e-dicas.md`: enum `error_type`, fluxo `Resposta → classificador → HintPlan`.
- `docs/gdd/mundos-e-fases.md`: contagem de fatos e regras.
- Decisões (todas `[APROVADO 2026-11-02]`): D1 transições e Fluente em 2 dias · D2 limiar de 4 s com ajuste · D3 contou de um em um · D4 faixa de acerto e "reduzir vence" · D9 contagem (66/121/45/81) · D10 par não ordenado · D11 cadeia de raiz · D12 sessão × fase · D16 regras e triângulo · D8 janela do apoio no Portão.
- Já existem: `src/domain/ports/*` (repositórios + fakes, Bloco 2), `src/domain/facts/fact-id.ts` (id e cadeia de raiz, Bloco 3), `src/domain/config/params.ts` (Bloco 1).

## 4. Critérios de aceite (Dado / Quando / Então)

Cada critério vira pelo menos um teste. Tempo e sorteio sempre por `Clock` e `Rng` injetados.

### 4.1 Catálogo de fatos (`src/domain/facts/catalog.ts`)

- **Dado** o catálogo, **quando** contado, **então** há 66 fatos de adição, 121 de subtração, 45 de multiplicação e 81 de divisão (D9), mais as regras +0, −0/n−n, ×0/×1 e ÷1/n÷n/0÷n. Se a contagem derivada da definição não bater com estes números, **pare e relate** (não ajuste os números).
- **Dado** qualquer fato de −, × ou ÷, **quando** se pede `rootChain(id)`, **então** a cadeia termina em um fato de adição que existe no catálogo.
- **Dado** `div:12/3`, **então** a cadeia é `mul:3x4` → `add:4+4`.

### 4.2 Limiar de resposta rápida

- **Dado** um fato de 1 dígito no resultado, **quando** o tempo ≤ 4000 ms e sem apoio, **então** é rápida.
- **Dado** resultado de 2 dígitos, **então** o limiar é 4000 + 1000 ms; **dado** um fato de ÷, **então** soma `fastAnswerDivisionExtraMs` (D2).
- **Dado** que a criança abriu qualquer apoio, **então** a resposta nunca é rápida. **Dado** item de história, **então** nunca é rápida.

### 4.3 Transições de estado (cada célula da tabela de `mecanica-aprendizagem.md`)

Função pura `applyAnswer(state: FactState, answer: AnswerOutcome, now: Date) → { state: FactState; returnToQueue: boolean }`, em `src/domain/scheduler/apply-answer.ts`.

- `AnswerOutcome = { correct: boolean; fast: boolean; supported: boolean }`, **já resolvido por quem chama**: `supported` vem de `supportsUsed.length > 0` (4.7b) e `fast` da função `isFast(...)` da 4.2. `applyAnswer` não mede tempo.
- **`FactState` novo** é criado por `presentFact(childId, factId, now)` em estado Aprendendo, com `nextReview = now`, `streak = 0`, `fastDays = []`.
- **`nextReview`:** depois de **toda** resposta, `nextReview = now + reviewIntervalDays[estado resultante]` em dias de calendário, inclusive quando o estado não muda (erro em Aprendendo continua com intervalo 0, ou seja, `nextReview = now`). Única exceção: Dominado com acerto lento sem apoio usa `reviewIntervalDays.fluente` (5 dias), sem parâmetro novo.
- **"Revisão vencida"** significa `nextReview ≤ now` **antes** da resposta.
- **`fastDays`:** dias locais `YYYY-MM-DD` derivados de `now` (fuso do aparelho); sem duplicatas no mesmo dia.
- **"Acerto do dia" (Fluente, fora da revisão vencida):** não muda nada observável; o estado e o `nextReview` não se alteram.
- `correct`, `streak`, `wrong` e `medianMs` são atualizados por quem persiste a `Attempt` (Sprint 2); `applyAnswer` só atualiza `status`, `nextReview`, `streak` e `fastDays`.

Regras por estado:

- **Aprendendo:** acerto sem apoio (rápido ou lento) soma 1 à sequência; ao chegar a 3 (`streakToPracticing`) vira **Praticando**. Acerto com apoio não avança a sequência. Erro zera a sequência, o estado fica e o fato volta à fila em 2–3 itens.
- **Praticando:** acerto rápido sem apoio registra o dia de calendário em `fastDays`; ao ter **2 dias diferentes** (`fluentDistinctDays`) vira **Fluente**. Acerto lento ou com apoio: fica. Erro: desce para Aprendendo.
- **Fluente:** acerto rápido sem apoio em revisão vencida (≥ 5 dias) vira **Dominado**; fora da revisão vencida, "acerto do dia": fica. Acerto lento ou com apoio: fica e **não promove**. Erro: desce para Praticando.
- **Dominado:** acerto rápido sem apoio mantém, próxima revisão em 14 dias. Acerto lento sem apoio: fica, revisão em 5 dias. Acerto com apoio: volta a Fluente. Erro: desce para Fluente.
- **Em toda mudança:** `nextReview = now + reviewIntervalDays[novo estado]` (dias de calendário); erro nunca desce abaixo de Aprendendo; acerto lento sem apoio nunca rebaixa; apoio nunca promove a Fluente.
- **Fluente / "acerto do dia":** os `fastDays` só se acumulam enquanto o fato está em Praticando; ao rebaixar para Aprendendo ou Praticando, `fastDays` é zerado.

### 4.4 "Contou de um em um" (D3)

- **Dado** acerto sem apoio com tempo > 2 × o limiar, **quando** acontece 2 vezes seguidas no mesmo fato, **então** o motor marca `slowCounting` para a **próxima apresentação** (a UI mostra a dica de estratégia). Nunca interrompe o acerto e nunca conta como erro (`slow_counting` não vai para a taxa de erros do painel).

### 4.5 Montador de sessão (`src/domain/session`)

`buildSession(input, rng, now) → SessionPlan` com itens ordenados em: **aquecimento → revisões vencidas → conteúdo novo → história → fechamento** (D12).

- **Aquecimento:** `warmupFacts` (3) fatos já Dominados; sem Dominados, os 3 de maior estado disponível; nunca menos que o disponível.
- **Revisões:** fatos vencidos (`nextReview ≤ now`), do estado mais baixo ao mais alto; Aprendendo "toda sessão" só da fase atual (os mais antigos competem por vaga nas revisões).
- **Novos:** no máximo `maxNewFactsPerSession` (2) **itens de apresentação**: uma regra conta como 1 item, a unidade de −, × e ÷ é o triângulo; irmãos − e ÷ só entram quando o fato raiz está em Praticando ou acima (D16).
- **Dosagem:** proporção-alvo 70% conhecidos / 30% novos ou frágeis (`knownToNewRatio`).
- **Erro dentro da sessão:** `reinsertAfterError(queue, factId, rng)` recoloca o fato após 2 ou 3 itens (`errorReturnAfterItems`).
- **Determinismo:** mesma entrada + mesmo `seededRng` ⇒ mesmo plano.
- A sessão não guarda duração: quem para aos 10–12 min é a UI (Sprint 2); o domínio só devolve `sessionMinutes`.

### 4.6 Adaptação entre sessões (D4)

`adaptNextSession(history) → { maxNew, restoreSupport, accelerate }`:

- Acerto da sessão = respostas corretas **sem apoio** ÷ todas as respostas (acerto com ajuda entra só no denominador).
- Acerto < 0,70 (`easeBelowAccuracy`): reduz os novos e `restoreSupport = true`.
- Acerto > 0,90 (`accelerateAboveAccuracy`) por 3 sessões seguidas (`accelerateAfterSessions`): `accelerate = true`.
- Zonas 0,70–0,80 e 0,90+ por menos de 3 sessões: sem mudança. **Se as duas condições disparam, reduzir vence.**

### 4.7 Classificador de erros (`src/domain/errors`)

`classifyError(item, answer) → ErrorType`, testado por tabela (entrada → tipo):

- `added_instead_of_multiplied` (6 × 4 = 10: resposta = a + b); `off_by_one_group` (resposta = a×(b±1) ou (a±1)×b); `multiplied_instead_of_divided` (12 ÷ 3 = 36); `used_wrong_divisor` (12 ÷ 3 = 6, outro divisor); `wrong_operation` (item de história cuja operação escolhida ≠ esperada, contado como **erro de interpretação**, separado de erro de cálculo); `other` como queda para a dica genérica de soma/família.
- `slow_counting` não é erro (4.4). `money_change_error` fica para o Sprint 5.
- Cada tipo devolve um `HintPlan` com os **passos da cadeia** (`rootChain`), do degrau mais próximo à soma; **o texto da dica não é escrito neste sprint** (100% revisão humana).

### 4.7b Registro de apoio

- Toda `Attempt` registra `supportsUsed`. `isUnsupported(attempt)` é a única definição de "sem apoio"; alimenta transições, acerto da sessão e G5. O apoio nunca é proibido.

### 4.8 Portão da Multiplicação (`src/domain/gate`)

Funções puras `(estado, relógio) → { ok, progress }` para G1–G6, como em `docs/gdd/portao.md`:

- **G1/G2:** todos os fatos de adição (66) / subtração (121) em Fluente ou Dominado **e** ≥ 90% em Dominado. 89% falha, 90% passa.
- **G3:** acerto ≥ 90% nos triângulos completados (família de fatos). **G4:** ≥ 85% na escolha da operação **e** no cálculo, nos problemas aditivos.
- **G5:** taxa de apoio estritamente < 10% nas últimas 2 semanas, contando só respostas em fatos já Praticando ou acima e fora das fases que apresentam a ferramenta (D8). Borda de 10% falha.
- **G6:** 40 itens mistos sem apoio, ≥ 95%, concluída 2 vezes; a 2ª só vale ≥ 7 dias após a 1ª aprovada (6 dias falha, 7 passa). O sorteio dos itens usa `Rng` injetado.
- `gateStatus(...)` devolve G1–G6 e `readyToOpen`. `openGate(status, adultConfirmed)` **só abre** se `readyToOpen` e `adultConfirmed` forem verdadeiros. A criança não vê critérios. Depois de aberto, nada fecha de novo (sem punição). O resultado não depende da ordem das respostas.
- `estimatedEarliestOpening(...)` devolve o prazo estimado em semanas (caminho mais curto, `portao.md`), sem prometer data.

## 5. Casos de borda

- Fato Novo nunca apresentado: sem `FactState`, `nextReview = null`; apresentar o cria em Aprendendo.
- Relógio com fuso: "dia de calendário" vem do dia local do `Clock`; teste com 23:59 e 00:01 no mesmo/em outro dia e na virada de horário de verão.
- Erro dobrado seguido no mesmo fato: continua em Aprendendo; o fato volta de novo; sem estado negativo.
- Apoio aberto e depois acerto rápido: não é rápida, não promove.
- Resposta em branco ou absurda (negativa, não inteira): `classifyError` devolve `other`, sem lançar exceção.
- Sem Dominados no aquecimento; sem revisões vencidas; criança nova (nenhum estado).
- Troca de aparelho: o motor só lê `FactStateRepo`/`AttemptRepo`; resolução de conflito é do Sprint 4.
- Irmão (−, ÷) cujo fato raiz ainda está em Aprendendo: não entra em "novos".

## 6. Fora de escopo

- Qualquer tela ou componente React; persistência em Dexie (Sprint 2); sincronização (Sprint 4).
- Texto de dicas de erro (100% humano); mensagens do Calú.
- `money_change_error` e Caixa do Mercadinho (Sprint 5); estrelas e cajus (Sprints 3 e 7).
- Prova do Portão como minijogo (Sprint 5): aqui só a regra e o sorteio dos itens.
- Efeito concreto de `accelerate` no mapa de fases (Sprint 3); aqui só o sinal.

## 7. Parâmetros

Todos já em `src/domain/config/params.ts` (Bloco 1): `reviewIntervalDays`, `fastAnswerMs`, `fastAnswerExtraMsPerDigit`, `fastAnswerDivisionExtraMs`, `streakToPracticing`, `fluentDistinctDays`, `maxNewFactsPerSession`, `warmupFacts`, `knownToNewRatio`, `targetAccuracy`, `easeBelowAccuracy`, `accelerateAboveAccuracy`, `accelerateAfterSessions`, `errorReturnAfterItems`, `sessionMinutes`, `gate.*`. **O código lê tudo de `PARAMS`; nenhum número pedagógico novo entra no código.** Qualquer valor novo (ex.: o múltiplo 2 × do limiar na D3, hoje fixo no texto da D3) exige sua aprovação para virar parâmetro: ver pergunta 3 abaixo.

## 8. Testes exigidos

- Vitest, **escritos antes do código**, com `Clock`/`Rng` injetados e `seededRng`.
- Transições: uma linha de teste para **cada célula** da tabela (5 estados × 4 colunas), mais "erro em Aprendendo não desce", "apoio não promove", "lento não rebaixa".
- Sessão: determinística com `Rng` semeado; teto de 2 novos; reduzir vence acelerar; aquecimento sem Dominados; reinserção após 2–3 itens.
- Portão: 89%/90% em G1; 10% em G5; 6 × 7 dias em G6; nunca abre sem confirmação; apoio aberto não conta como acerto sem apoio; independe da ordem das respostas.
- Classificador por tabela (entrada → tipo).
- Catálogo: contagens 66/121/45/81 e raiz existente para todo −, × e ÷.
- Ports: os fakes continuam passando em `repo.contract.ts`; mudanças em `types.ts` (ver seção 9) atualizam o contrato.
- Sem tela nova: não há teste Playwright. `npm run lint:layers` garante domínio puro. Sem conteúdo novo.

## 9. Impacto em dados e LGPD

- **Nenhum dado novo da criança.** Entram em `Attempt` dois campos operacionais: `phaseId: string | null` e `kind: 'fact' | 'family' | 'story' | 'proof'` (necessários para G3, G4, G5 e G6). Continua só apelido, ano escolar e respostas.
- O domínio não faz I/O. `deleteByChild` dos repositórios já cobre o direito de apagar.
- Sem analytics, trackers ou CDN.

## 10. Checklist de segurança infantil

- [x] Sem anúncio, compra, chat, ranking, link externo (sem UI)
- [x] Sem texto livre da criança
- [x] Sem som ou texto de fracasso; sem cronômetro visível
- [x] Tempo de resposta nunca mostrado à criança (é medido e guardado em `Attempt.timeMs`)
- [x] Textos revisados: nenhum texto para a criança neste sprint; dicas de erro ficam para revisão 100% humana

## 11. Definition of Done

`npm run verify` e `npm run e2e` verdes · bundle JS < 300 KB gzip · teste para toda mudança em `src/domain` · PR com o checklist acima.

---

## Perguntas para o responsável (decidir antes de aprovar)

1. **Fluente e "acerto do dia":** o GDD diz que o estado Fluente entra com 2 acertos rápidos em 2 dias diferentes, e Dominado em revisão vencida de Fluente (≥ 5 dias). A spec lê assim; confirme.
2. **"Acelerar" (D4):** a fonte não diz o que o motor faz ao acelerar. Esta spec só emite o sinal `accelerate`. Qual efeito você quer no Sprint 3 (pular a segunda sessão da fase? oferecer mais um item novo? — o teto de 2 só muda com sua aprovação)?
3. **D3, "2 × o limiar":** vira parâmetro (`slowCountingFactor = 2`) ou fica fixo? Criar parâmetro é decisão sua.
4. **`swapped_subtraction`:** o catálogo proíbe minuendo menor que subtraendo (`5 − 8`), então esse tipo só aparece se a UI aceitar a resposta "ao contrário" em problemas de história. Mantemos o tipo no enum e implementamos a detecção no Sprint 3, ou removemos?
5. **Raiz de ×0 e ×1:** a spec usa `add:0+0` e `add:0+n` (suposição do Bloco 3). Confirme.

## Padrão provisório (sem revisão do responsável, 2026-11-02)

Para que o Sprint 1 possa começar sem decidir nada que seja só do humano (CLAUDE.md):

1. **Fluente:** vale a leitura desta spec (já alinhada com a D1).
2. **Acelerar:** o motor só emite o sinal `accelerate`; nenhum efeito é implementado.
3. **D3 (2 × o limiar):** **não implementar 4.4 ainda.** O resto do sprint segue; a regra espera a aprovação de `slowCountingFactor` em `params.ts`.
4. **`swapped_subtraction`:** fica no enum (já em `ports/types.ts`) e **sem detecção** até o Sprint 3.
5. **×0 e ×1:** vale `rootChain` do Bloco 3 (`add:0+0`, `add:0+n`), marcado como suposição.

Qualquer destes pontos pode ser revertido pelo responsável a qualquer momento.
