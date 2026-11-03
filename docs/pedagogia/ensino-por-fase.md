# Ensino por fase — Mundos 1 e 2 (storyboard)

Status: `[RASCUNHO IA 2026-11-02]` — aguarda leitura do responsável. Falas do Calú: amostragem humana de ~10%; dicas de erro: 100% humana (CLAUDE.md). Nenhuma frase daqui vai ao jogo sem passar por `npm run validate:content` e pela amostragem. Base: `docs/gdd/mundos-e-fases.md` (estratégia e CPA de cada fase), `docs/ux/voz-do-calu.md`, decisão D27 (`docs/gdd/decisoes-abertas.md`).

## Princípio

A criança **não sabe nada**. Em cada fase ela passa por: **lição** (a ideia com objetos do seu mundo, mexendo com as mãos) → **padrão do dia** (descobre uma regularidade sem que ninguém a explique) → **prática guiada** (6 a 8 itens, apoio que some) → **prática livre** (o fluxo atual). Tudo sem tempo, sem nota, sem "errado". O Calú **mostra e pergunta**; só no fim, **uma** frase nomeia o padrão.

### Os passos de uma lição (tipos reutilizáveis para os Mundos 3–9)

| Passo                  | O que a criança faz                                                                |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `say`                  | lê/ouve uma fala curta do Calú e toca em "Continuar"                               |
| `show`                 | vê grupos de objetos (ex.: 3 ovos e 2 ovos); pode ser um dominó                    |
| `join`                 | toca em "Juntar": os grupos vão para o mesmo cesto e o total aparece               |
| `remove`               | toca nos objetos que saem; o que sobra aparece                                     |
| `tenframe` / `numline` | enche o quadro de dez / dá pulos na reta (para frente ou para trás)                |
| `swap`                 | toca em "Trocar de lugar": as duas parcelas trocam e o total fica à vista          |
| `family`               | vê o triângulo (3 números) e toca nas 4 contas, uma por vez                        |
| `ask`                  | responde uma conta guiada no teclado (**não vira registro de resposta**, não pune) |
| `choose`               | escolhe entre 3 cartões (números ou palavras curtas): completa uma tira de contas  |
| `name`                 | o Calú dá o nome ao padrão em uma frase                                            |

Regras: cada fala tem até ~10 palavras, números em algarismo, sem gênero marcado, sem as palavras da lista "não usamos". Errar um `ask` ou `choose` mostra a dica visual e deixa tentar de novo; nunca há "errado".

## Mundo 1 — Casa do Calú (adição até 10)

### W1-P01 · Juntar e contar tudo (regra +0)

Cena: brinquedos (carrinhos, bolinhas). Pictórico: quadro de dez. Abstrato: `0+4`.

1. `say` — "Oi! Eu sou o Calú. Vamos juntar coisas?"
2. `show` — 3 carrinhos | 2 carrinhos. `say` — "Aqui tem 3. Ali tem 2."
3. `join` — "Juntar". `ask` — `3 + 2` → 5. `say` — "Juntar é pôr tudo junto."
4. `tenframe` — enche 4. `show` — 4 bolinhas | cesto vazio. `say` — "E se o outro cesto está vazio?" `ask` — `4 + 0` → 4.
5. **Padrão do dia** (`choose`): `1+0=1`, `2+0=2`, `3+0=3`, `4+0=?` → cartões 3 · 4 · 5.
6. `name` — "Reparou? Somar 0 não muda nada."
7. `ask` — `0 + 4` com as Mãozinhas à mostra → 4.

### W1-P02 · Mais um

Cena: bolinhas. Pictórico: reta. Abstrato: `1+6`.

