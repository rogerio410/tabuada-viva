# Lista de assets

Status: `[PROPOSTA]`. IDs são **estáveis**: nunca reaproveitar um ID. Formato: `<CATEGORIA>-<NOME>[-<VARIAÇÃO>]`. Status: `placeholder-svg` (formas simples com tokens de `art-bible.md`) ou `final`. Tamanhos são alvo sem compressão. "Quando" é o sprint em que o asset é necessário (L381–392 da fonte). **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

## Regras dos placeholders

Formas geométricas com os tokens da paleta, contorno `ink`, nome do ID visível **só em modo dev**; mesmo `viewBox` do asset final; mesmo nome de arquivo (`public/art/<id>.svg` ou componente) para a troca ser sem retrabalho.

## Personagens

| ID                     | Descrição       | Usado em        | Formato | KB  | Status          | Quando   |
| ---------------------- | --------------- | --------------- | ------- | --- | --------------- | -------- |
| `CHAR-CALU-HAPPY`      | Calú alegre     | todo o jogo     | SVG     | 6   | placeholder-svg | Sprint 1 |
| `CHAR-CALU-THINK`      | pensando (dica) | dicas           | SVG     | 6   | placeholder-svg | Sprint 1 |
| `CHAR-CALU-CHEER`      | comemorando     | fim de fase     | SVG     | 6   | placeholder-svg | Sprint 1 |
| `CHAR-CALU-REST`       | descansando     | fim de sessão   | SVG     | 6   | placeholder-svg | Sprint 1 |
| `CHAR-MARIA`           | Vó Maria        | W8              | SVG     | 6   | placeholder-svg | Sprint 7 |
| `CHAR-RAIMUNDO`        | Seu Raimundo    | W4, W9          | SVG     | 5   | placeholder-svg | Sprint 5 |
| `CHAR-LUCIA`           | Dona Lúcia      | W5, W9          | SVG     | 5   | placeholder-svg | Sprint 6 |
| `AVATAR-BASE`          | corpo do avatar | perfil          | SVG     | 6   | placeholder-svg | Sprint 3 |
| `AVATAR-SKIN-01…06`    | 6 tons de pele  | perfil          | token   | 0   | placeholder-svg | Sprint 3 |
| `AVATAR-HAIR-01…08`    | 8 cabelos       | perfil          | SVG     | 8   | placeholder-svg | Sprint 3 |
| `AVATAR-CLOTHES-01…06` | 6 roupas        | perfil, lojinha | SVG     | 12  | placeholder-svg | Sprint 3 |
| `AVATAR-ACC-01…06`     | 6 acessórios    | lojinha         | SVG     | 8   | placeholder-svg | Sprint 7 |

## Interface

| ID                                                                 | Descrição                                        | Formato | KB  | Status          | Quando   |
| ------------------------------------------------------------------ | ------------------------------------------------ | ------- | --- | --------------- | -------- |
| `UI-KEY-0…9`, `UI-KEY-DEL`, `UI-KEY-OK`                            | teclado numérico                                 | SVG/CSS | 4   | placeholder-svg | Sprint 1 |
| `UI-STAR-EMPTY`, `UI-STAR-FULL`                                    | estrela                                          | SVG     | 1   | placeholder-svg | Sprint 3 |
| `UI-STATE-NEW`, `-LEARNING`, `-PRACTICING`, `-FLUENT`, `-MASTERED` | 5 estados (círculo, semente, broto, folha, flor) | SVG     | 5   | placeholder-svg | Sprint 1 |
| `UI-CAJU`                                                          | moeda do jogo                                    | SVG     | 1   | placeholder-svg | Sprint 7 |
| `UI-SPEAKER`                                                       | narração                                         | SVG     | 1   | placeholder-svg | Sprint 2 |
| `UI-MUTE`                                                          | modo mudo                                        | SVG     | 1   | placeholder-svg | Sprint 2 |
| `UI-HELP`                                                          | botão de ajuda                                   | SVG     | 1   | placeholder-svg | Sprint 1 |
| `UI-GATE-CLOSED`, `UI-GATE-OPEN`                                   | Portão no mapa                                   | SVG     | 4   | placeholder-svg | Sprint 5 |
| `UI-GARDEN-0…4`                                                    | estágios da planta do Jardim                     | SVG     | 8   | placeholder-svg | Sprint 7 |
| `UI-COFRE`                                                         | cofrinho                                         | SVG     | 3   | placeholder-svg | Sprint 7 |

## Apoios (ferramentas)

