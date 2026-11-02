# Retenção e direito de apagar

Status: `[PROPOSTA]` para aprovação (decisão **D21** em `docs/gdd/decisoes-abertas.md`). O botão "apagar todos os dados da criança" é exigência da fonte (L374); o prazo por inatividade é proposta nova. Sem parecer jurídico; LGPD só pelo art. 14, demais referências **não verificadas**.

## Regra geral

Os dados da criança existem **para o adulto acompanhar e para o jogo funcionar**. Quando isso acaba, eles acabam. O responsável pode apagar tudo quando quiser, sem justificativa e sem custo.

## Apagar todos os dados da criança (ação do responsável)

Quem pede: responsável, no painel, atrás do PIN e com confirmação explícita ("isso não pode ser desfeito").

| Passo | Onde             | O que acontece                                                                                                                                                  |
| ----- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | aparelho         | `deleteByChild(childId)` nos 4 repositórios locais: `FactStateRepo`, `AttemptRepo`, `SessionRepo`, `WalletRepo` (existem desde a Fase C) e no perfil local      |
| 2     | nuvem (Sprint 4) | RPC `delete_child_data(child_id)`: apaga em cascata `fact_state`, `attempt`, `session`, `reward_wallet`, `class_membership` e `child_profile` (Fase D, Bloco 4) |
| 3     | outros aparelhos | na próxima sincronização o aparelho recebe a ordem e apaga o que tiver local; **conflito**: apagar vence sempre                                                 |
| 4     | confirmação      | a tela mostra quantas linhas foram apagadas por tabela (a RPC devolve a contagem); nada de dado da criança no recibo                                            |

O que **não** se recupera: tudo acima. Não há lixeira, backup de dados da criança sob demanda nem exportação depois do apagamento. Antes de apagar, o painel oferece o relatório em PDF (L298) para o adulto guardar, **por escolha dele**.

## O que sobra depois de apagar

- **Nada que identifique a criança**: nem apelido, nem respostas, nem vínculos.
- **Prova do consentimento** (`consent`): guarda adulto, versão do termo e data, **sem** apelido nem respostas, para o serviço provar que pediu autorização. Quando a criança é apagada, a linha deixa de apontar para o perfil (`child_id` anulado). **Prazo de guarda da prova: `[PROPOSTA D21]`.** Decisão jurídica: **não verificado** se é obrigatório guardar e por quanto tempo.
- Logs técnicos do provedor: fora do nosso controle direto; ver "Pontos abertos".

## Apagar a conta do adulto

Apaga o adulto, seus PIN/hash e **todas** as crianças dele (mesmo fluxo acima por criança). Se o adulto é professor, as turmas somem e os vínculos são desfeitos; as crianças continuam com seus responsáveis.

## Revogar um vínculo de turma

O responsável revoga a qualquer momento: o professor perde o acesso imediatamente (`class_membership` apagado ou marcado como revogado). Os dados da criança **não** são apagados por isso.

## Retenção por inatividade `[PROPOSTA D21]`

| Situação                                            | Proposta                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Conta sem nenhuma prática ou login por **12 meses** | aviso ao e-mail do responsável (30 dias antes), depois **apagar** os dados da criança |
| Resposta do responsável ao aviso                    | "manter" reinicia a contagem; "apagar" executa na hora                                |
| Prova de consentimento                              | guardada por **5 anos** após o apagamento `[não verificado juridicamente]`            |

Os números 12 meses e 5 anos são **propostas da IA** para você ajustar. Nada é implementado até a aprovação: o apagamento por inatividade exige um e-mail transacional e uma rotina agendada, então só entra com o Sprint 4 ou depois.

## Dados no aparelho

- O jogo **não** envia nada para fora do aparelho antes do consentimento e da conta (Sprint 4).
- Apagar dados do site no navegador apaga o IndexedDB; o jogo avisa o adulto, nunca a criança.
- Compartilhar o aparelho: o perfil da criança fica atrás do perfil local; o painel fica atrás do PIN.

## Testes que provam

- **Local:** teste de contrato dos repositórios (`repo.contract.ts`) já cobre `deleteByChild` por criança.
- **Nuvem:** teste SQL do Bloco 4: apagar remove tudo da criança, nada de outra, e só o responsável consegue chamar a RPC.
- **E2E (Sprint 8):** o painel mostra o resumo do apagamento.

## Pontos abertos

- Região e provedor da nuvem; logs de acesso do provedor (retenção, desligar ou minimizar). **Não verificado.**
- Prazos jurídicos da prova de consentimento.
- Quem é o controlador e o contato para pedidos de titulares (campo em branco no termo; Bloco 5).
