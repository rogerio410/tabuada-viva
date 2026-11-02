# Mapa de dados

Status: `[PROPOSTA]` para aprovação. Fonte: modelo de dados (`docs/00-fonte/tabuada-viva.md`, L346–360) e a seção "Privacidade e LGPD" (L366–376). Citamos a LGPD **apenas pelo art. 14**, como na fonte; qualquer parágrafo ou inciso está **não verificado** (L495). Este documento não é parecer jurídico.

## Princípios

1. **Coleta mínima** da criança: apelido, ano escolar e respostas do jogo (CLAUDE.md). Nada além.
2. **Só o adulto tem conta.** A criança entra pelo perfil criado por ele, sem login próprio.
3. **Local primeiro:** até o Sprint 4 tudo fica no aparelho (IndexedDB); a nuvem (Supabase) só existe depois do consentimento do responsável.
4. **Nenhum terceiro:** sem analytics, trackers, anúncios, CDNs ou fontes externas (`npm run check:trackers`, Fase D, Bloco 2).
5. **Nunca texto livre da criança** (resposta só por teclado numérico; Fábrica de Histórias com cartões pré-definidos).

## Entidades

Legenda de local: **L** = IndexedDB no aparelho · **N** = Supabase (nuvem, a partir do Sprint 4).

### Adulto

| Entidade / campo                      | Finalidade                          | Local | Quem vê                  | Retenção                                   |
| ------------------------------------- | ----------------------------------- | ----- | ------------------------ | ------------------------------------------ |
| `adult.id`                            | identificar a conta                 | N     | o próprio adulto         | enquanto a conta existir                   |
| `adult.email`                         | login (Supabase Auth)               | N     | o próprio adulto         | enquanto a conta existir                   |
| `adult.papel` (responsável/professor) | decidir o que o adulto pode ver     | N     | o próprio adulto         | enquanto a conta existir                   |
| `adult.pin` (hash, nunca o PIN)       | portão do painel (não autenticação) | L, N  | ninguém (só verificação) | enquanto a conta existir; trocado a pedido |

### Criança

| Entidade / campo                   | Finalidade                         | Local | Quem vê                                  | Retenção                 |
| ---------------------------------- | ---------------------------------- | ----- | ---------------------------------------- | ------------------------ |
| `child_profile.id`                 | ligar os dados à criança           | L, N  | responsável; professor se houver vínculo | até o responsável apagar |
| `child_profile.apelido`            | chamar a criança no jogo           | L, N  | idem                                     | idem                     |
| `child_profile.avatar`             | personalização (item pré-definido) | L, N  | idem                                     | idem                     |
| `child_profile.ano_escolar`        | escolher o ponto de partida        | L, N  | idem                                     | idem                     |
| `child_profile.adulto_responsavel` | vincular ao responsável            | N     | responsável                              | idem                     |

Sem sobrenome, foto, e-mail, telefone, endereço, localização, escola da criança ou qualquer identificador de aparelho.

### Aprendizagem

| Entidade / campo                                                                                              | Finalidade                       | Local | Quem vê                                  | Retenção             |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----- | ---------------------------------------- | -------------------- |
| `fact_state`: estado, `proxima_revisao`, acertos, erros, `tempo_mediano`, `streak`, `fastDays`                | repetição espaçada, painel       | L, N  | responsável; professor se houver vínculo | até apagar a criança |
| `attempt`: item, resposta, correta, `tempo_ms`, `apoio_usado`, `tipo_de_erro`, `criado_em`, `phaseId`, `kind` | motor pedagógico, painel, Portão | L, N  | idem                                     | idem                 |
| `session`: início, fim, nº de itens, acerto                                                                   | constância, resumo da semana     | L, N  | idem                                     | idem                 |
| `reward_wallet`: cajus, cofrinho, estrelas, figurinhas                                                        | recompensas                      | L, N  | idem                                     | idem                 |

Observações:

- `tempo_ms` e `tempo_mediano` são **dado para o adulto**; nunca aparecem para a criança (`docs/gdd/pilares-e-regras.md`).
- `phaseId` e `kind` foram acrescentados pela spec do Sprint 1 (critérios G3 a G6 do Portão). Não identificam a criança.
- Não há nome de sessão, geolocalização, user agent nem IP guardado em nenhuma tabela de aprendizagem.

