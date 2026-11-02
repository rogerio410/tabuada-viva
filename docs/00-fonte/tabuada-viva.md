# Tabuada Viva — Planejamento do Jogo

Nov 1, 2026 · @Rogério Silva

## Visão geral

Tabuada Viva é um jogo web (PWA), feito primeiro para celular, que leva crianças de 7 a 8 anos ao domínio das quatro tabuadas por meio de histórias do dia a dia — usando a leitura, em que elas já são fortes, como porta de entrada para a matemática.

O ponto de partida é a Ana Vitória: lê bem, vai bem em Português e Ciências, mas trava em Matemática e Educação Financeira justamente quando chegam a multiplicação e os problemas. O medo nasce do não saber; o jogo ataca isso com sucesso frequente, passos pequenos e zero punição.

| Item             | Definição                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Público          | Crianças de 7–8 anos, 2º e 3º ano do Fundamental, escolas de ensino forte em Teresina                |
| Usuários adultos | Pais/responsáveis e professores autorizados                                                          |
| Escopo da v1     | Fatos básicos de adição, subtração, multiplicação e divisão (0 a 10) + situações-problema e dinheiro |
| Plataforma       | Web responsiva instalável (PWA), retrato, funciona offline                                           |
| Sessão típica    | 10 a 12 minutos por dia                                                                              |
| Construção       | Claude Code, em sprints curtos com testes automatizados                                              |

**Estado de pronto:** um jogo online, progressivo, organizado em mundos e fases, com progresso salvo, recompensas, uso autorizado por um adulto e painel de competências legível por pais e professores — objetivo no que mede, divertido no que a criança sente.

## Fundamentos pedagógicos e BNCC

O jogo cobre as habilidades de números e sistema monetário do 2º ano e antecipa as do 3º ano, porque escolas de ensino forte costumam trabalhar a tabuada completa já no 2º ano.

### Princípios que guiam cada decisão

1. **Estratégia antes de memória.** A criança aprende _por que_ 6 × 4 é 24 (dobro de 3 × 4) antes de decorar. Fatos derivados de fatos já sabidos reduzem o que precisa ser memorizado — e tudo começa na adição: subtração, multiplicação e divisão são construídas a partir dela.
2. **Concreto → Pictórico → Abstrato (CPA).** Cada fato novo aparece como objetos manipuláveis (pães, figurinhas), depois como desenho (fileiras, barras) e só então como conta.
3. **Leitura como alavanca.** Problemas viram mini-histórias de 2 a 4 frases. A criança também _cria_ problemas montando frases — a BNCC pede "resolver e elaborar".
4. **Separar interpretar de calcular.** Em problemas, a criança primeiro escolhe _qual conta resolve_, depois calcula. Assim o painel mostra se o erro é de leitura do problema ou de cálculo.
5. **Sucesso frequente, sem cronômetro na aprendizagem.** Meta de 80–85% de acerto por sessão. Pressão de tempo aparece só em desafios opcionais, depois do domínio.
6. **Repetição espaçada com recuperação ativa.** Fatos voltam em intervalos crescentes; lembrar com esforço consolida mais que reler.
7. **Erro é informação.** Nada de vidas perdidas ou sons de fracasso. Erro gera uma dica visual e o fato volta mais cedo.

### Habilidades da BNCC cobertas

| Código   | O que pede (resumo)                                                                         | Onde aparece no jogo                |
| -------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| EF02MA05 | Construir fatos básicos de adição e subtração para cálculo mental ou escrito                | Mundos 1, 2 e 3 — o alicerce        |
| EF02MA06 | Resolver e elaborar problemas de adição e subtração (juntar, acrescentar, separar, retirar) | Histórias dos Mundos 1 a 4          |
| EF02MA20 | Equivalência entre moedas e cédulas em situações do cotidiano                               | Mundos 4 e 9                        |
| EF03MA03 | Fatos básicos de adição e multiplicação para cálculo mental                                 | Revisão espaçada em todos os mundos |
| EF02MA07 | Multiplicação por 2, 3, 4 e 5 como adição de parcelas iguais                                | Mundos 5 e 6, após o portão         |
| EF02MA08 | Dobro, metade, triplo e terça parte com imagens ou material manipulável                     | Mundo 6                             |
| EF03MA07 | Multiplicação por 2, 3, 4, 5 e 10: parcelas iguais e disposição retangular                  | Mundos 5, 6 e 7                     |
| EF03MA08 | Divisão até 10, com resto zero ou não, como repartição e como medida                        | Mundo 8                             |
| EF03MA24 | Comparar e trocar valores monetários em compra, venda e troca                               | Mundo 9                             |

