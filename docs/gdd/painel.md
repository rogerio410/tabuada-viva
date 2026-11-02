# Painel de competências

Status: FIEL À FONTE (L271–298); lacunas sinalizadas. Código em `src/dashboard`, que não importa `src/ui`.

## Objetivo

Em 30 segundos, o adulto responde: o que ela já domina, onde está travando, o que fazer hoje (L273).

## Acesso

- Atrás de PIN de 4 dígitos do adulto, separado da tela da criança (L275).
- Professor vê a turma; responsável vê só os próprios filhos (L275). A visão de turma está no checklist (L461), mas a fonte só descreve telas individuais: **lacuna**, tratar em spec.
- ⚠ PIN de 4 dígitos é fraco contra força bruta: exigir limite de tentativas e bloqueio temporário (Fase D).

## Telas (L277–284)

1. **Resumo da semana:** minutos, dias de prática, fatos que passaram a Dominado, acerto médio, frase-síntese. Enquanto o Portão está fechado, mostra o progresso de cada critério (L286).
2. **Mapa da tabuada:** grade 10 × 10 por operação, célula colorida pelo estado. Cor **e** símbolo/forma (acessibilidade).
3. **Habilidades BNCC:** não iniciada, em desenvolvimento, consolidada, com evidências. Códigos só de `docs/pedagogia/bncc-mapa.md`.
4. **Problemas: leitura × cálculo:** escolha da operação separada do cálculo, por tipo e contexto.
5. **Fatos teimosos:** os 5 fatos com mais erros, o erro mais comum e a dica em uso.
6. **Para fazer em casa:** 2 sugestões fora da tela. Fonte do conteúdo: catálogo fechado revisado por humano `[lacuna]`.

## Indicadores (L290–296)

| Indicador                     | Cálculo                               | Nota                                         |
| ----------------------------- | ------------------------------------- | -------------------------------------------- |
| Fatos dominados               | Dominado ÷ total da operação          | total depende de D9                          |
| Acerto da sessão              | certas ÷ respostas                    | resposta com apoio contada à parte `[D4]`    |
| Tempo médio por fato          | mediana do tempo nos acertos          | só para adulto; nunca vai à criança          |
| Acerto na escolha da operação | acertos no "Qual Conta?" ÷ tentativas |                                              |
| Constância                    | dias com prática nos últimos 14       | 4 a 5 por semana basta                       |
| Taxa de uso de apoio por fato | derivada de `attempt.apoio_usado`     | fonte L286 pede; não é campo de `fact_state` |

## Linguagem

Sem rótulos sobre a criança ("fraca", "atrasada"); mostra fatos e habilidades, nunca nota única (L298). Exportar relatório em PDF (L298).

## Privacidade

Só apelido, ano escolar e respostas. Professor só vê alunos com `autorizado_por` e `autorizado_em` preenchidos (L353).

## Lacunas para spec

Visão de turma · conteúdo de "Para fazer em casa" · recuperação de PIN · sincronização offline e conflitos entre aparelhos.