| ID                         | Descrição                             | Mundos       | KB  | Status          | Quando   |
| -------------------------- | ------------------------------------- | ------------ | --- | --------------- | -------- |
| `TOOL-HANDS`               | Mãozinhas (duas mãos, dedos tocáveis) | W1–W3        | 6   | placeholder-svg | Sprint 2 |
| `TOOL-TENFRAME`            | quadro de dez (2 × 5)                 | W1–W3        | 3   | placeholder-svg | Sprint 2 |
| `TOOL-BEADS`               | colar de contas (2 × 10)              | W3           | 4   | placeholder-svg | Sprint 5 |
| `TOOL-NUMLINE`             | reta numérica 0–20                    | W2–W3        | 3   | placeholder-svg | Sprint 2 |
| `TOOL-DOMINO`, `TOOL-DICE` | dominós e dados                       | aquecimentos | 4   | placeholder-svg | Sprint 3 |
| `TOOL-ARRAY`               | arranjo de fileiras e colunas         | W5–W8        | 3   | placeholder-svg | Sprint 6 |

## Cenários (um fundo por mundo e um mapa)

| ID                        | Mundo                  | KB      | Status          | Quando                            |
| ------------------------- | ---------------------- | ------- | --------------- | --------------------------------- |
| `ENV-W1-BG` … `ENV-W9-BG` | 1 a 9                  | 12 cada | placeholder-svg | Sprint do mundo (W1–W2: Sprint 3) |
| `ENV-MAP`                 | mapa de mundos         | 14      | placeholder-svg | Sprint 3                          |
| `ENV-HOME`                | casa do Calú (lojinha) | 12      | placeholder-svg | Sprint 7                          |

## Objetos de história

Cada objeto contável é um SVG de 1–2 KB, idêntico entre si.

| ID                                                                                           | Mundos    |
| -------------------------------------------------------------------------------------------- | --------- |
| `OBJ-PAO`, `OBJ-PAO-QUEIJO`, `OBJ-OVO`, `OBJ-LARANJA`, `OBJ-BANANA`, `OBJ-MANGA`, `OBJ-CAJU` | W1, W4–W5 |
| `OBJ-COPO`, `OBJ-BALAO`, `OBJ-BRIGADEIRO`, `OBJ-BOLO`, `OBJ-POTE`, `OBJ-PACOTE`              | W6, W8    |
| `OBJ-CADEIRA`, `OBJ-CANTEIRO`, `OBJ-CESTA`, `OBJ-SACO`, `OBJ-CAIXA`                          | W5, W7    |
| `OBJ-CAJUINA`, `OBJ-PICOLE`, `OBJ-FIGURINHA`                                                 | W3, W9    |
| `MONEY-R1`, `-R2`, `-R5`, `-R10`, `-R20`                                                     | W4, W9    |

## Álbum Bichos do Piauí (L264)

Inicial `[PROPOSTA]`, 12 figurinhas em 3 páginas de 4: `ALBUM-CALANGO`, `ALBUM-TATU`, `ALBUM-MOCO`, `ALBUM-ARARA`, `ALBUM-EMA`, `ALBUM-CAPIVARA`, `ALBUM-ONCA-PARDA`, `ALBUM-TUCANO`, `ALBUM-PREGUICA`, `ALBUM-JACARE`, `ALBUM-CARAMBOLA` (arbusto), `ALBUM-CAJU` (fruta). Lista final decidida com o responsável; **conferir a ocorrência de cada bicho no Piauí** (a lista acima não foi verificada); frases dos bichos conferidas por fonte científica. ~5 KB cada, WebP se o SVG passar de 6 KB.

## Orçamento `[APROVADO D18]`

| Grupo              | Itens                            | KB (alvo)                   |
| ------------------ | -------------------------------- | --------------------------- |
| Personagens        | 4 expressões + 3 NPC + avatar    | ≈ 85                        |
| Interface          | teclado, estados, ícones, jardim | ≈ 40                        |
| Apoios             | 7                                | ≈ 25                        |
| Cenários           | 9 + mapa + casa                  | ≈ 140                       |
| Objetos e dinheiro | ≈ 25                             | ≈ 35                        |
| Álbum              | 12                               | ≈ 60                        |
| **Total**          |                                  | **≈ 385 KB sem compressão** |

Isto **passa de 150 KB** do pacote inicial definido em `art-bible.md`; por isso: carregar por mundo (code splitting) e mostrar só o necessário; no pacote inicial ficam Calú, interface, apoios e os cenários W1–W2 (≈ 150 KB). Cenários e álbum dos mundos seguintes entram sob demanda e ficam no cache do PWA. **Decisão D18.**

## Brief curto para um ilustrador humano

Estilo: redondo, traço grosso uniforme, cores da paleta. Entregar SVG limpo (sem filtros pesados nem texto vetorizado), viewBox fixo, ≤ tamanho-alvo da tabela, nome = ID. Sem marcas, sem pessoas reais, sem rostos realistas. Licença: obra sob encomenda com cessão para o projeto; sem uso de IA generativa sem aviso `[PROPOSTA]`. Calú nunca ri de erro (ver `art-bible.md`).
