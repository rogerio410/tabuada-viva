# Art Bible

Status: `[PROPOSTA]` quase integral. A fonte só dá o cenário (bairro que lembra Teresina, L219), os personagens (L221–226), o álbum Bichos do Piauí (L264), "fonte arredondada" (L309) e SVG/WebP (L317). Paleta, formas e regras visuais abaixo são propostas da IA para aprovação. Nome do jogo e do mascote são **provisórios** (L486). Decisões ligadas: D18, D19, D20. **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

## Direção

Quente, redondo, claro. Formas arredondadas, traço grosso e uniforme (2–3 px a 360 px), poucas cores por cena, sem sombras duras nem texturas pesadas. Teresina como tempero: calor, cajueiro, rio Poti, feira, praça, sem estereótipo. O mundo é acolhedor; **nada assusta**.

## Paleta (tokens)

Fundo e texto vêm do código atual (`#FFF7E6`, `#2E9E5B`); o restante é proposta. Razões de contraste calculadas segundo a WCAG.

| Token        | Hex       | Uso                     | Contraste                                       |
| ------------ | --------- | ----------------------- | ----------------------------------------------- |
| `cream`      | `#FFF7E6` | fundo                   | —                                               |
| `ink`        | `#2B2118` | texto, contornos        | 14,8 sobre `cream`                              |
| `ink-soft`   | `#5E5247` | texto secundário        | 7,1 sobre `cream`                               |
| `green`      | `#2E9E5B` | tema do PWA, ilustração | 3,4 com branco (**só ilustração/texto grande**) |
| `green-deep` | `#1F7A44` | botão primário          | 5,4 com branco                                  |
| `caju`       | `#E8731A` | destaque, cajus         | 5,2 com `ink`                                   |
| `sol`        | `#F5B72E` | estrelas, brilho        | 8,8 com `ink`                                   |
| `poti`       | `#2A7FB8` | água, rio               | 4,4 com branco                                  |
| `poti-deep`  | `#1F6496` | botão secundário        | 6,3 com branco                                  |
| `barro`      | `#C4552D` | telhado, terra, tijolo  | 4,5 com branco                                  |
| `ameixa`     | `#7A4E9E` | estado Dominado, raros  | 6,2 com branco                                  |
| `pedra`      | `#6B6258` | estado Novo             | 5,6 sobre `cream`                               |

- Regra: **texto branco só sobre `green-deep`, `poti-deep`, `ameixa`, `barro`**; texto `ink` sobre `caju` e `sol`.
- Erro nunca é vermelho de alarme. Dica usa `poti` (curiosidade). `barro` serve para cenário, não para punir.
- Modo escuro fora da v1 `[APROVADO D20]`.

## Os 5 estados (cor + forma + rótulo)

| Estado     | Forma             | Cor de preenchimento | Contorno     |
| ---------- | ----------------- | -------------------- | ------------ |
| Novo       | círculo vazio     | `cream`              | `pedra` 2 px |
| Aprendendo | semente           | `sol`                | `ink` 2 px   |
| Praticando | broto             | `poti`               | `ink` 2 px   |
| Fluente    | folha             | `green`              | `ink` 2 px   |
| Dominado   | flor de 5 pétalas | `ameixa`             | `ink` 2 px   |

O contorno `ink` garante contraste ≥ 3 : 1 mesmo quando o preenchimento é claro. Verificar com simulação de daltonismo antes de fechar (ver `acessibilidade.md`).

## Personagens

| Personagem       | Descrição                                                                            | Papel                     | Regras                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Calú**         | calango pequeno, verde (`green`), barriga `sol` clara, olhos grandes, cauda enrolada | guia e narrador (L223)    | expressões: alegre, pensando, comemorando, descansando. **Nunca** ri de erro, aponta, franze a testa nem fica triste com o erro |
| **Vó Maria**     | idosa de cabelo branco preso, avental, mãos grandes                                  | cozinha do Mundo 8 (L224) | acolhedora; sem estereótipo de gênero                                                                                           |
| **Seu Raimundo** | padeiro, boné e avental                                                              | padaria, dinheiro (L225)  | adulto simpático                                                                                                                |
| **Dona Lúcia**   | feirante, chapéu de palha, banca                                                     | feira, dinheiro (L225)    | adulta simpática                                                                                                                |
| **Avatar**       | cor de pele, cabelo, roupa e acessório escolhidos pela criança (L226)                | a própria criança         | tons de pele e cabelos variados (cacheado, liso, crespo, careca, turbante, tranças), sem rótulo de gênero; sem rosto realista   |