1. `say` — "Mais 1 é ir para o número seguinte."
2. `show` — 5 bolinhas; chega 1. `join`. `ask` — `5 + 1` → 6.
3. `numline` — parte do 3, dá 1 pulo, para no 4. `say` — "Na reta, é só 1 pulo."
4. **Padrão do dia** (`choose`): `1+1=2`, `2+1=3`, `3+1=4`, `4+1=?` → 4 · 5 · 6.
5. `name` — "Reparou? Mais 1 é o número que vem depois."
6. `ask` — `1 + 6` → 7.

### W1-P03 · Mais dois

Cena: ovos na cesta. Pictórico: quadro de dez. Abstrato: `2+4`.

1. `say` — "Mais 2 é pular de 2 em 2."
2. `show` — 4 ovos; chegam 2. `say` — "Abra 4 dedos. Agora mais 2." `ask` — `4 + 2` → 6 (Mãozinhas).
3. `tenframe` — enche 2, depois 4, 6, 8 (de 2 em 2).
4. **Padrão do dia** (`choose`): `2, 4, 6, 8, ?` → 9 · 10 · 11.
5. `name` — "Reparou? De 2 em 2 cai sempre num número par."
6. `ask` — `2 + 5` → 7.

### W1-P04 · Do maior pra frente (comutatividade como técnica)

Cena: frutas. Pictórico: dedos. Abstrato: `3+5`.

1. `show` — 3 bananas | 5 laranjas. `say` — "Comece pelo maior. Conte para frente."
2. `numline` — parte do 5, 3 pulos: 6, 7, 8. `ask` — `3 + 5` → 8.
3. `swap` — "Trocar de lugar": `5 + 3`. `choose` — "O total ficou…" → 7 · 8 · 9.
4. `name` — "Reparou? Trocar de lugar não muda o total."
5. `ask` — `2 + 7`, começando pelo 7 → 9.

### W1-P05 · Dobros

Cena: pares de chinelos. Pictórico: dominó. Abstrato: `4+4`.

1. `show` — 4 chinelos do pé esquerdo | 4 do pé direito. `say` — "Dois lados iguais."
2. `show` (dominó) — 4 de um lado e 4 do outro. `ask` — `4 + 4` → 8.
3. **Padrão do dia** (`choose`): `1+1=2`, `2+2=4`, `3+3=6`, `4+4=8`, `5+5=?` → 9 · 10 · 12.
4. `name` — "Reparou? Dobro é o mesmo número duas vezes."
5. `ask` — `3 + 3` → 6.

### W1-P06 · Vizinhos do dobro

Cena: fichas. Pictórico: quadro de dez. Abstrato: `4+5`.

1. `show` — 4 fichas azuis | 5 fichas laranja. `say` — "4 e 4 é o dobro. Sobra 1 ficha."
2. `ask` — "O dobro de 4 é?" → 8. `ask` — "E mais 1?" → 9. (`4 + 5`)
3. `say` — "Tire 1 do 6 e ponha no 4." `show` — `4 + 6` vira `5 + 5`. `ask` — `4 + 6` → 10.
4. **Padrão do dia** (`choose`): `1+2=3`, `2+3=5`, `3+4=7`, `4+5=?` → 8 · 9 · 10.
5. `name` — "Reparou? Os vizinhos pulam de 2 em 2: 3, 5, 7, 9."
6. `ask` — `3 + 4` → 7.

### W1-P07 · Pares que fazem 10

Cena: copos. Pictórico: quadro de dez. Abstrato: `3+7`.

1. `tenframe` — 3 copos cheios. `say` — "Faltam quantos para 10?" `ask` — `3 + ? = 10` → 7.
2. **Padrão do dia** (`choose`): `1+9`, `2+8`, `3+7`, `4+6`, `5+5`: a tira mostra o 1º número subindo e o 2º descendo; "O 2º número agora é?" → 3 · 4 · 5 (depois de 6).
3. `name` — "Reparou? Um sobe, o outro desce, e o total fica 10."
4. `ask` — `3 + 7` → 10. `ask` — `3 + 6` → 9 ("1 a menos que 10").

