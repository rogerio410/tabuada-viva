# Retenção e direito de apagar

Status: `[PROPOSTA]` para aprovação (decisão **D21** em `docs/gdd/decisoes-abertas.md`). O botão "apagar todos os dados da criança" é exigência da fonte (L374); o prazo por inatividade é proposta nova. Sem parecer jurídico; LGPD só pelo art. 14, demais referências **não verificadas**.

## Regra geral

Os dados da criança existem **para o adulto acompanhar e para o jogo funcionar**. Quando isso acaba, eles acabam. O responsável pode apagar tudo quando quiser, sem justificativa e sem custo.

## Apagar todos os dados da criança (ação do responsável)

Quem pede: responsável, no painel, atrás do PIN e com confirmação explícita ("isso não pode ser desfeito").

| Passo | Onde             | O que acontece                                                                                                                                                                                                                              |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | aparelho         | `deleteByChild(childId)` nos 4 repositórios locais: `FactStateRepo`, `AttemptRepo`, `SessionRepo`, `WalletRepo` (existem desde a Fase C) e no perfil local                                                                                  |
| 2     | nuvem (Sprint 4) | RPC `delete_child_data(child_id)`: apaga em cascata `fact_state`, `attempt`, `session`, `reward_wallet`, `class_membership` e `child_profile` (`supabase/migrations/0004_delete_child.sql`, testada em `supabase/tests/60_delete.test.sql`) |
| 3     | outros aparelhos | na próxima sincronização o aparelho recebe a ordem e apaga o que tiver local; **conflito**: apagar vence sempre                                                                                                                             |
| 4     | confirmação      | a tela mostra quantas linhas foram apagadas por tabela (a RPC devolve a contagem); nada de dado da criança no recibo                                                                                                                        |

O que **não** se recupera: tudo acima. Não há lixeira, backup de dados da criança sob demanda nem exportação depois do apagamento. Antes de apagar, o painel oferece o relatório em PDF (L298) para o adulto guardar, **por escolha dele**.

## O que sobra depois de apagar

- **Nada que identifique a criança**: nem apelido, nem respostas, nem vínculos.
- **Prova do consentimento** (`consent`): guarda adulto, versão do termo e data, **sem** apelido nem respostas. Quando só a **criança** é apagada, a linha fica sem `child_id` e **permanece enquanto a conta do adulto existir**. Quando a **conta do adulto** é apagada, a prova some junto (cascata): o modelo atual **não** guarda prova por 5 anos depois disso. Guardar além da conta exigiria uma tabela de arquivo e uma base legal: **decisão sua (D21)**; juridicamente **não verificado**.
- Logs técnicos do provedor: fora do nosso controle direto; ver "Pontos abertos".

## Apagar a conta do adulto

Função `delete_my_account()` (`supabase/migrations/0004_delete_child.sql`, testada em `60_delete.test.sql`): apaga o login, o adulto, o PIN (hash), as turmas dele e **todas** as crianças dele com tudo delas, **inclusive as provas de consentimento dele**. Se o adulto é professor, as turmas somem e os vínculos são desfeitos; as crianças continuam com seus responsáveis. Conferir no Sprint 4 que o papel dono da função consegue apagar em `auth.users` no projeto real.

## Revogar um vínculo de turma

O responsável revoga a qualquer momento: o professor perde o acesso imediatamente (`class_membership` apagado ou marcado como revogado). Os dados da criança **não** são apagados por isso.

## Retenção por inatividade `[PROPOSTA D21]`

| Situação                                            | Proposta                                                                                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Conta sem nenhuma prática ou login por **12 meses** | aviso ao e-mail do responsável (30 dias antes), depois **apagar** os dados da criança                                                   |
| Resposta do responsável ao aviso                    | "manter" reinicia a contagem; "apagar" executa na hora                                                                                  |
| Prova de consentimento                              | hoje: enquanto a conta do adulto existir. Guardar por **5 anos** depois exigiria uma tabela de arquivo `[não verificado juridicamente]` |

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