- Sem pessoas reais, sem marcas, sem rosto de celebridade.
- Proporção de Calú: cabeça ≈ 1/3 do corpo; legível a 48 px.

## Mundos (L152–163)

| Mundo                  | Elementos-chave                    | Cores dominantes         |
| ---------------------- | ---------------------------------- | ------------------------ |
| 1 Casa do Calú         | quarto, cozinha, quintal, cajueiro | `cream`, `green`, `caju` |
| 2 Praça do Bairro      | praça, ônibus, banca de jornal     | `poti`, `sol`, `barro`   |
| 3 Ponte do Poti        | ponte, rio, sorveteria             | `poti`, `cream`, `caju`  |
| 4 Mercadinho           | padaria, mercadinho, cantina       | `barro`, `sol`, `green`  |
| 5 Feira                | bancas de frutas e verduras        | `green`, `caju`, `sol`   |
| 6 Festa de Aniversário | mesa de doces, brindes, balões     | `ameixa`, `sol`, `caju`  |
| 7 Parque e Estádio     | fileiras de cadeiras, canteiros    | `green`, `poti`, `barro` |
| 8 Cozinha da Vovó      | fogão, bolos, potes                | `barro`, `cream`, `caju` |
| 9 Feirinha da Escola   | barraca da turma, cofrinho         | `sol`, `green`, `poti`   |

O Portão aparece como um portão de madeira no mapa, **fechado com carinho** (sem cadeado nem sinal de proibição); o adulto abre.

## Objetos de aprendizagem

Pães, ovos, cestas, frutas, copos, brigadeiros, balões, cadeiras, canteiros e potes; quadro de dez (2 × 5), colar de contas (2 fileiras de 10, de 5 em 5 por cor), reta numérica (0 a 20), Mãozinhas, dominós e dados (L80–86). Cada objeto contável é **simples e idêntico** entre si (a criança precisa contar).

### Dinheiro `[APROVADO D19]`

Moedas e cédulas de **R$ 1, 2, 5, 10 e 20**, estilizadas, **sem reproduzir fielmente a arte das cédulas reais** (evita problema legal e confusão com dinheiro de verdade); cores distintas por valor e o número bem grande. Centavos ficam fora da v1.

## Bichos do Piauí (L264)

Calango, tatu, mocó, arara, ema e outros, em figurinhas **originais**, desenhadas por nós, sem copiar obras existentes. Cada figurinha tem o nome do bicho e uma frase curta e **verdadeira** (conferir antes de publicar). Lista inicial em `asset-list.md`.

## Regras de segurança infantil

Sem medo, sangue, armas, fumaça densa, fogo solto, nem situações de perigo; animais nunca "morrem" nem se machucam; sem comentários sobre corpo ou peso; sem comida como recompensa moral ("ser bom = ganhar doce"); sem marcas reais (cajuína e picolé são genéricos); sem símbolos religiosos ou políticos; sem personagens perdidos ou sozinhos à noite.

## Formatos e orçamento

- **SVG primeiro**, WebP onde o SVG ficaria pesado `[FONTE L317]`. Cores por token e `currentColor` quando fizer sentido.
- Sprites reutilizáveis (um SVG de objeto contável usado muitas vezes).
- Orçamento `[APROVADO D18]`: **pacote inicial** de arte ≤ **150 KB** sem compressão (≈ 50–60 KB gzip); o total (≈ 385 KB, ver `asset-list.md`) carrega **por mundo, sob demanda**, e fica no cache do PWA. Cada cenário ≤ 12 KB; cada expressão do Calú ≤ 6 KB. Nunito (woff2, 3 pesos) fica à parte, ≈ 70–90 KB.
- Acessibilidade: ilustração decorativa `aria-hidden`; informativa com `alt` curto em pt-BR.
- Placeholders SVG antes da arte final: ver `asset-list.md`.

## Pendências

Nome final do jogo e do mascote (L486) · ilustrador humano para a arte final · ícone do PWA (hoje é o favicon do template) · conferência científica das frases dos bichos.