### W1-P08 · Grande Desafio: Festa surpresa do Calú (sem fato novo)

1. `say` — "Hoje tem festa! Vamos usar os truques."
2. `choose` — "Qual truque ajuda em 4 + 4?" → Dobro · Mais 1 · Somar 0 (um por rodada, 3 rodadas: `5+1` Mais 1; `3+7` Pares de 10; `6+0` Somar 0).
3. Segue direto para a prática.

## Mundo 2 — Praça do Bairro (subtração como adição ao contrário)

### W2-P01 · Tirar nada, tirar tudo (regra −0 e n−n)

Cena: balões. Pictórico: riscar o desenho. Abstrato: `6−6`.

1. `show` — 5 balões. `say` — "Tirar é levar embora."
2. `remove` — toca em 2 balões. `ask` — `5 − 2` → 3.
3. `say` — "E se eu não tirar nenhum?" `ask` — `5 − 0` → 5.
4. `remove` — toca nos 5. `ask` — `5 − 5` → 0.
5. **Padrão do dia** (`choose`): `2−2=0`, `3−3=0`, `4−4=0`, `5−5=?` → 0 · 1 · 5.
6. `name` — "Reparou? Tirar tudo deixa 0. Tirar nada deixa tudo."
7. `ask` — `6 − 6` → 0.

### W2-P02 · A família do triângulo

Cena: cartas. Pictórico: triângulo. Abstrato: `6−1`. **Inverso soma/subtração.**

1. `say` — "3 números moram juntos."
2. `family` — triângulo 1, 2 e 3. A criança toca nas 4 cartas: `1 + 2`, `2 + 1`, `3 − 1`, `3 − 2`.
3. `ask` — `3 − 1`, com "1 + ? = 3" à vista → 2.
4. **Padrão do dia** (`choose`): "Se `1 + 2 = 3`, então `3 − 2` é…" → 1 · 2 · 3.
5. `name` — "Reparou? Quem sabe juntar, sabe tirar."
6. `ask` — `6 − 1` → 5.

### W2-P03 · Tirar um e quanto falta

Cena: figurinhas. Pictórico: reta. Abstrato: `9−1`.

1. `numline` — parte do 7, 1 pulo para trás: 6. `say` — "Tirar 1 é pular para trás."
2. `numline` — do 6 ao 7. `say` — "Ou: quanto falta do 6 para o 7?" `ask` — `7 − 6` → 1.
3. **Padrão do dia** (`choose`): `7−1=6`, `8−1=7`, `9−1=8`, `10−1=?` → 8 · 9 · 10.
4. `name` — "Reparou? Tirar 1 dá o número de antes."
5. `ask` — `9 − 1` → 8. `ask` — `4 − 2` → 2.

### W2-P04 · Pulos de dois

Cena: ônibus com passageiros. Pictórico: reta. Abstrato: `8−2`.

1. `show` — 8 passageiros. `remove` — 2 descem. `ask` — `8 − 2` → 6.
2. `numline` — pulos de 2 para trás: 10, 8, 6, 4.
3. **Padrão do dia** (`choose`): `10, 8, 6, 4, ?` → 2 · 3 · 5.
4. `name` — "Reparou? De 2 em 2 para trás também cai em par."
5. `ask` — `7 − 2` → 5.

### W2-P05 · De 10 para baixo

Cena: moedas de brinquedo. Pictórico: quadro de dez. Abstrato: `10−3`.

1. `tenframe` — 10 fichas cheias. `remove` — 3. `say` — "Sobraram 7. Lembra? 3 + 7 = 10."
2. `ask` — `3 + ? = 10` → 7. `ask` — `10 − 3` → 7.
3. **Padrão do dia** (`choose`): `10−1=9`, `10−2=8`, `10−3=7`, `10−4=?` → 5 · 6 · 7.
4. `name` — "Reparou? Tirando de 10, o resto desce de 1 em 1."
5. `ask` — `9 − 3` → 6.

