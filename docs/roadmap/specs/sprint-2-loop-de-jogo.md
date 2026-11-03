# Spec Sprint 2 — Loop de jogo e ferramentas

Status: implementada e mesclada (PR #5). Decisões do responsável no fim do arquivo (seção "Decisões aprovadas"); elas substituem o padrão provisório onde diferem.
Branch: `sprint-2/loop-de-jogo`

## 1. Objetivo

A criança abre o app no celular, joga **uma sessão completa de adição** (pergunta, teclado próprio, apoio com os dedos, quadro de dez ou reta, feedback gentil, fim natural) **offline**, e o progresso fica guardado no aparelho para o motor do Sprint 1 usar na próxima sessão.

## 2. Pilares afetados

- [x] estratégia antes de memória: os apoios (Mãozinhas, quadro de dez, reta) mostram de onde vem o fato
- [x] zero punição/zero cronômetro: nenhuma contagem visível; erro devolve uma dica visual, sem som de fracasso
- [ ] leitura como alavanca (sem histórias neste sprint; chegam no Sprint 3)
- [x] alicerce antes de ×/÷: a sessão só oferece adição (sem ×/÷ por nenhum caminho)
- [x] adulto no controle: a criança não vê critérios do Portão nem painel

Nenhum pilar é tensionado.

## 3. Regras do GDD relevantes

- `docs/ux/ui-rules.md` (tela inteira: viewport 360×740, alvos ≥ 56 px, teclado próprio, tipografia, feedback < 1 s, fim natural, estados vazio/offline, testes Playwright exigidos).
- `docs/ux/acessibilidade.md` (contraste, foco, rótulos, alternativa ao arrastar, reduzir movimento).
- `docs/ux/voz-do-calu.md` e `docs/audio-brief.md` (textos e sons de acerto; sem som de fracasso).
- `docs/gdd/mecanica-aprendizagem.md` ("Apoios e a retirada", sessão de 10–12 min) e fonte L80–90 (ferramentas da mão e da mesa).
- Decisões `[APROVADO 2026-11-02]`: D12 sessão × fase · D17 acessibilidade (WCAG 2.2 AA, botão `#1F7A44`) · D18 orçamento de arte/áudio (Nunito self-hosted; sons por Web Audio) · D20 modo escuro fora da v1.
- **Pré-requisitos:** Sprint 1 concluído (motor); Fase C Bloco 6 (fonte Nunito, ícone, botão `#1F7A44`) concluído.

## 4. Critérios de aceite (Dado / Quando / Então)

Cada critério vira pelo menos um teste (Vitest para lógica, Playwright 360×740 para tela).

### 4.1 Sessão

- **Dado** um perfil local novo, **quando** a criança toca em "Jogar", **então** o app monta uma sessão com `buildSession` (Sprint 1) usando as fases de adição do Mundo 1 do catálogo, e mostra o primeiro item em menos de 1 s.
- **Dado** um item, **então** a tela tem a conta grande no topo (números ≥ 40 px), a área de interação no meio e o teclado numérico embaixo; uma tarefa por tela.
- **Dado** a sessão em andamento, **quando** passam 10–12 min (`sessionMinutes`, medido por `Clock` injetado), **então** o Calú propõe parar com a frase aprovada ("Bora descansar? Amanhã tem mais!") e a criança pode continuar sem punição.
- **Dado** o fechamento, **então** a sessão termina em um item fácil e uma tela de conclusão com a voz do Calú, sem nota, sem tempo e sem comparação.
- **Dado** a barra de progresso, **então** ela conta **itens da sessão**, nunca tempo.

### 4.2 Teclado numérico e Resposta Rápida

- **Dado** o teclado próprio em grade 3×4 (1–9, apagar, 0, confirmar), **quando** a criança toca nas teclas, **então** a resposta aparece no visor; "apagar" remove um dígito; "confirmar" só é ativo com ao menos um dígito; não há "limpar tudo" perto de "confirmar" nem repetição por segurar.
- **Dado** que o campo de resposta **não** é um `<input>` nativo, **então** o teclado do sistema nunca abre.
- **Dado** o primeiro toque em uma tecla, **quando** a resposta é confirmada, **então** `Attempt.timeMs` guarda o tempo desde o aparecimento da conta até o **primeiro toque de resposta** (D2), em silêncio.
- **Dado** uma resposta correta, **então** feedback curto (som e animação < 1 s) e texto do Calú; **dado** uma resposta errada, **então** uma dica visual (sem a palavra "errado", sem vermelho de alarme sozinho, sem som de fracasso) e o fato volta à fila em 2–3 itens (motor).
- **Dado** o texto de dica: o Sprint 2 usa **dicas visuais sem frase nova** (ex.: mostrar a soma com objetos) ou textos já aprovados; texto de dica novo exige revisão 100% humana.

### 4.3 Ferramentas (apoios)

- **Dado** o botão de ajuda sempre visível, **quando** tocado, **então** abre as ferramentas permitidas para aquele fato (regras de aparição em `mecanica-aprendizagem.md`, "Apoios e a retirada"): Mãozinhas, quadro de dez e reta numérica.
- **Dado** o fato em **Aprendendo**, **então** Mãozinhas e quadro de dez abrem automaticamente; em **Praticando** ficam no botão; em **Fluente** só no botão.
- **Mãozinhas:** duas mãos na tela; a criança abre e fecha os dedos tocando; o total de dedos abertos é mostrado (sem leitura obrigatória).
- **Quadro de dez:** grade 2 × 5 com fichas; tocar põe/tira uma ficha; a contagem 5-e-mais fica visível.
- **Reta numérica:** pulos de 0 a 20; o toque marca o ponto de partida e a quantidade de pulos.
- **Dado** qualquer ferramenta aberta antes de responder, **então** `Attempt.supportsUsed` registra qual (`dedos`, `quadro-de-dez`, `reta`), a resposta **nunca é rápida** e **nunca promove a Fluente** (regra do motor). Nenhum apoio é proibido.
- **Dado** uma ferramenta com arrastar, **então** existe sempre uma alternativa por toque (acessibilidade.md).

### 4.4 Persistência e offline

- **Dado** o app aberto sem internet, **quando** a criança joga, **então** a sessão completa funciona e não há nenhuma requisição externa.
- **Dado** o fechamento do app no meio de uma sessão, **quando** reabre, **então** respostas já dadas estão guardadas (`AttemptRepo.add` a cada resposta; `SessionRepo.save` ao iniciar e a cada item) e os estados dos fatos refletem o que foi respondido.
- **Dado** os repositórios Dexie em `src/data/local/`, **então** eles passam nos **mesmos testes de contrato** `repo.contract.ts` (com `fake-indexeddb` se o ambiente exigir; ver pergunta 3).
- **Dado** o PWA, **quando** instalado, **então** abre em < 3 s em 4G (medir) e o service worker faz cache do necessário para jogar offline.

### 4.5 Perfil local

- **Dado** que contas e consentimento só chegam no Sprint 4, **então** o Sprint 2 usa **um perfil local anônimo no aparelho** (apelido e ano escolar inseridos pelo adulto, **sem texto livre da criança**), sem nada enviado para fora. Ver pergunta 1.

## 5. Casos de borda

- Estado vazio: primeira abertura (sem estados, só fatos novos); sem revisões vencidas.
- Offline desde o início; o app instalado sem rede nunca mostra mensagens técnicas à criança (só ao adulto).
- Aparelho sem voz pt-BR: o botão de narração some (não há narração obrigatória neste sprint).
- Dedos: abrir e fechar muito rápido; toque duplo acidental (nenhum gesto escondido).
- Relógio com fuso: virada de dia no meio da sessão (a sessão pertence ao dia em que começou).
- Resposta de 2 dígitos (10 a 20 nos fatos até o Mundo 3): teclado aceita até 2 dígitos; mais que isso é ignorado, sem erro.
- Erro dobrado seguido: o fato volta de novo; nenhum texto de bronca.
- Tela pequena (360 px), safe areas, orientação paisagem tolerada (não projetada).
- `prefers-reduced-motion`: troca movimento por fade/estático.
- Aba em segundo plano no meio de um item: o tempo da resposta não deve inflar sem limite (descartar `timeMs` acima de um teto técnico e marcá-lo como não rápido); ver pergunta 2.

## 6. Fora de escopo

- Mapa de mundos, estrelas, cajus, loja, álbum, Calú animado completo (Sprint 3 e 7).
- Histórias, Qual Conta?, Família de Fatos, Monta-Grupos, Fileiras (Sprints 3, 5 e 6).
- Subtração, ×, ÷, Portão na interface.
- Colar de contas (Mundo 3); narração por voz; kit imprimível.
- Contas, login, consentimento, sincronização, Supabase (Sprint 4 e Fase D).
- Painel do adulto.

## 7. Parâmetros

Nenhum novo. Usa `PARAMS.sessionMinutes`, `fastAnswerMs` (+ extras), `errorReturnAfterItems`, `warmupFacts`, `maxNewFactsPerSession`. **Constantes de interface** (altura 56 px, espaço 12 px, tamanhos de fonte) moram em `src/ui/` (tokens CSS), não em `params.ts`. Qualquer teto técnico novo para `timeMs` (pergunta 2) é decisão sua.

## 8. Testes exigidos

- **Domínio:** nada novo (o motor é do Sprint 1). Se surgir regra nova em `src/domain`, teste antes.
- **Repositórios Dexie:** contrato `repo.contract.ts` verde.
- **Playwright 360×740 (toda tela nova):**
  - joga uma sessão inteira offline (`context.setOffline(true)`) com pelo menos um apoio de cada tipo e verifica o resumo final;
  - todo botão visível com altura ≥ 56 px e espaço ≥ 12 px; sem rolagem horizontal;
  - teclado próprio responde; nenhum `<input>` de resposta; teclado do sistema não abre;
  - nenhuma requisição externa; nenhum cronômetro/relógio visível no DOM;
  - fim natural da sessão (com `Clock` simulado ou atalho de teste) e retomada após recarregar a página.
- **Acessibilidade:** rótulos `aria-label` nos ícones, foco visível, ordem lógica, contraste do botão `#1F7A44` (5,4 : 1), reduzir movimento.
- **Peso:** `npm run check:bundle` < 300 KB gzip (framer-motion e Dexie já estão instalados; nenhuma dependência nova).
- Aparelhos reais (Safari iOS, Android intermediário) ficam para o Sprint 9; nesta spec, só viewport simulado.

## 9. Impacto em dados e LGPD

- Fica **só no aparelho** (IndexedDB): apelido, ano escolar, respostas (`Attempt`), estados dos fatos, sessões. Sem conta, sem envio, sem analytics, sem trackers, sem CDN; Nunito self-hosted.
- Retenção: até o adulto apagar. **Direito de apagar:** `deleteByChild` nos repositórios Dexie, exposto em uma ação do adulto atrás de confirmação (a tela do adulto completa vem no Sprint 8; aqui basta a ação mínima ou a função testada). Ver pergunta 1.
- Nenhum pedido de permissão do navegador (microfone, localização, notificações) na área da criança.
- Nenhum texto de consentimento é escrito aqui (100% humano, Fase D).

## 10. Checklist de segurança infantil

- [x] Sem anúncio, compra, chat, ranking, link externo na área da criança
- [x] Sem texto livre da criança (resposta só pelo teclado numérico)
- [x] Sem som ou texto de fracasso; sem cronômetro visível
- [x] Tempo de resposta nunca mostrado à criança
- [x] Textos revisados: frases do Calú só as já aprovadas em `voz-do-calu.md`; amostragem humana das telas; dicas 100% humanas

Rodar os subagentes `revisor-ui-mobile` e `revisor-seguranca-infantil` antes do PR.

## 11. Definition of Done

`npm run verify` e `npm run e2e` verdes · bundle JS < 300 KB gzip · teste Playwright 360×740 para a tela de sessão · repositórios Dexie passam no contrato · PR com o checklist acima e o resultado dos revisores.

---

## Perguntas para o responsável (decidir antes de aprovar)

1. **Perfil antes do Sprint 4:** posso criar um perfil local anônimo (apelido + ano escolar) com uma tela mínima para o adulto, ou prefere um perfil fixo de desenvolvimento sem tela de criação? Isso toca em coleta de dados da criança.
2. **Teto técnico do tempo:** descartar `timeMs` acima de quanto (ex.: 60 s, aba em segundo plano)? Vira constante em `params.ts`, então precisa da sua aprovação.
3. **`fake-indexeddb`:** o contrato dos repositórios Dexie roda em Vitest com `fake-indexeddb`, uma **dependência nova de desenvolvimento**. Aprova, ou prefere testar o Dexie só no Playwright?
4. **Arte e som do Calú:** usar as peças já listadas em `docs/art/asset-list.md` como placeholders SVG simples e os sons por Web Audio do `audio-brief.md`, ou esperar a arte final?
5. **Sessão de teste:** como não há mapa de mundos, a sessão usa as fases 1–7 do Mundo 1 em ordem fixa e o motor escolhe os itens. Isso serve para o "primeiro teste" ou você prefere já escolher a fase atual manualmente (modo do adulto)?

## Padrão provisório (sem revisão do responsável, 2026-11-02)

1. **Perfil:** um perfil local fixo de desenvolvimento (apelido genérico, ano escolar 2º), **sem tela de criação** e sem coleta nova. A tela do adulto vem no Sprint 4.
2. **Teto do `timeMs`:** não descartar nada. Registrar o valor bruto; o teto só entra depois de aprovado em `params.ts`.
3. **Dexie:** **sem `fake-indexeddb`** (dependência nova). Os repositórios Dexie são testados no Playwright; o contrato `repo.contract.ts` roda no navegador ou fica como pendência registrada.
4. **Arte e som:** placeholders SVG simples e sons por Web Audio.
5. **Fase da sessão:** ordem fixa das fases 1 a 7 do Mundo 1.

Qualquer destes pontos pode ser revertido pelo responsável a qualquer momento.

## Decisões aprovadas (2026-11-02)

1. **Perfil:** local fixo (apelido genérico, 2º ano), sem tela de criação.
2. **`timeMs`:** sem teto; `params.ts` não muda.
3. **Dexie:** **`fake-indexeddb` aprovada como devDependency**; `repo.contract.ts` roda no Vitest.
4. **Arte e som:** placeholders SVG e Web Audio.
5. **Fases:** W1-P01 a W1-P07 em ordem fixa; W1-P08 (Grande Desafio) fica fora.

## Implementação e pendências humanas (2026-11-02)

Implementado na branch `sprint-2/loop-de-jogo`: `verify` e `e2e` verdes, bundle 104,5 KB gzip. Interpretações e desvios para você confirmar:

1. **Apoio automático é oferta.** Em Aprendendo as Mãozinhas já vêm abertas, mas só entram em `supportsUsed` se a criança tocar nelas ou abrir/trocar a ferramenta pelo botão. Se contasse só por abrir, Aprendendo nunca passaria a Praticando (3 acertos sem apoio).
2. **Reta numérica:** o ponto de partida é o maior número da conta e há um botão "Pular +1" (em vez de tocar na reta), porque 21 alvos de 56 px não cabem em 360 px.
3. **Sessão curta no início:** o motor limita 2 fatos novos por sessão; ao esgotar a fila a tela monta um novo plano com os estados atuais até o convite de descanso (10 min).
4. **Allowlist do `check:trackers`:** duas URLs exatas de mensagens de erro do Dexie (`tinyurl.com/y2uuvskb`, `bit.ly/2kdckMn`), só texto, nunca requisitadas. Peço sua aprovação por mexer na barreira de privacidade.
5. **Textos para amostragem humana:** "Isso mesmo!", "Você conseguiu. Amanhã tem mais!", "Bora!", "Descansar", "Continuar", "Voltar ao início", "Ajuda", "N dedos abertos", "N fichas", "N pulos, parou no N", e a dica de erro (bolinhas + soma, revisão 100% humana).
6. **Decisões tomadas pela IA a pedido do responsável (2026-11-02), reversíveis:**
   - Allowlist do `check:trackers`: mantida, só as 2 URLs exatas do Dexie (igualdade, sem sufixo).
   - Apoio automático como oferta, reta com "Pular +1" e sessão que se reabastece até o convite: mantidos.
   - Avanço automático de 900 ms após acerto: mantido (feedback < 1 s da spec; a dica de erro espera o toque). Rever no teste com a Ana.
   - Botão "Sair" na pergunta: volta ao início sem perder nada; a sessão aberta é retomada em "Jogar".
   - Modo mudo: botão "Som ligado/desligado" na tela inicial; preferência só no aparelho (`localStorage`, nada sai dele).
   - Ferramentas viram grupo de botões `aria-pressed` (sem `tablist` incompleto); o foco vai ao contêiner a cada troca de tela; contraste das bordas ≥ 3:1; foco visível; áreas seguras.
   - Testes novos: alvos e espaços nas telas de início, dica, convite e fim; Sair; foco; som; reduzir movimento.
7. **Continua com o responsável:** amostragem das frases novas (lista no item 5) e revisão 100% humana da dica de erro.
