# Regras de interface

Status: `[FONTE L304–319]` para o que a fonte define; o restante é `[PROPOSTA]`. Decisões ligadas: D17, D18, D20 em `docs/gdd/decisoes-abertas.md`. **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

O jogo é desenhado para um celular intermediário, em pé, nas mãos de uma criança de 7 anos, possivelmente sem internet estável (L302).

## Viewport e teste

- Teste obrigatório em **360×740, retrato** (CLAUDE.md; L319 "a partir de 360 px"). Navegadores: Chrome Android e Safari iOS.
- Sem rolagem horizontal. Respeitar áreas seguras (`env(safe-area-inset-*)`). Paisagem é tolerada, não projetada `[PROPOSTA]`.
- Tablet e desktop vêm depois; o layout cresce com largura máxima de conteúdo (≈ 480 px), centralizado `[PROPOSTA]`.

## Estrutura de tela

- **Uma tarefa por tela.** Pergunta em cima, área de interação no meio, teclado embaixo, ao alcance do polegar `[FONTE L306]`.
- Nenhum toque duplo, nenhum gesto escondido `[FONTE L307]`. Arrastar sempre tem alternativa por toque (ver `acessibilidade.md`).
- Nunca há barra, contador ou relógio de tempo na área da criança (CLAUDE.md). A barra de progresso é de **itens da fase**.

## Alvos e teclado

- Botões com **altura ≥ 56 px** e **12 px de espaço** entre eles `[FONTE L307]`. A largura mínima também é 56 px `[PROPOSTA]`.
- **Teclado numérico próprio** do jogo, grande, no lugar do teclado do sistema (cobre a tela e varia por aparelho) `[FONTE L308]`. Não usar `<input>` com teclado nativo para a resposta.
- Teclado `[PROPOSTA]`: grade 3×4 (1–9, apagar, 0, confirmar); apagar apaga um dígito; confirmar só é ativo com ao menos um dígito; sem tecla "limpar tudo" perto de "confirmar"; sem repetição por segurar.
- Toque aceito no `pointerup`, com área de toque maior que o desenho visível quando preciso.

## Tipografia

- Fonte **arredondada e self-hosted**: **Nunito** (licença OFL) `[FONTE L309; escolha PROPOSTA]`. Sem Google Fonts nem CDN (CLAUDE.md; `check-no-trackers` veta `fonts.googleapis` e `fonts.gstatic`).
- Arquivos `woff2` em `public/fonts/`, **sem nova dependência** (decisão do responsável). Pesos 400, 700 e 800; subsets `latin` e `latin-ext`; `font-display: swap`; licença OFL guardada junto dos arquivos.
- ✅ Nunito (400, 700, 800; `latin` e `latin-ext`) está em `public/fonts/` com a licença `OFL.txt`; `@font-face` em `src/index.css`.
- Tamanhos: histórias **≥ 20 px** `[FONTE L309]`; números da conta **≥ 40 px** `[PROPOSTA]`; texto de botão ≥ 20 px; altura de linha ≥ 1,4.
- Frases curtas e alto contraste `[FONTE L309]`; contraste mínimo em `acessibilidade.md`.

## Feedback

- Acerto: som e animação **curtos, < 1 s** `[FONTE L311]`.
- Erro: **uma dica visual**, sem som de fracasso `[FONTE L311, L34]`; a dica vem de `tipos-de-erro-e-dicas.md`. Nunca "errado", nunca vermelho de alarme sozinho.
- Texto do feedback na voz do Calú (`voz-do-calu.md`).
- Sessão com fim natural: depois de 10–12 min o Calú propõe parar ("Bora descansar? Amanhã tem mais!") `[FONTE L312]`; a criança pode continuar até o teto diário, sem punição `[PROPOSTA]`.

## Animação

- Framer Motion, uso contido (L336). Duração < 1 s. Nada de loops infinitos em telas de pergunta.
- `prefers-reduced-motion`: troca movimento por fade ou quadro estático `[FONTE L318]`. O CSS base já neutraliza `animation-duration` e `transition-duration`.
- Nada pisca mais de 3 vezes por segundo `[PROPOSTA]`.

## Componentes (inventário `[PROPOSTA]`)

| Componente         | Notas                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| Botão              | ≥ 56 px, cor + ícone ou rótulo, estados normal/pressionado/desabilitado                 |
| Cartão de fato     | conta grande, apoio em botão de ajuda sempre visível                                    |
| Teclado numérico   | ver acima                                                                               |
| Feedback de acerto | animação < 1 s, texto do Calú                                                           |
| Cartão de dica     | desenho do problema (grupos, fileiras, soma), uma ideia por dica                        |
| Progresso da fase  | itens concluídos, nunca tempo                                                           |
| Mapa de mundos     | mundos fechados mostram o Portão como "em breve", sem critérios e sem sensação de falta |
| Tela de descanso   | convite, nunca cobrança                                                                 |
| Lojinha            | confirmação com figura do item (ver `recompensas-e-economia.md`)                        |
| Alto-falante       | liga a narração (L310); some se o aparelho não tiver voz em pt-BR                       |

Estados vazio, carregando e offline mostram texto simples e uma ilustração; mensagens técnicas só ao adulto.

## Desempenho e PWA

- Instalável, abre em **< 3 s em 4G** e funciona offline; progresso sincroniza quando a conexão volta `[FONTE L316]`.
- JavaScript < **300 KB gzip** `[FONTE L317; CI: check:bundle]`. Imagens SVG e WebP.
- Alinhar `theme_color` e `background_color` do manifesto à paleta (`art-bible.md`). Hoje: `#2e9e5b` e `#fff7e6` em `vite.config.ts`.
- ✅ Ícone provisório do Calú (SVG/PNG em `public/icons/`); a arte final substitui os arquivos sem mudar o manifesto.

## Nunca na área da criança

Links externos · texto livre · anúncios · compras · chat · ranking · cronômetro · pedidos de permissão do navegador (microfone, localização, notificações) · qualquer coisa que peça dado pessoal. Mensagens de rede e de consentimento são para o adulto.

## Testes exigidos (Playwright, 360×740)

Todo botão visível com altura ≥ 56 px; espaço ≥ 12 px entre alvos; sem rolagem horizontal; teclado próprio responde; nenhuma requisição externa; nada no DOM com `setInterval` visível de tempo. Itens que exigem aparelho real: Safari iOS (voz, áudio, instalação) e um Android intermediário.