### Turma (opcional)

| Entidade / campo                                                      | Finalidade         | Local | Quem vê                         | Retenção                                      |
| --------------------------------------------------------------------- | ------------------ | ----- | ------------------------------- | --------------------------------------------- |
| `class_group`: nome, professor, escola                                | agrupar alunos     | N     | professor                       | até o professor apagar a turma                |
| `class_membership`: turma, criança, `autorizado_por`, `autorizado_em` | vínculo autorizado | N     | responsável; professor da turma | até o responsável revogar ou apagar a criança |

O professor **só** vê a criança depois do vínculo autorizado pelo responsável da criança (L353, L373). Revogar o vínculo corta o acesso na hora.

### Consentimento

| Entidade / campo                                         | Finalidade             | Local | Quem vê     | Retenção                                                                        |
| -------------------------------------------------------- | ---------------------- | ----- | ----------- | ------------------------------------------------------------------------------- |
| `consent`: adulto, criança, `terms_version`, `aceito_em` | prova do consentimento | N     | responsável | **ver `retencao-e-apagamento.md`** (guardar a prova ≠ guardar dados da criança) |

Observações sobre o perfil:

- O perfil (apelido, avatar, ano escolar) é criado **antes** do aceite do termo, porque a prova do consentimento aponta para ele. Nenhum dado de **aprendizagem** é gravado antes do aceite (o banco recusa). Perfil sem aceite por muito tempo: limpeza automática fica para o Sprint 4 (a decidir).
- O professor, com vínculo vigente, enxerga a linha inteira do perfil, inclusive o identificador opaco do responsável e a data de criação. Reduzir isso (visão própria do professor) fica para o Sprint 9.
- `adult.role` é declarado pelo próprio adulto no cadastro; antes de produção é preciso validar o papel de professor (convite ou aprovação). O que o professor vê já depende do aceite do responsável.

## O que **não** é coletado

Nome completo da criança · foto ou voz · localização · e-mail, telefone ou endereço da criança · nome da escola da criança · texto livre de qualquer tipo · identificadores de publicidade · cookies de terceiros · endereço IP guardado **nas nossas tabelas** (o provedor de login e de hospedagem podem registrar IP e aparelho do **adulto** nos próprios logs: conferir e minimizar na configuração do projeto, **não verificado**) · mapa de toques, gravação de tela ou qualquer telemetria de comportamento fora das respostas do jogo.

Para o adulto responsável pela conta: apenas o e-mail do login e o papel.

## Quem acessa o quê

| Papel                 | Vê                                                         | Altera                         |
| --------------------- | ---------------------------------------------------------- | ------------------------------ |
| Criança (no aparelho) | o próprio jogo; nunca critérios do Portão, tempo ou painel | respostas do jogo              |
| Responsável           | seus filhos: aprendizagem, painel, vínculos                | perfil, vínculos, apagar dados |
| Professor             | só crianças com vínculo autorizado e vigente               | nada nos dados da criança      |
| Operador do serviço   | metadados técnicos mínimos do provedor (ver política)      | —                              |

A prova disso é automática: `npm run test:db` (`supabase/tests/`).

Tabelas técnicas sem dado da criança: `app_config` (versão do termo, limites do PIN), `pin_guard` (falhas e bloqueio do PIN do adulto) e `class_group.invite_code` (código de convite da turma).

## Transferência e armazenamento

- Hoje: só no aparelho.
- Sprint 4 em diante: Supabase (Postgres). **Região do projeto e contrato do provedor: a definir pelo responsável** antes de qualquer dado real. Hospedagem do front: Vercel (arquivos estáticos; sem dados da criança).
- Registros de acesso do provedor (IP, user agent) existem por padrão em muitos serviços: conferir e desligar ou minimizar na configuração do projeto. **Não verificado.**

## Pontos que dependem do responsável

- Região e provedor da nuvem; quem é o **controlador** e o contato de privacidade (em branco por decisão sua).
- Retenção por inatividade (D21).
- Texto do termo e da política (Bloco 5, 100% revisão humana; revisão jurídica recomendada).