[Fascículo 5 — Alfabetização e Letramento Matemático](https://www.vamosjogareaprender.com.br/wp-content/uploads/Fasciculo-5_Alfabetizacao-e-Letramento-Matematico_0505.pdf) · [EF02MA20 na Nova Escola](https://novaescola.org.br/planos-de-aula/habilidades/ef02ma20)

Educação Financeira, na BNCC, é tema transversal: no jogo ela vive dentro da matemática — troco, preço × quantidade, comparar preços, guardar para um objetivo — e não como disciplina à parte.

## Alicerce aditivo

A multiplicação só abre quando houver certeza de que a criança domina adição e subtração até 20; até lá, todo o jogo trabalha somas de base, com a subtração ensinada como a adição ao contrário.

A razão é simples: multiplicar é somar parcelas iguais e dividir é desfazer a multiplicação. Uma criança que ainda conta nos dedos para fazer 7 + 7 vai sofrer com 7 × 3, e o medo da matemática cresce justamente aí. Por isso o alicerce ocupa os 4 primeiros mundos e a maior parte do tempo inicial.

### Subtração como consequência da adição

- **Família de fatos desde o primeiro dia.** Ao aprender 3 + 5 = 8, a criança vê junto 5 + 3 = 8, 8 − 3 = 5 e 8 − 5 = 3, num triângulo com o 8 em cima.
- **Subtrair é perguntar "quanto falta?".** 12 − 9 vira "de 9 para chegar a 12, quanto falta?" — contando para cima, nos dedos ou na reta numérica.
- **Cada fato de subtração tem uma raiz de adição** registrada no jogo. Quando a criança erra 13 − 8, a dica mostra 8 + ? = 13 e o fato de adição que ela já sabe.
- **A subtração de um grupo só abre** quando os fatos de adição que a originam estão no estado Praticando ou acima.

### Do contar ao lembrar

A criança passa por quatro degraus. O jogo registra em qual ela está em cada fato e nunca proíbe o degrau anterior — só convida ao próximo.

1. **Contar tudo:** 5 + 3 → conta 1, 2, 3, 4, 5, 6, 7, 8.
2. **Contar a partir do maior:** começa no 5 e conta mais 3 nos dedos: 6, 7, 8.
3. **Usar o que já sabe:** 6 + 7 é o dobro de 6 mais 1; 8 + 5 é 8 + 2 (faz 10) + 3.
4. **Lembrar direto:** 8 + 5 = 13, sem contar.

### Ferramentas da mão e da mesa

Os dedos são a primeira ferramenta de número que a criança tem e são bem-vindos no jogo. O que muda com o tempo é a forma de usar: de contar um por um para enxergar o 5 e o 10 de uma vez. Cada ferramenta existe na tela e tem uma versão física para usar em casa.

| Ferramenta        | Como a criança usa                                                                                                  | Ensina                                                                                              | Aparece      | Vai sumindo                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------- |
| Mãozinhas (dedos) | Duas mãos na tela que ela abre e fecha tocando, espelhando os próprios dedos; o Calú pede: "mostra nos seus dedos!" | Contar a partir do maior; uma mão = 5, duas = 10 sem contar; dedos abaixados = quanto falta para 10 | Mundos 1 a 3 | No estado Fluente fica só no botão de ajuda |
| Quadro de dez     | Grade de 2 × 5 casas com fichas                                                                                     | Ver 7 como "5 e mais 2" e "faltam 3 para 10"; base para fazer 10                                    | Mundos 1 a 3 | Vira desenho pequeno, depois some           |
| Colar de contas   | Duas fileiras de 10 contas, de 5 em 5 por cor; ela arrasta as contas                                                | Dobros, dobro + 1, passar pelo 10 (8 + 5)                                                           | Mundo 3      | Só no botão de ajuda após o Mundo 3         |
| Reta numérica     | Pulos numa reta de 0 a 20                                                                                           | Subtração como distância e "quanto falta"                                                           | Mundos 2 e 3 | Fica para problemas de comparar             |
| Dominós e dados   | Ver a quantidade sem contar                                                                                         | Reconhecer quantidades de relance e dobros                                                          | Aquecimentos | Permanece como aquecimento                  |

Toda resposta registra se a criança abriu um apoio. O painel mostra essa taxa por fato, e ela é parte do critério do portão: o objetivo é que os dedos virem desnecessários, não proibidos.

Para casa, o jogo oferece um kit imprimível (quadro de dez, reta de 0 a 20, cartas da família de fatos) e sugere montar um colar de contas com barbante e 20 miçangas de duas cores.

### Portão da Multiplicação

Os mundos de multiplicação ficam fechados — sem atalho no painel — até a criança cumprir todos os critérios:

| Critério                                                               | Exigência                                                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Fatos de adição (0 + 0 até 10 + 10)                                    | Todos em Fluente ou Dominado; pelo menos 90% em Dominado                                        |
| Fatos de subtração até 20                                              | O mesmo critério da adição                                                                      |
| Família de fatos                                                       | Acerto de 90% ou mais completando os triângulos                                                 |
| Problemas aditivos (juntar, acrescentar, retirar, comparar, completar) | 85% ou mais na escolha da operação e no cálculo                                                 |
| Uso de apoio                                                           | Abaixo de 10% das respostas nas últimas 2 semanas                                               |
| Prova da Ponte                                                         | Desafio de 40 itens mistos, sem apoio, com 95% de acerto, feito 2 vezes com 7 dias de intervalo |

Quando tudo é cumprido, o painel avisa o adulto ("Ana está pronta para multiplicar") e ele confirma a abertura. Depois do portão, os fatos de adição e subtração continuam na revisão espaçada para sempre — o alicerce não sai de cena.

### A multiplicação nasce da adição

Passado o portão, cada fato de multiplicação é apresentado primeiro como uma soma que a criança já sabe resolver, e só então ganha o nome curto:

- **Dobros viram × 2.** "Você já sabe que 6 + 6 = 12. Isso é 2 vezes 6!"
- **Somas repetidas viram grupos.** 4 + 4 + 4 = 12 → "3 grupos de 4" → 3 × 4 = 12.
- **Contar de 5 em 5 e de 10 em 10 nas mãos vira × 5 e × 10.** Cada mão aberta vale 5; as duas valem 10.
- **Fatos novos saem dos antigos.** 3 × 4 é 2 × 4 mais um grupo de 4 — a mesma ideia de "dobro + 1" que ela usou na adição.
- **Erro em multiplicação volta para a soma.** Errou 3 × 6? A dica mostra 6 + 6 + 6 nas contas e deixa ela somar.
- **Curiosidade, não muleta:** o truque dos dedos para a tabuada do 9 aparece como desafio bônus, só depois que ela entendeu × 9 como × 10 menos um grupo.

### Enquanto a escola já multiplica: Ponte da Escola

A escola já cobra problemas de multiplicação. Para a criança acompanhar a turma sem pular o alicerce, existe a Ponte da Escola, um modo aberto desde o início. Nele, todo problema de multiplicação é resolvido por soma repetida.

O portão continua valendo para os Mundos 5 a 7, isto é, para decorar e ganhar fluência na tabuada. A Ponte não ensina tabuada: ela usa a multiplicação da escola para treinar adição, e os dois caminhos se reforçam.

**Exemplo real da lição de casa:** "A cada minuto de banho se usam 6 litros de água. Num banho de 4 minutos, quantos litros?"

1. **Ler e achar o "a cada".** O jogo destaca "a cada minuto → 6 litros" e pergunta: "O que se repete?"
2. **Montar a Tabela que Cresce.** Linha a linha, ela soma 6:

| Minutos | Litros | Conta que ela faz                   |
| ------- | ------ | ----------------------------------- |
| 1       | 6      | —                                   |
| 2       | 12     | 6 + 6 (dobro que ela já sabe)       |
| 3       | 18     | 12 + 6                              |
| 4       | 24     | 18 + 6, ou 12 + 12 (dobro do dobro) |

3. **Dar o nome no fim.** O Calú fecha: "Você somou 6 quatro vezes. Na escola, isso se escreve 4 × 6 = 24."
4. **Conectar com a vida.** "E se o banho fosse de 2 minutos? Quanta água você economizaria?" Esse passo faz a ponte com a educação financeira e ambiental.

**Regras da Ponte da Escola:**

- **Problemas do tipo "a cada".** A cada minuto, cada pacote, cada mesa. O banco de histórias ganha esse tipo, com o mesmo formato dos exercícios da escola.
- **Lição de casa digitada pelo adulto.** Um formulário simples monta o problema no jogo: "a cada \[1\] \[minuto\] usa \[6\] \[litros\]; quantos em \[4\] \[minutos\]?"
- **Apoio liberado.** Toda soma da tabela pode usar Mãozinhas, quadro de dez ou colar de contas.
- **Registro no painel.** Cada linha da tabela conta como prática dos fatos de adição envolvidos. O problema conta como "multiplicação com apoio" e nunca como fluência na tabuada.

## Trilha de mundos e fases

A v1 tem 9 mundos e cerca de 70 fases: os 4 primeiros constroem o alicerce de adição e subtração, o Portão da Multiplicação fica entre o Mundo 4 e o Mundo 5, e cada mundo termina num Grande Desafio em forma de história.

Na multiplicação, a ordem segue os fatos derivados da adição: primeiro × 2 (os dobros que ela já sabe), × 10 e × 5 (contar nas mãos), depois os que se apoiam neles (× 4 é dobro do dobro, × 9 é × 10 menos um grupo). O × 7 fica por último porque, quando chega, só restam três fatos novos (7 × 7, 7 × 8, 7 × 9).

| Mundo                   | Cenário                             | Operação e fatos                             | Estratégias e ferramentas                                                                  | Fases |
| ----------------------- | ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ | ----- |
| 1. Casa do Calú         | Quarto, cozinha, quintal            | Adição com resultado até 10                  | Contar a partir do maior, +0, +1, +2, pares que fazem 10 · Mãozinhas, quadro de dez        | 8     |
| 2. Praça do Bairro      | Praça, ônibus, banca                | Subtração até 10 como adição ao contrário    | Família de fatos, "quanto falta?" · Mãozinhas, reta numérica                               | 7     |
| 3. Ponte do Poti        | Ponte, beira-rio, sorveteria        | Adição e subtração até 20                    | Dobros, dobro + 1, fazer 10, +9 como +10 − 1, subtrair passando pelo 10 · colar de contas  | 10    |
| 4. Mercadinho           | Padaria, mercadinho, cantina        | Dinheiro e problemas aditivos                | Trocar valores, troco contando para cima, comparar e completar · termina na Prova da Ponte | 7     |
| Portão da Multiplicação | —                                   | Critérios da seção Alicerce aditivo          | Confirmação do adulto                                                                      | —     |
| 5. Feira                | Bancas de frutas e verduras         | × 2, × 10, × 5                               | Dobros viram × 2, somas repetidas viram grupos, contar de 5 em 5 nas mãos                  | 8     |
| 6. Festa de Aniversário | Mesa de doces, brindes              | × 4, × 3; dobro, metade, triplo, terça parte | × 4 = dobro do dobro, × 3 = × 2 + 1 grupo                                                  | 8     |
| 7. Parque e Estádio     | Fileiras de cadeiras, canteiros     | × 6, × 9, × 8, × 7                           | Disposição retangular, × 6 = dobro de × 3, × 9 = × 10 − 1 grupo, × 8 = dobro de × 4        | 9     |
| 8. Cozinha da Vovó      | Repartir bolos, empacotar biscoitos | Divisão por 2 a 10, com e sem resto          | Repartir igualmente, "quantos grupos cabem", divisão como multiplicação ao contrário       | 8     |
| 9. Feirinha da Escola   | Barraca da turma, cofrinho          | Problemas mistos com dinheiro                | Preço × quantidade, comparar preços, juntar para um objetivo                               | 6     |

### Anatomia de uma fase

- **Apresentação (CPA):** 1 fato ou estratégia nova, mostrada com objetos e desenho, narrada em texto curto.
- **Prática guiada:** 6 a 8 itens do grupo novo, com apoio visual que vai sumindo.
- **Prática intercalada:** fatos novos misturados com revisão de fases anteriores.
- **História da fase:** 1 a 2 situações-problema que usam os fatos da fase.
- **Recompensa:** estrelas e item colecionável.

Uma fase libera a próxima com 2 estrelas (acerto ≥ 80%) e o Grande Desafio de cada mundo libera o seguinte. Nos Mundos 1 a 4 não há atalho: a ordem é fixa, porque cada mundo usa os fatos do anterior. Depois do portão, os mundos de multiplicação seguem em ordem, e o Mundo 9 abre junto com o Mundo 8.

## Mecânica de aprendizagem

Cada fato (ex.: 7 × 8) tem estado próprio e sobe ou desce de nível conforme as respostas; um fato só conta como dominado quando a criança acerta, sem apoio, em dias diferentes e com resposta rápida.

### Estados de um fato

| Estado     | Significa                                       | Como entra                        | Revisão        |
| ---------- | ----------------------------------------------- | --------------------------------- | -------------- |
| Novo       | Ainda não apresentado                           | Início                            | —              |
| Aprendendo | Visto, ainda precisa de apoio visual            | Apresentado na fase               | Toda sessão    |
| Praticando | Acerta sem apoio, mas devagar ou com oscilação  | 3 acertos seguidos sem apoio      | A cada 2 dias  |
| Fluente    | Acerta rápido em 2 dias diferentes              | Acertos em 2 sessões, tempo ≤ 4 s | A cada 5 dias  |
| Dominado   | Acerto rápido mantido depois de intervalo longo | Acerto após revisão de 5 dias     | A cada 14 dias |

Um erro desce o fato um nível (nunca abaixo de Aprendendo) e o traz de volta na mesma sessão, depois de 2 ou 3 outros itens. O tempo de resposta é medido em silêncio e nunca é mostrado à criança.

Abrir um apoio (Mãozinhas, quadro de dez, colar de contas) conta como acerto com ajuda: mantém o fato em Aprendendo ou Praticando e nunca o promove a Fluente. Assim o jogo acolhe os dedos sem confundir "resolveu contando" com "já sabe".

### Montagem de uma sessão (10–12 min)

1. **Aquecimento:** 3 fatos já dominados — começar acertando.
2. **Revisões vencidas:** fatos cujo intervalo venceu, priorizando os de nível mais baixo.
3. **Conteúdo novo:** a fase atual, no máximo 2 fatos novos por sessão.
4. **História:** 1 ou 2 situações-problema.
5. **Fechamento:** um item fácil e a recompensa.

Proporção-alvo: cerca de 70% de itens conhecidos e 30% novos ou frágeis. Se o acerto da sessão cair abaixo de 70%, o motor reduz itens novos e volta o apoio visual; acima de 90% por 3 sessões, acelera.

### Dicas por tipo de erro

O motor reconhece erros típicos e responde com uma dica específica, não com "errado":

| Erro observado                         | Exemplo                         | Dica do jogo                                                 |
| -------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| Somou em vez de multiplicar            | 6 × 4 = 10                      | Mostra 6 grupos de 4 pães e pergunta "quantos pães ao todo?" |
| Errou por um grupo                     | 7 × 6 = 36                      | "Você achou 6 × 6. Falta mais um grupo de 6!"                |
| Trocou a ordem na subtração            | 5 − 8                           | Mostra os objetos: "Dá pra tirar 8 se só tem 5?"             |
| Contou de um em um demais              | Resposta certa, mas lenta       | Sugere a estratégia (dobro, completar 10) na próxima vez     |
| Escolheu a operação errada no problema | Somou numa situação de repartir | Releitura guiada da história, destacando a palavra-chave     |

O último tipo vai para o painel como **erro de interpretação**, separado dos erros de cálculo.

## Game design

A criança ajuda o Calú, um calango curioso, a resolver os probleminhas do bairro dele — um bairro que lembra Teresina, com padaria, feira, praça, cajuína e calor.

### Personagens

- **Calú, o calango** — guia e narrador. Erra junto, comemora junto, nunca dá bronca.
- **Vó Maria** — dona da cozinha do Mundo 8; repartir é com ela.
- **Seu Raimundo da padaria** e **Dona Lúcia da feira** — clientes e vendedores das histórias de dinheiro.
- **Avatar da criança** — escolhido no início (roupa, cor, acessório), liberando itens com o progresso.

### Minijogos (formatos de pergunta)

Variar o formato mantém a prática interessante sem mudar o conteúdo.

| Minijogo             | Mecânica                                                                           | Treina                                  | Exemplo                                           |
| -------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Monta-Grupos         | Arrastar objetos para cestas iguais                                                | Multiplicação como grupos iguais        | 3 cestas com 4 mangas cada                        |
| Fileiras             | Tocar para encher linhas e colunas de cadeiras                                     | Disposição retangular, comutatividade   | 4 fileiras de 6 = 6 fileiras de 4                 |
| Resposta Rápida      | Teclado numérico grande, um fato por vez                                           | Fluência dos fatos                      | 8 × 5 = ?                                         |
| Qual Conta?          | Ler a história e escolher entre 3 contas                                           | Interpretação de problemas              | "Repartir 12 brigadeiros entre 3 amigos" → 12 ÷ 3 |
| Caixa do Mercadinho  | Arrastar moedas e cédulas para pagar ou dar troco                                  | Sistema monetário, subtração            | Pão de R$ 3, pagou com R$ 5                       |
| Família de Fatos     | Completar o triângulo com as 4 contas: primeiro de adição, depois de multiplicação | Ligação entre + e −; depois entre × e ÷ | 3 + 5, 5 + 3, 8 − 3, 8 − 5                        |
| Fábrica de Histórias | Montar um problema com cartões de frases                                           | Elaborar problemas (BNCC)               | Montar uma história para 5 × 2                    |

O **Fábrica de Histórias** é o minijogo que mais aproveita a força da Ana em leitura: ela monta frases como "Na padaria / cada pacote tem 5 pães / comprei 2 pacotes / quantos pães?" e o jogo confere se a história combina com a conta.

### Situações-problema do dia a dia

As histórias usam o que a criança vê em casa e na rua. Exemplos para o banco inicial:

- A mãe comprou 3 pacotes de pão de queijo com 6 em cada. Quantos pães de queijo?
- Um engradado de cajuína tem 6 garrafas. Quantas garrafas há em 4 engradados?
- O ônibus tinha 15 pessoas. Desceram 7 na praça. Quantas ficaram?
- Vó Maria fez 20 cocadas e quer dividir igualmente em 4 potes. Quantas em cada pote?
- O picolé custa R$ 4. Ana tem R$ 10. Quanto sobra se comprar 2?
- A turma vai à feirinha. Cada copo de suco custa R$ 2. Quanto custam 5 copos?
- Na festa há 7 mesas com 4 cadeiras cada. Quantas cadeiras?
- Pedro tem 9 figurinhas e Ana tem o dobro. Quantas figurinhas Ana tem?

Cada história tem um campo de contexto (casa, rua, escola, compras, festa) e um tipo de problema (juntar, acrescentar, retirar, comparar, grupos iguais, "a cada", retangular, repartir, medir), para o painel saber quais contextos a criança domina.

### Recompensas

As recompensas premiam esforço e acerto, nunca velocidade, e nada se perde por errar ou por ficar um dia sem jogar.

- **Estrelas (1 a 3 por fase)** — pelo percentual de acerto; refazer a fase pode melhorar.
- **Álbum Bichos do Piauí** — figurinhas originais (calango, tatu, mocó, arara, ema…) ganhas ao terminar fases; completar uma página dá um bônus.
- **Cajus** — moeda do jogo, ganha a cada sessão. Gasta-se na lojinha para decorar a casa do Calú.
- **Cofrinho** — cajus guardados no cofrinho rendem um bônus semanal pequeno, e itens especiais exigem juntar por alguns dias. É educação financeira vivida: esperar, poupar, escolher.
- **Jardim da semana** — uma plantinha cresce a cada dia de prática. Se a criança pula um dia, ela só não cresce; nunca murcha.

Fica fora do jogo: anúncios, compras com dinheiro real, caixas de sorte, ranking entre crianças e contagem regressiva nas fases de aprendizagem.

## Painel de competências

O painel responde em 30 segundos a três perguntas do adulto: o que ela já domina, onde está travando e o que fazer hoje para ajudar.

O acesso fica atrás de um PIN de 4 dígitos do adulto, separado da tela da criança. O professor vê a turma; o responsável vê só os próprios filhos.

### Telas do painel

1. **Resumo da semana** — minutos praticados, dias de prática, fatos que passaram a Dominado, acerto médio, e uma frase-síntese ("Ana dominou a tabuada do 5 e está começando a do 3").
2. **Mapa da tabuada** — uma grade 10 × 10 por operação, cada célula colorida pelo estado do fato (Novo, Aprendendo, Praticando, Fluente, Dominado). É a visão que mostra de relance onde está o buraco.
3. **Habilidades BNCC** — cada código da seção anterior com status (não iniciada, em desenvolvimento, consolidada) e as evidências que levaram ao status.
4. **Problemas: leitura × cálculo** — acerto na escolha da operação separado do acerto no cálculo, por tipo de problema e por contexto.
5. **Fatos teimosos** — os 5 fatos com mais erros, o erro mais comum de cada e a dica que o jogo está usando.
6. **Para fazer em casa** — 2 sugestões fora da tela ligadas ao que está travando ("Na padaria, pergunte quantos pães vêm em 3 pacotes de 6").

Enquanto a multiplicação não abre, o Resumo da semana destaca o **Portão da Multiplicação**: cada critério com seu progresso ("adição: 98 de 121 fatos dominados") e a taxa de uso de apoio por fato, para o adulto ver os dedos ficando para trás.

### Indicadores e como ler

| Indicador                     | Como é calculado                             | Como ler                                                             |
| ----------------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| Fatos dominados               | Fatos no estado Dominado ÷ total da operação | Avanço real; cresce devagar e não regride à toa                      |
| Acerto da sessão              | Respostas certas ÷ respostas                 | Ideal entre 80% e 90%; abaixo de 70% o jogo já facilita sozinho      |
| Tempo médio por fato          | Mediana do tempo de resposta nos acertos     | Caindo ao longo das semanas = fluência chegando                      |
| Acerto na escolha da operação | Acertos no "Qual Conta?" ÷ tentativas        | Baixo com cálculo alto = dificuldade de interpretar, não de calcular |
| Constância                    | Dias com prática nos últimos 14              | 4 a 5 dias por semana já basta                                       |

O painel evita rótulos sobre a criança ("fraca", "atrasada"). Mostra fatos e habilidades, nunca uma nota única, e oferece exportar um relatório em PDF para levar à reunião da escola.

## Experiência no celular

O jogo é desenhado para um celular intermediário, segurado em pé, por uma criança de 7 anos, possivelmente sem internet estável — e só depois adaptado para tablet e computador.

### Regras de interface

- **Uma tarefa por tela.** Pergunta em cima, área de interação no meio, teclado embaixo, ao alcance do polegar.
- **Alvos grandes:** botões com no mínimo 56 px de altura e 12 px entre eles; nada de toque duplo ou gestos escondidos.
- **Teclado numérico próprio do jogo**, grande, em vez do teclado do sistema (que cobre a tela e muda de aparelho para aparelho).
- **Texto legível:** fonte arredondada, 20 px ou mais nas histórias, frases curtas, alto contraste.
- **Narração opcional:** um botão de alto-falante lê a história em voz alta (Web Speech API em pt-BR). Ajuda quem ainda lê devagar, sem tirar o protagonismo da leitura.
- **Feedback imediato e gentil:** acerto com som e animação curta (menos de 1 s); erro com uma dica visual, sem som de fracasso.
- **Sessão com fim natural:** depois de 10–12 minutos o Calú propõe parar ("Bora descansar? Amanhã tem mais!"). Evita maratona e cansaço.

### Desempenho e acesso

- PWA instalável na tela inicial, abre em menos de 3 s em 4G e funciona offline; o progresso sincroniza quando a conexão volta.
- Pacote inicial pequeno (meta: menos de 300 KB de JavaScript comprimido); imagens em SVG e WebP.
- Animações leves, respeitando a preferência de "reduzir movimento" do aparelho.
- Testado nos navegadores mais comuns (Chrome Android e Safari iOS), em telas a partir de 360 px de largura.

## Arquitetura técnica

Recomendação: PWA em React + TypeScript com um núcleo pedagógico em TypeScript puro, dados locais em IndexedDB e sincronização com Supabase (Postgres + Auth + Row Level Security).

O coração do sistema — gerar perguntas, decidir o que revisar, avaliar domínio, classificar erros — fica num pacote de domínio sem dependência de interface ou banco, no espírito de Clean Architecture. Isso deixa o motor 100% testável e permite trocar a camada de dados depois sem reescrever a pedagogia.

&#91;embedded content: arquitetura · 7 partes, núcleo isolado\]

A tela só pede perguntas ao motor e grava respostas pelos repositórios; trocar Supabase por Django mexe apenas em src/data.

### Stack

| Camada        | Escolha                                                                    | Por quê                                                               |
| ------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Interface     | React + Vite + TypeScript + Tailwind                                       | Rápido, leve, ótimo suporte do Claude Code                            |
| Animação      | Framer Motion (uso contido)                                                | Feedback gostoso sem pesar                                            |
| PWA e offline | vite-plugin-pwa (Workbox)                                                  | Instalável e funciona sem internet                                    |
| Dados locais  | IndexedDB via Dexie                                                        | Progresso salvo no aparelho, sincroniza depois                        |
| Backend       | Supabase: Postgres, Auth, RLS                                              | Contas de adultos e isolamento por família/turma sem servidor próprio |
| Painel        | Mesmo app, rota protegida por PIN + login do adulto; gráficos com Recharts | Um único deploy                                                       |
| Testes        | Vitest (motor), Playwright em viewport de celular (fluxos)                 | O motor pedagógico precisa de testes fortes                           |
| Hospedagem    | Vercel ou Netlify (front) + Supabase                                       | Custo zero ou quase zero no piloto                                    |

Alternativa: trocar o Supabase por Django + DRF com Postgres, se a preferência for ter o backend sob controle total. O núcleo em TypeScript não muda.

### Modelo de dados

| Entidade          | Campos principais                                                                     | Observação                                                                         |
| ----------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| adult             | id, email, papel (responsável ou professor), PIN (hash)                               | Única conta com login                                                              |
| child\_profile    | id, apelido, avatar, ano escolar, adulto responsável                                  | Sem sobrenome, sem foto, sem e-mail                                                |
| class\_group      | id, nome, professor, escola                                                           | Turma, opcional                                                                    |
| class\_membership | turma, criança, autorizado\_por, autorizado\_em                                       | Vínculo autorizado pelo responsável                                                |
| fact              | id, operação, a, b, resultado, estratégia, fatos raiz (de onde ele nasce)             | Catálogo fixo (\~440 fatos); 13 − 8 aponta para 8 + 5, 3 × 4 aponta para 4 + 4 + 4 |
| fact\_state       | criança, fato, estado, próxima\_revisão, acertos, erros, tempo\_mediano               | Coração da repetição espaçada                                                      |
| problem           | id, texto, contexto, tipo, operação esperada, números                                 | Banco de histórias                                                                 |
| attempt           | criança, item, resposta, correta, tempo\_ms, apoio\_usado, tipo\_de\_erro, criado\_em | Cada resposta, base do painel                                                      |
| session           | criança, início, fim, itens, acerto                                                   | Uma por dia de prática                                                             |
| reward\_wallet    | criança, cajus, cofrinho, estrelas, figurinhas                                        | Recompensas                                                                        |
| consent           | adulto, criança, versão do termo, aceito\_em                                          | Prova do consentimento                                                             |

O Portão da Multiplicação é uma regra do motor (src/domain), calculada a partir de fact\_state e attempt; a interface só pergunta "está aberto?" e não tem como forçar a abertura.

O painel lê visões agregadas (por habilidade BNCC, por contexto, por fato), calculadas no banco, para ficar rápido no celular.

### Privacidade e LGPD

A LGPD (art. 14) exige que dados de crianças sejam tratados no melhor interesse delas e com consentimento específico e em destaque de pelo menos um dos pais ou responsável. Na prática, no jogo:

- Só o adulto cria conta; a criança entra pelo perfil criado por ele, sem login próprio.
- Coleta mínima: apelido, ano escolar e respostas do jogo. Nada de nome completo, foto, localização ou contato.
- Termo de consentimento curto e destacado na criação do perfil, com versão registrada.
- O professor só vê a criança depois que o responsável autoriza o vínculo com a turma.
- Botão "apagar todos os dados da criança" no painel do responsável.
- Sem rastreadores de terceiros, anúncios ou analytics que identifiquem a criança.

## Roteiro com Claude Code

A construção vai em 10 sprints curtos (estimativa: 1 semana cada), começando pelo motor pedagógico testado e só depois pela interface — assim a Ana já pode testar um jogo jogável no fim do Sprint 3.

| Sprint                        | Entrega                                                                                                                                                                  | Pronto quando                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 0. Fundação                   | Repositório, Vite + React + TS + Tailwind, PWA, CI, CLAUDE.md, estrutura de pastas                                                                                       | App vazio instala no celular e passa no CI                                                           |
| 1. Motor pedagógico           | Catálogo de fatos com fatos raiz, estados, agendador espaçado, montador de sessão, classificador de erros, registro de apoio, regra do portão                            | Testes cobrem promoção, rebaixamento, acerto com apoio, os 5 tipos de erro e cada critério do portão |
| 2. Loop de jogo e ferramentas | Tela de sessão, teclado próprio, Resposta Rápida, Mãozinhas, quadro de dez, reta numérica, progresso no IndexedDB                                                        | Uma sessão completa roda offline usando os dedos na tela                                             |
| 3. Mundos 1 e 2               | Adição até 10 e subtração como adição ao contrário, família de fatos, mapa de mundo, estrelas, Calú, Ponte da Escola com Tabela que Cresce e formulário de lição de casa | Ana joga 3 dias seguidos — primeiro teste real                                                       |
| 4. Contas e sincronização     | Login do adulto, perfis, termo de consentimento, RLS, sync offline → nuvem                                                                                               | Progresso aparece em outro aparelho; dados isolados por família                                      |
| 5. Mundos 3 e 4 + Portão      | Colar de contas, adição e subtração até 20, Caixa do Mercadinho, Qual Conta?, Prova da Ponte, painel do portão                                                           | O alicerce completo é jogável e o portão só abre com todos os critérios                              |
| 6. Mundos 5, 6 e 7            | Multiplicação apresentada como soma repetida, Monta-Grupos, Fileiras, dicas que voltam à soma                                                                            | Cada fato de × mostra sua soma de origem; tabuadas de 2 a 10 jogáveis                                |
| 7. Mundos 8 e 9 + recompensas | Divisão, Fábrica de Histórias, álbum, cajus, cofrinho, lojinha                                                                                                           | As 4 operações completas e todas as recompensas                                                      |
| 8. Painel                     | Resumo, mapa da tabuada, BNCC, leitura × cálculo, fatos teimosos, uso de apoio, PDF                                                                                      | Um responsável entende o painel sem explicação                                                       |
| 9. Turma e polimento          | Visão do professor, autorização de vínculo, acessibilidade, kit imprimível, testes em aparelhos reais                                                                    | Piloto com 5 a 10 crianças                                                                           |

### CLAUDE.md inicial

```markdown
# Tabuada Viva

Jogo web (PWA) mobile-first para crianças de 7–8 anos dominarem as tabuadas.

## Regras inegociáveis

- Mobile-first: testar sempre em viewport 360x740, retrato.
- Nada de cronômetro visível, vidas, punição ou som de fracasso.
- Textos para a criança: frases curtas, pt-BR, tom do Calú (gentil e animado).
- Coleta mínima de dados da criança (LGPD art. 14).
- Alicerce primeiro: multiplicação e divisão só abrem pelo Portão (regra em src/domain/gate), sem atalho.
- Todo fato de −, × e ÷ aponta para seu fato raiz de adição; dicas de erro voltam à soma.
- Apoios (dedos, quadro de dez, contas) são permitidos, registrados e nunca promovem a Fluente.

## Arquitetura

- src/domain → motor pedagógico em TS puro (sem React, sem I/O). 100% testado.
- src/content → mundos, fases, fatos e histórias em JSON validado por Zod.
- src/data → repositórios (Dexie local, Supabase remoto) atrás de interfaces.
- src/ui → telas, componentes e minijogos.
- src/dashboard → painel de pais e professores.

## Comandos

- npm run dev | npm test | npm run e2e | npm run lint

## Como trabalhar

- Mudou algo em src/domain: escreva o teste antes.
- Toda tela nova: teste Playwright no viewport de celular.
- Conteúdo novo (histórias): validar com o schema e conferir a conta.
```

### Prompts de exemplo

- **Sprint 1:** "Implemente em src/domain o agendador de revisão espaçada descrito na seção Mecânica de aprendizagem deste plano. Estados: Novo, Aprendendo, Praticando, Fluente, Dominado. Escreva os testes primeiro, cobrindo promoção, rebaixamento por erro e revisão vencida."
- **Sprint 2:** "Crie a tela de sessão para viewport 360 px: pergunta no topo, área de interação, teclado numérico próprio embaixo com teclas de 56 px. Use o montador de sessão de src/domain. Adicione um teste Playwright que joga uma sessão inteira."
- **Sprint 6:** "Gere 30 histórias para o Mundo 5 (×2, ×5, ×10), cada uma acompanhada da soma repetida que a origina, com contextos de feira, padaria e casa em Teresina, no schema de src/content. Valide que a resposta de cada uma bate com a conta."

### Aceleradores no Claude Code

- **Skill "nova-historia"** — gera e valida histórias no schema, garantindo vocabulário de 2º ano e conta correta.
- **Subagente revisor pedagógico** — revisa cada lote de conteúdo procurando ambiguidade, números fora da faixa e tom inadequado.
- **Hook de pré-commit** — roda testes do domínio e validação de conteúdo antes de cada commit.

## Critérios de pronto e validação

A v1 está pronta quando uma criança consegue ir do Mundo 1 ao Mundo 9 sozinha no celular, com o progresso salvo, e um adulto entende pelo painel exatamente onde ela está.

### Checklist da v1

- [ ] 9 mundos e cerca de 70 fases jogáveis, cobrindo os fatos de +, −, × e ÷ de 0 a 10
- [ ] Alicerce aditivo completo: adição e subtração até 20, família de fatos, subtração ligada à sua adição de origem
- [ ] Ferramentas da mão na tela (Mãozinhas, quadro de dez, colar de contas, reta numérica) com uso registrado
- [ ] Portão da Multiplicação implementado no motor, sem atalho, com Prova da Ponte e confirmação do adulto
- [ ] Cada fato de multiplicação apresentado primeiro como soma repetida, com dicas de erro que voltam à soma
- [ ] Pelo menos 120 histórias revisadas, distribuídas por contexto e tipo de problema
- [ ] Repetição espaçada e critério de domínio funcionando, com testes automatizados
- [ ] Dicas específicas para os 5 tipos de erro previstos
- [ ] Funciona offline e sincroniza o progresso entre aparelhos
- [ ] Recompensas completas: estrelas, álbum, cajus, cofrinho, jardim
- [ ] Painel com as 6 telas, progresso do portão e exportação em PDF
- [ ] Kit imprimível para casa (quadro de dez, reta de 0 a 20, cartas da família de fatos)
- [ ] Conta só para adultos, consentimento registrado, botão de apagar dados
- [ ] Visão de turma para professor com vínculo autorizado pelo responsável
- [ ] Testado em pelo menos 3 celulares reais (Android de entrada, Android intermediário, iPhone)

### Como saber se está funcionando

| Sinal         | Meta no piloto de 4 semanas                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constância    | Criança joga 4 ou mais dias por semana sem precisar ser lembrada todo dia                                                                                     |
| Domínio       | Adição até 10 em Dominado e subtração até 10 ao menos em Fluente; é provável que a multiplicação ainda não abra no primeiro mês, e isso é o plano funcionando |
| Fluência      | Tempo mediano por fato e uso de apoio (dedos, contas) caindo semana a semana                                                                                  |
| Interpretação | Acerto no "Qual Conta?" acima de 80%                                                                                                                          |
| Atitude       | A criança diz que gosta, ou pede para jogar; menos resistência à lição de casa de matemática                                                                  |

### Validação com a Ana Vitória

1. **Semana 0:** observar 1 sessão dela no protótipo, sem ajudar. Anotar onde trava, onde ri, o que não entende.
2. **Semanas 1 a 4:** 10 minutos por dia, de preferência no mesmo horário. O adulto olha o painel uma vez por semana.
3. **Conversa com a professora:** mostrar o relatório do painel e perguntar o que está sendo trabalhado em sala, para alinhar a ordem dos mundos.
4. **Atitude, não só nota:** perguntar no início e no fim "Como você se sente com matemática?" com 3 carinhas. Mudança aqui é o objetivo principal.

### Perguntas em aberto

- Já decidido: a escola está na multiplicação, e o jogo atende as tarefas pela Ponte da Escola, com soma repetida, enquanto o portão segura a tabuada. Falta combinar com a professora se ela aceita a resolução por soma repetida e tabela nas tarefas.
- Qual livro didático ou sistema de ensino a escola dela usa? Ajuda a casar vocabulário e ordem dos conteúdos.
- O piloto inclui colegas de turma, ou fica só com a Ana no primeiro mês?
- Nome final do jogo e do mascote — Tabuada Viva e Calú são provisórios.

## Fontes

- [Fascículo 5 — Alfabetização e Letramento Matemático (multiplicação e divisão na BNCC)](https://www.vamosjogareaprender.com.br/wp-content/uploads/Fasciculo-5_Alfabetizacao-e-Letramento-Matematico_0505.pdf)
- [EF03MA08 — divisão com repartição e medida](https://www.auditorioibirapuera.com.br/o-que-e-ef03ma08/)
- [EF02MA08 — dobro, metade, triplo e terça parte](https://www.portalinsights.com.br/perguntas-frequentes/qual-o-objeto-de-conhecimento-da-habilidade-ef02ma08)
- [EF02MA20 — planos de aula Nova Escola](https://novaescola.org.br/planos-de-aula/habilidades/ef02ma20)
- [EF03MA03 — fatos básicos para cálculo mental](https://www.tudosaladeaula.com/2023/05/atividades-de-multiplicacao-3o-ano/)
- EF02MA05, EF02MA06, EF03MA24 e LGPD art. 14: texto conhecido da BNCC e da Lei 13.709/2018, sem consulta nesta sessão — vale conferir na fonte oficial antes de publicar.
