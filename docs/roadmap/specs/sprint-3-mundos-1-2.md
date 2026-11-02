# Spec Sprint 3 — Mundos 1 e 2 jogáveis (núcleo)

Status: aprovada em 2026-11-02 (decisões delegadas pelo responsável à IA; reversíveis)
Branch: `sprint-3/mundos-1-2`

## 1. Objetivo

A criança escolhe uma fase no **mapa**, joga sessões de **adição até 10 (Mundo 1)** e de **subtração como adição ao contrário (Mundo 2)**, ganha **estrelas** e libera a fase seguinte — pronto para o primeiro teste real: a Ana joga 3 dias seguidos.

Divisão aprovada: este sprint é o **núcleo**. Histórias (~60) e Ponte da Escola (Tabela que Cresce e formulário de lição) viram o **Sprint 3b**.

## 2. Pilares afetados

- [x] estratégia antes de memória: subtração aparece como "adição ao contrário", com dica pela adição inversa
- [x] zero punição/zero cronômetro: estrelas só mostram o que a criança conseguiu; nenhuma nota, tempo ou comparação
- [ ] leitura como alavanca (histórias ficam no 3b)
- [x] alicerce antes de ×/÷: nenhum × ou ÷; Mundos 3–4 e o Portão aparecem só como "em breve", sem critérios
- [x] adulto no controle: nada de painel; a criança não vê critérios do Portão

Nenhum pilar é tensionado.

## 3. Regras do GDD relevantes

