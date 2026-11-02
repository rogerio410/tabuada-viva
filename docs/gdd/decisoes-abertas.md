# Decisões abertas

Status: **PROPOSTA — aguarda aprovação do responsável.** Nada aqui altera `params.ts`.
Cada item: o que a fonte diz, a lacuna, a proposta e o impacto. Marque `[APROVADO]` com data ao fechar.

## Decisões de mecânica

### D1 — Transições de estado por erro e promoção

- **Fonte:** L177, L181–191. Fluente = "2 sessões" (tabela) e "dias diferentes" (L177). Erro desce um nível (mín. Aprendendo).
- **Lacuna:** "2 sessões" no mesmo dia? Dominado exige ≤ 4 s e sem apoio? Quanto desce um Dominado que erra? O intervalo reinicia?
- **Proposta:** Fluente exige 2 acertos rápidos, sem apoio, em **2 dias de calendário diferentes**. Dominado exige acerto rápido e sem apoio em revisão vencida do estado Fluente (≥ 5 dias). Erro em qualquer estado desce um nível, reinicia o intervalo do novo estado e reinsere o fato na sessão após 2–3 itens (já em params). Acerto lento (> limiar) sem apoio mantém o estado e não rebaixa.
- **Impacto:** teste de domínio do Sprint 1.

### D2 — O limiar de 4 s

- **Fonte:** L186 (≤ 4 s). `fastAnswerMs: 4000`.
- **Lacuna:** vale para teclado, resposta de 2 dígitos, ÷, dinheiro? Tempo de leitura do enunciado entra?
- **Proposta:** medir do aparecimento da conta até o primeiro toque na resposta. Limiar base 4 s para resposta de 1 dígito; **+1 s por dígito extra** e +1 s para fatos de ÷. Nunca vale em problemas de história. Pedido de apoio aberto = não rápido.
- **Impacto:** novo parâmetro `fastAnswerExtraMsPerDigit` (aprovação humana para criar).

### D3 — Detectar "contou de um em um demais"

- **Fonte:** L212 (resposta certa, mas lenta).
- **Proposta:** acerto sem apoio com tempo > 2× o limiar, 2 vezes seguidas no mesmo fato, dispara a dica de estratégia **na próxima apresentação** (nunca interrompe um acerto). Não conta como erro no painel.

### D4 — Faixa de acerto e conflito reduzir × acelerar

- **Fonte:** L32 (80–85%), L201 (< 70% reduz; > 90% por 3 sessões acelera), L293 (ideal 80–90%).
- **Proposta:** alvo 80–85% é o centro do ideal; a zona 70–80% e a 90%+ curta não mudam nada. Se as duas condições disparam, **reduzir vence**. Acerto da sessão = acertos sem apoio ÷ respostas; acerto com ajuda entra no denominador mas não no numerador do indicador "Fatos dominados".
- **Impacto:** `targetAccuracy`, `easeBelowAccuracy`, `accelerateAboveAccuracy` já existem; só a regra de prioridade é nova.

### D5 — Estrelas

- **Fonte:** L173 (2 estrelas = acerto ≥ 80% libera a próxima), L263.
- **Proposta:** 1 estrela ≥ 60%, 2 ≥ 80%, 3 ≥ 95%. Vale o **melhor** resultado. Uma fase com 1 estrela não libera a seguinte, mas o Calú oferece "tentar de novo" sem custo e a fase muda os itens (nunca repete frase idêntica).
- **Impacto:** novos parâmetros `starThresholds`.

### D6 — Mundo 9 e o Portão

- **Fonte:** L173 (Mundo 9 abre junto com o 8); L163 (preço × quantidade).
- **Proposta:** Mundo 9 **exige o Portão** e abre junto com o Mundo 8. As partes só aditivas do dinheiro já existem no Mundo 4.

### D7 — Nomes e a Prova do Portão

