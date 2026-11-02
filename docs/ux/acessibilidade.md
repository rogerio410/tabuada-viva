# Acessibilidade

Status: `[APROVADO D17]` — a fonte só pede "alto contraste" (L309), narração opcional (L310) e respeito a "reduzir movimento" (L318). Todo o resto abaixo é proposta da IA para aprovação. **Aprovado pelo responsável em 2026-11-02** (os rótulos `[PROPOSTA]` restantes neste arquivo são detalhes aprovados junto com o documento).

## Alvo

**WCAG 2.2 nível AA como piso** `[APROVADO D17]`, mais regras específicas para criança de 7–8 anos e leitura lenta. O conjunto vale para a área da criança e para o painel do adulto.

## Contraste

| Elemento                                                         | Mínimo  |
| ---------------------------------------------------------------- | ------- |
| Texto normal                                                     | 4,5 : 1 |
| Texto grande (≥ 24 px, ou ≥ 19 px em negrito) e números da conta | 3 : 1   |
| Componentes e bordas importantes                                 | 3 : 1   |

Pares de cor verificados (cálculo WCAG, fundo `#FFF7E6`):

| Par                             | Razão   | Uso                                                              |
| ------------------------------- | ------- | ---------------------------------------------------------------- |
| Texto `#2B2118` sobre `#FFF7E6` | 14,8    | texto principal                                                  |
| Texto `#5E5247` sobre `#FFF7E6` | 7,1     | texto secundário                                                 |
| Branco sobre `#1F7A44`          | 5,4     | botão primário                                                   |
| Branco sobre `#2E9E5B`          | **3,4** | ❌ só para texto grande; **não** usar em botão com texto pequeno |
| Texto `#2B2118` sobre `#E8731A` | 5,2     | botão de destaque (texto escuro)                                 |
| Branco sobre `#E8731A`          | **3,0** | ❌ não usar                                                      |
| Branco sobre `#1F6496`          | 6,3     | botão secundário (azul)                                          |
| Branco sobre `#7A4E9E`          | 6,2     | estado Dominado                                                  |

⚠ `theme_color #2e9e5b` já presente no manifesto serve para a barra do navegador; **não** serve como fundo de texto branco pequeno.

## Daltonismo

- Nada é comunicado **só por cor**. Os 5 estados dos fatos (Novo, Aprendendo, Praticando, Fluente, Dominado) combinam **cor + forma + rótulo**: círculo vazio · semente · broto · folha · flor/estrela (formas e cores em `art-bible.md`).
- Acerto/dica não usam vermelho × verde como único sinal; usam ícone e texto.
- Mapa da tabuada (painel): cada célula tem forma; legenda sempre visível.
- Verificar a paleta em simulação de deuteranopia, protanopia e tritanopia antes de fechar `art-bible.md`.

## Leitor de tela (TalkBack, VoiceOver)

- Todo controle tem nome acessível em pt-BR; imagens decorativas com `aria-hidden`, informativas com `alt`.
- Ordem de foco: pergunta → interação → teclado → ajuda → sair.
- Feedback anunciado em região `aria-live="polite"`: o acerto e a dica são lidos; **nada de som de fracasso nem de anúncio de "erro"**.
- O teclado numérico anuncia a tecla e o número digitado.
- Minijogos de arrastar (Monta-Grupos, Caixa do Mercadinho): alternativa **"tocar para pegar, tocar para soltar"**; o arrastar nunca é o único caminho.
- Ordem de leitura e gestos testados em aparelho real; o Playwright cobre rótulos e foco.

## Motor

Alvos ≥ 56 px, 12 px entre eles (`ui-rules.md`); sem gestos complexos, sem pressão longa obrigatória, sem tremor ou sacudir; nenhum limite de tempo para tocar.

## Leitura

- Narração opcional em voz alta (L310); o texto escrito continua sendo o protagonista.
- Texto escalável até 200% sem perda de função; espaçamento de linha ≥ 1,4; texto alinhado à esquerda; sem itálico em frases longas; sem MAIÚSCULAS em frases.
- Fonte sem serifa, arredondada, com letras bem distintas (Nunito) `[PROPOSTA]`.
- Opção "texto curto" `[PROPOSTA]`: o mesmo problema com menos palavras, para quem lê devagar.
- Números por extenso na narração (ver `audio-brief.md`).

## Cognitivo

Uma tarefa por tela; sem limite de tempo; pausa a qualquer momento, progresso sempre salvo; instruções repetidas de forma idêntica; sem mudanças inesperadas de tela.

## Som e movimento

- Todo som tem equivalente visual; modo mudo completo e por categoria.
- Sem luzes piscando mais de 3 vezes por segundo.
- `prefers-reduced-motion` troca movimento por fade ou quadro estático.

## Checklist por sprint

| Item                                    | Como verificar                                  |
| --------------------------------------- | ----------------------------------------------- |
| Contraste dos pares da paleta           | script de contraste, em CI quando houver tokens |
| Alvos ≥ 56 px, 12 px entre eles         | Playwright 360×740                              |
| Foco visível e ordem lógica             | Playwright                                      |
| Rótulos acessíveis                      | Playwright (`getByRole`)                        |
| Estados dos fatos distinguíveis sem cor | revisão visual com simulador de daltonismo      |
| TalkBack e VoiceOver                    | manual, aparelho real, por tela nova            |
| `prefers-reduced-motion`                | Playwright com `reducedMotion: 'reduce'`        |
| Narração e fallback sem voz pt-BR       | manual, iOS e Android                           |