- `docs/gdd/mundos-e-fases.md`: Mundo 1 (8 fases, 36 fatos) e Mundo 2 (7 fases, 66 fatos de subtração); contagem em "Contagem de fatos".
- `docs/gdd/mecanica-aprendizagem.md` (promoção, apoio, sessão por fase) e `docs/gdd/recompensas-e-economia.md` ("Estrelas").
- `docs/gdd/tipos-de-erro-e-dicas.md` (cadeia de dicas: volta à soma).
- `docs/ux/ui-rules.md` (mapa de mundos, alvos, fim natural) · `docs/ux/acessibilidade.md` · `docs/ux/voz-do-calu.md` · `docs/audio-brief.md`.
- Decisões `[APROVADO 2026-11-02]`: D1 promoção · D2 tempo · D3/D24 contou de um em um · D4 acerto da sessão · D5 estrelas · D10 par não ordenado · D11 cadeia de raiz · D12/D25 sessões por fase · D16 unidade de apresentação (triângulo) · D17 acessibilidade · D18 arte e áudio · D26 `swapped_subtraction` não detectado. D21–D23 (privacidade) seguem `[PROPOSTA]` e **não** são usadas aqui.
- **Pré-requisitos:** Sprints 1 e 2 mesclados em `main` (PRs #4 e #5).

## 4. Critérios de aceite (Dado / Quando / Então)

Cada critério vira pelo menos um teste (Vitest para lógica, Playwright 360×740 para tela).

### 4.1 Mapa e fases

- **Dado** o perfil novo, **quando** a criança toca em "Jogar", **então** vê o mapa com as fases de W1 e W2 em ordem fixa; só W1-P01 está liberada; as demais aparecem bloqueadas e **não respondem ao toque**.
- **Dado** o mapa, **então** W3–W4 e o Portão aparecem como "em breve", sem critérios nem contagem do que falta.
- **Dado** uma fase liberada, **quando** a criança a toca, **então** a sessão usa os fatos novos da fase e as revisões do motor.
- **Dado** qualquer fase concluída, **então** o mapa mostra de 0 a 3 estrelas (melhor resultado), sem nota nem tempo.

### 4.2 Estrelas e avanço (D5, D12, D25)

- **Dado** as sessões de uma fase, **quando** a sessão termina, **então** o **acerto da fase** = acertos ÷ respostas de todas as sessões daquela fase, **com ou sem apoio** (apoio só é registrado), e as estrelas saem de `PARAMS.starThresholds` (≥ 60% = 1, ≥ 80% = 2, ≥ 95% = 3).
- **Dado** que a fase tem pelo menos `sessionsBeforeAdvance` sessões (de `adaptNextSession`: 2 ao acelerar, 3 nos demais casos) e ≥ 2 estrelas, **então** a próxima fase abre; com 1 estrela, o Calú convida a treinar mais ("Boa! Vamos treinar mais um pouquinho com o Calú?").
- **Dado** que a criança refaz a fase, **então** vale o **melhor** resultado; nunca diminui.
- **Dado** a tela de resultado da fase, **então** ela mostra as estrelas e a voz do Calú, sem nota, sem tempo e sem comparação.

### 4.3 Subtração (Mundo 2)

- **Dado** um fato de subtração, **quando** ele é apresentado, **então** a conta aparece como `a − b = ?` e o resultado vem da adição inversa (`b + ? = a`).
- **Dado** que a adição raiz ainda não está em Praticando ou acima, **então** o fato de subtração **não** é apresentado (D16c, já no motor); a fase não trava: a sessão traz revisões da raiz até ela abrir.
- **Dado** um erro em subtração, **então** a dica é **visual**: a adição inversa (`8 + ? = 13`) com bolinhas, sem frase nova e sem a palavra "errado".
- **Dado** a reta numérica em uma conta de subtração, **então** o ponto de partida é `a` e o botão pula **para trás**.

### 4.4 Família de fatos

- **Dado** um triângulo apresentado como novo (D16), **então** a criança responde em sequência as contas da família (`a+b`, `b+a`, `soma−a`, `soma−b`), cada uma com `Attempt.kind = 'family'` (alimenta G3 do Portão no futuro). Triângulo com `a = b` tem menos contas (contagem de D9/D10).

### 4.5 Persistência e offline

- **Dado** estrelas e progresso, **então** ficam em IndexedDB (`Wallet.stars` e as respostas); recarregar a página mantém tudo; o jogo funciona offline.
- **Dado** o perfil local fixo (`perfil-local`), **então** nada de apelido, avatar ou tela de criação.

### 4.6 Grande Desafio sem histórias (provisório)

- **Dado** W1-P08 e W2-P07 (sem fato novo), **então** a sessão mistura os fatos do mundo (só revisão), sem história, e vale como qualquer fase para estrelas; as histórias do GD entram no 3b.

## 5. Casos de borda

- Estado vazio (sem respostas): mapa com só a primeira fase liberada, 0 estrelas.
- Fase com fatos de subtração cuja raiz ainda não está pronta: a sessão não pode ficar vazia nem repetir sem fim (teste de simulação de vários dias).
- Sessão interrompida ("Sair"/recarregar): retoma; as estrelas só contam ao fim de uma sessão.
- Relógio de dispositivo mudando de dia: o "dia de calendário" é o local (D1).
- Erro dobrado e apoio aberto: seguem as regras do motor (apoio nunca promove a Fluente).
- Offline: tudo local; nenhuma requisição externa.

## 6. Fora de escopo

Histórias de W1–W2 e seu fluxo de resposta · Ponte da Escola, Tabela que Cresce e formulário de lição (texto livre do adulto) · avatar e apelido (Sprint 4/7) · cajus, loja, álbum, cofrinho (Sprint 7) · sonda inicial (D14) · Qual Conta?, colar de contas e Portão na tela (Sprint 5) · contas, sync e painel (Sprints 4 e 8) · mudanças no validador, no vocabulário e em `params.ts`.

## 7. Parâmetros

Nenhum novo. Usa `starThresholds` (D5), `phaseSessions` (D12) e `adaptNextSession` (D25) já em `src/domain/config/params.ts`. **Mudança de valor = decisão humana.**

## 8. Testes exigidos

- Domínio (Vitest, **antes do código**, `Clock`/`Rng` injetados): acerto da fase, estrelas, melhor resultado, sessões por fase (via `Attempt.phaseId`, sem Dexie v2), avanço de fase, e **simulação de vários dias** de W1 a W2.
- Controlador (fakes em memória): subtração, família de fatos, estrelas salvas na `Wallet`.
- Playwright 360×740: mapa (fase bloqueada não toca); jogar uma fase até as estrelas e ver a próxima abrir; recarregar mantém estrelas; subtração com `−` e dica da adição inversa; família em sequência; "em breve"; alvos ≥ 56 px e espaços ≥ 12 px no mapa e no resultado; offline; sem `<input>`, sem cronômetro, sem requisição externa.
- Acessibilidade: foco, rótulos, estrelas com texto alternativo (`docs/ux/acessibilidade.md`).
- Camadas: `npm run lint:layers` (UI não importa `@data/*`); sem dependência nova (nada de react-router).

## 9. Impacto em dados e LGPD

Nenhum dado novo: respostas (já gravadas), sessões e estrelas por fase, tudo no aparelho. Perfil local fixo sem identificação. Direito de apagar já coberto por `deleteByChild`. Sem analytics, trackers ou CDN.

## 10. Checklist de segurança infantil

- [ ] Sem anúncio, compra, chat, ranking, link externo na área da criança
- [ ] Sem texto livre da criança
- [ ] Sem som ou texto de fracasso; sem cronômetro visível
- [ ] Tempo de resposta nunca mostrado à criança
- [ ] Textos revisados (amostragem humana; **dica de subtração 100% humana**)

## 11. Definition of Done

`npm run verify` e `npm run e2e` verdes · bundle JS < 300 KB gzip · teste para toda mudança em `src/domain` · PR com o checklist acima.

## Pendências humanas (levantadas no planejamento)

1. **Dica de subtração** (adição inversa) e **textos novos do mapa e do resultado da fase**: revisão humana (dica 100%).
2. **Grande Desafio sem histórias** (item 4.6): confirmar o padrão provisório.
3. **Decisões reversíveis do Sprint 2** para rever com a Ana: avanço automático de 900 ms, reta com "Pular", botão "Sair".
4. **Para a Ana jogar:** instalar o PWA no celular e jogar em dias diferentes; sem painel (Sprint 8), conferir o progresso via DevTools/IndexedDB — será documentado.