- **Fonte:** L103, L157, L388. Três "pontes": Ponte do Poti (mundo 3), Ponte da Escola (modo), Prova da Ponte (desafio).
- **Proposta:** renomear a prova para **Prova do Portão**; ela é desafio repetível fora dos mundos (não é a última fase do Mundo 4). O Grande Desafio do Mundo 4 é uma história de dinheiro, distinta. Nome do Mundo 3 e da Ponte da Escola permanecem.

### D8 — Prazo do Portão e janela de apoio

- **Fonte:** L98–103, L469 (a fonte admite que × provavelmente não abre no 1º mês).
- **Cálculo:** de Aprendendo a Dominado, o menor caminho é ≈ 2 + 5 + 14 dias de intervalos, mais a prova repetida a 7 dias: **cerca de 4 a 5 semanas** no melhor caso.
- **Lacuna:** "apoio < 10% nas últimas 2 semanas" é inatingível enquanto Mundos 1–3 pedem a ferramenta.
- **Proposta:** a taxa de apoio do portão conta só respostas em fatos já em Praticando ou acima e fora das fases que apresentam a ferramenta. Mostrar ao adulto, no painel, o prazo estimado — e que não há atalho.

### D9 — Contagem e escopo dos fatos

- **Fonte:** L15 (0–10), L56 (até 20), L286 (121 fatos de adição), L354 (~440).
- **Proposta (a validar), contagem feita em `mundos-e-fases.md`:** adição 66 fatos (121 células da grade, pares não ordenados por D10); subtração 121 fatos ordenados, cada um com seu fato raiz (minuendo ≤ 20, subtraendo ≤ 10); × 45 fatos + 2 regras (×0, ×1); ÷ 81 fatos + 3 regras (÷1, n÷n, 0÷n). Total 313 fatos + 5 regras, no lugar de "~440". O "121" do painel (L286) e do Portão (G1) passa a ser lido como 121 células da grade, que correspondem a 66 estados.

### D10 — Comutatividade e o × 7 — [APROVADO]

> Aprovado pelo responsável como proposto (sessão da Fase B, 2026-11-02).

- **Fonte:** L150, L161, L235.
- **Lacuna:** 6 × 4 e 4 × 6 são um fato ou dois? A fonte diz que o × 7 sobra "três fatos novos (7×7, 7×8, 7×9)", o que só vale se 8 e 9 vierem antes, mas L161 põe × 9 e × 8 **antes** do × 7 e o número correto de fatos novos ao chegar no × 7 é 1 (7 × 7).
- **Proposta:** um fato por par não ordenado (a ≤ b) para estado e revisão; a apresentação alterna as duas ordens. Corrigir o texto: ao chegar no × 7 sobra só 7 × 7. (Fatos com 0 e 1 viram "regras", não fases.)

### D11 — Raiz aditiva da divisão

- **Fonte:** CLAUDE.md ("todo fato de −, × e ÷ aponta para seu fato raiz de adição").
- **Proposta:** cadeia ÷ → fato × irmão → soma repetida (12 ÷ 3 → 3 × 4 → 4+4+4). A dica de erro desce a cadeia um degrau por vez.

### D12 — Sessão × fase

- **Fonte:** L167–170, L193–199.
- **Proposta:** uma fase ≈ 2 a 3 sessões (apresentação + guiada na 1ª; intercalada + história na 2ª). A sessão mistura a fase atual com revisões vencidas e para sozinha em 10–12 min, mesmo no meio de uma fase (progresso guardado).

### D13 — Ponte da Escola e o estado dos fatos

- **Fonte:** L118–144.
- **Proposta:** cada linha da Tabela que Cresce alimenta apenas fatos de **adição**; o problema registra "multiplicação com apoio" no painel, sem criar `fact_state` de ×. A Ponte fica disponível desde o início, mas só com problemas "a cada" digitados pelo adulto.

### D14 — Sondagem inicial