### W2-P06 · Quase lá

Cena: pães. Pictórico: triângulo. Abstrato: `9−4`. **Sem objetos.**

1. `say` — "Sem objetos, pense na soma."
2. `family` — triângulo 4, 5 e 9. `ask` — `4 + ? = 9` → 5. `ask` — `9 − 4` → 5.
3. **Padrão do dia** (`choose`): "Para `9 − 5`, pense `5 + ? = 9`" → 3 · 4 · 5.
4. `name` — "Reparou? Tirar é somar ao contrário."
5. `ask` — `8 − 4` → 4.

### W2-P07 · Grande Desafio: Dia de feira na praça (sem fato novo)

1. `say` — "Dia de feira! Vamos usar os truques."
2. `choose` — "Qual truque ajuda em 10 − 3?" → Pares de 10 · Dobro · Mais 1 (3 rodadas: `10−3` Pares de 10; `7−1` Número de antes; `9−4` Somar ao contrário).
3. Segue direto para a prática.

## Prática guiada (todas as fases com fato novo)

`PARAMS.guidedPracticeItems` (6 a 8 itens, valor já aprovado; **não muda**): os fatos novos da fase, cada um pelo menos 2 vezes, na 1ª sessão da fase. O apoio **some**: 1º terço com ferramenta aberta e dica passo a passo; 2º terço só no botão "Ajuda"; último terço sem apoio. Errar mostra a dica visual (a soma por trás) e o item volta (regra da D1). Registra como resposta normal.

## Mapa de padrões — direção para os próximos mundos (sem implementar)

| Mundo | Padrão a descobrir (indireto)                                            | Como a criança nota                          |
| ----- | ------------------------------------------------------------------------ | -------------------------------------------- |
| W3    | +10 só muda a dezena; +9 = +10 −1; fazer 10                              | tira de contas com 7+10, 8+10…; cartões      |
| W5    | ×2 é o dobro; ×10 acrescenta um grupo de 10; ×5 é metade de ×10; ×1 e ×0 | tira 2, 4, 6…; 10, 20, 30…; 5, 10, 15…       |
| W6    | ×4 é dobro do dobro; ×3 é ×2 mais um grupo                               | Monta-Grupos e Fileiras                      |
| W7    | comutatividade (4×6 = 6×4); ×9 = ×10 menos um grupo; ×6, ×8 pelo dobro   | Fileiras/colunas; tira dos 9: 9, 18, 27, 36… |
| W8    | divisão é multiplicação ao contrário (triângulo de ×)                    | Família de Fatos com ×                       |

Os padrões ficam em `lessons/` como `pattern` de cada fase; o Mapa da tabuada (painel) já mostrará o estado dos fatos.

## Vocabulário novo (diff proposto, não aplicado)

As falas usam verbos de instrução e termos de ensino que **não** estão em `palavras-2ano.json` (feita para histórias). Proposta: **lista separada** `src/content/vocab/palavras-licoes.json`, usada só no validador das lições (a lista de histórias não muda). Palavras além do que já existe: `oi`, `eu`, `sou`, `vamos`, `juntar`, `junte`, `tire`, `tirar`, `toque`, `abra`, `conte`, `comece`, `pense`, `reparou`, `truque`, `truques`, `mostra`, `quanto`, `quantos`, `ficaram`, `sobraram`, `faltam`, `pulo`, `pulos`, `pular`, `reta`, `dedos`, `dedo`, `quadro`, `triângulo`, `moram`, `soma`, `somar`, `zero`, `nada`, `tudo`, `número`, `seguinte`, `depois`, `antes`, `dobro`, `par`, `pares`, `lado`, `lados`, `total`, `troca`, `trocar`, `lugar`, `vizinhos`, `sobe`, `desce`, `fica`, `contrário`, `objetos`, `festa`. Quem aprova é o responsável.