- **Fonte:** nada. Risco: criança que já soma fica presa nos Mundos 1–3 (L173 "sem atalho").
- **Proposta:** sondagem curta e opcional (ligada pelo adulto) que classifica fatos de adição já fluentes e acelera apenas o alicerce aditivo. Nunca abre ×, ÷ nem pula o Portão. Sem nota, sem rótulo, apresentada como "jogo de aquecimento".

### D16 — Regras e unidade de apresentação `[PROPOSTA]`

- **Lacuna:** o teto de "2 fatos novos por sessão" (L197) não diz o que é "um fato" quando uma regra cobre vários (+0, ×0, ×1, ÷1) ou quando − e ÷ são irmãos de um fato conhecido.
- **Proposta:** (a) uma **regra** conta como 1 item novo, mas cada fato coberto por ela é rastreado individualmente; (b) a unidade de apresentação de −, × e ÷ é o **triângulo** (L62): dois triângulos novos por sessão; (c) os irmãos − e ÷ só abrem quando o fato raiz está em Praticando ou acima (L65, estendido a ÷).
- **Impacto:** `maxNewFactsPerSession` passa a contar itens de apresentação, não fatos soltos.

### D17 — Alvo de acessibilidade `[PROPOSTA]`

- **Fonte:** só pede "alto contraste" (L309) e "reduzir movimento" (L318).
- **Proposta:** WCAG 2.2 AA como piso, com daltonismo (cor + forma + rótulo), leitor de tela e alternativa ao arrastar. Ver `docs/ux/acessibilidade.md`.
- **Achado:** `#2E9E5B` com texto branco tem contraste 3,4 : 1 (reprova para texto pequeno); o botão primário passa a usar `#1F7A44` (5,4 : 1).

### D18 — Orçamento de arte e áudio `[PROPOSTA]`

- **Proposta:** pacote inicial de arte ≤ 150 KB sem compressão; total ≈ 385 KB carregado por mundo, sob demanda; sons sintetizados por Web Audio (0 KB de arquivo); Nunito (woff2) em `public/fonts` sem nova dependência. Ver `docs/art/asset-list.md` e `docs/audio-brief.md`.

### D19 — Dinheiro: centavos e cédulas `[PROPOSTA]`

- **Proposta:** valores inteiros de R$ 1 a R$ 20 na v1 (sem centavos) e cédulas estilizadas, não fiéis às reais. **Validar com a professora**: EF02MA20 trata de equivalência entre moedas e cédulas.

### D20 — Modo escuro `[PROPOSTA]`

- **Proposta:** fora da v1.

## Decisões de economia (humano, CLAUDE.md)

### D15 — Cajus

- **Fonte:** L265–267: só princípios. Não há números.
- **Proposta:** ver rascunho em `recompensas-e-economia.md` (a escrever no Bloco 1). Princípios: nunca punir, nunca premiar velocidade, teto semanal, preço de itens equivalente a 3–5 dias de prática.

## Parâmetros que existem na fonte mas não em `params.ts`

Precisam de aprovação para virar parâmetro: pontos de corte do Portão (90/90/90/85/10/95%, 40 itens, 2 provas, 7 dias, janela de 2 semanas), `starThresholds` (D5), `warmupFacts: 3`, `guidedPracticeItems: {6, 8}`, `knownToNewRatio: 70/30`, `fluentDistinctDays: 2`, `fastAnswerExtraMsPerDigit` (D2), tamanho do PIN.

## Pendências externas (não bloqueiam a Fase B)

- Nome final do jogo e do mascote (provisórios, L486).
- Livro/sistema didático da escola; piloto só com a Ana ou com colegas.
- Se a professora aceita soma repetida/tabela nas tarefas.
- Verificar na fonte oficial: EF02MA05, EF02MA06, EF03MA24 e LGPD art. 14 (L495).
- PIN de 4 dígitos é fraco contra força bruta: tratar na Fase D (limite de tentativas, bloqueio).
- Fonte L327 tem um diagrama de arquitetura ausente; Recharts e Supabase ainda não estão instalados (adicionar dependência exige aprovação).
