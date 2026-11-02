# Termo de consentimento — versão v1

> **[RASCUNHO — revisão 100% humana + jurídica]** Escrito pela IA só como ponto de partida. **Nenhuma linha deste arquivo entra no app** antes de você reescrever e aprovar (CLAUDE.md: textos de consentimento são 100% revisão humana). Não é parecer jurídico. A LGPD é citada **apenas pelo art. 14**, como na fonte (L368); qualquer parágrafo ou inciso está **não verificado**. Campos `[EM BRANCO]` são seus.

Status: rascunho · Versão do texto: `v1` (a mesma string de `app_config.current_terms_version`) · Idioma: pt-BR, frases curtas, para um adulto sem formação técnica.

## O que este termo precisa cobrir (checklist para a sua revisão)

- [ ] Quem é o responsável pelo tratamento e como falar com ele
- [ ] Quais dados da criança são usados (e quais **não**)
- [ ] Para que servem
- [ ] Quem pode ver (responsável, e professor só com a autorização do responsável)
- [ ] Onde ficam guardados e por quanto tempo
- [ ] Que não há anúncios, venda de dados, rastreadores nem compartilhamento com terceiros
- [ ] Como apagar tudo, a qualquer momento
- [ ] Como retirar o consentimento
- [ ] Que o consentimento é do responsável, para **esta** criança, e que mudar o texto pede um novo aceite
- [ ] Linguagem curta, em destaque, sem letra miúda (L372: "curto e destacado")

## Texto proposto (rascunho)

**Tabuada Viva — autorização do responsável**

Para a criança jogar, precisamos da sua autorização. Leia com calma. É curto.

**Quem cuida dos dados:** `[EM BRANCO: nome do controlador]`. Contato: `[EM BRANCO: e-mail de privacidade]`.

**O que guardamos sobre a criança**

- O apelido que você escolher.
- O ano escolar.
- As respostas que ela dá no jogo, o tempo de cada resposta e se ela usou ajuda (dedos, quadro de dez, reta).
- Os prêmios do jogo (cajus, estrelas, figurinhas).

**O que não guardamos:** nome completo, foto, voz, localização, telefone, endereço, escola da criança, nem nada que ela digite livremente. O jogo não tem anúncios, chat nem ranking.

**Para que usamos:** só para o jogo escolher o próximo exercício e para você ver o progresso da criança no painel. Não vendemos nem repassamos esses dados, e não usamos rastreadores de terceiros.

**Quem pode ver:** você. Um professor só vê a criança se **você** autorizar o vínculo com a turma, e você pode cancelar quando quiser.

**Onde ficam:** no aparelho e, depois que você criar a conta, em um serviço de nuvem `[EM BRANCO: provedor e região]`.

**Por quanto tempo:** até você apagar. Se a conta ficar parada por `[EM BRANCO: prazo, D21 propõe 12 meses]`, avisamos você antes de apagar.

**Seus direitos:** você pode ver, corrigir e **apagar todos os dados da criança** a qualquer momento `[EM BRANCO: o caminho exato — painel do adulto (Sprint 8) ou pedido ao contato; hoje o botão ainda não existe]`. Apagar não tem volta.

**O que fica depois de apagar:** somente o registro de que você aceitou este termo (a versão e a data), **sem** o apelido nem as respostas da criança. `[EM BRANCO: por quanto tempo; ver D21]`

**Retirar a autorização:** apague os dados da criança no painel ou fale com `[EM BRANCO: e-mail de privacidade]`.

☐ Eu sou o responsável por esta criança e autorizo o uso dos dados descritos acima. `(versão v1)`

## Contrato de versionamento (para o Sprint 4)

- O aceite grava uma linha em `consent` com `guardian_id`, `child_id`, `terms_version` e `accepted_at`. O banco **só aceita** a versão vigente (`current_terms_version()`) e a tabela é append-only (`supabase/tests/30_consent.test.sql`).
- Mudou o texto de forma relevante? Aumente a versão (`v2`) em `app_config`. Enquanto o responsável não aceitar de novo, o banco **bloqueia a escrita dos dados de aprendizagem** (respostas, estados dos fatos, sessões, prêmios); a leitura continua. O perfil (apelido e ano escolar) é criado antes do primeiro aceite, porque a prova de consentimento aponta para ele.
- A tela do aceite mostra o texto da versão vigente, em destaque, e o campo de aceite começa **desmarcado**.
- O texto exibido no app vem de um arquivo de conteúdo versionado, aprovado por você (não deste rascunho).

## Pendências que só você resolve

- Nome e contato do controlador; provedor e região da nuvem.
- Prazo de inatividade (D21) e a guarda da prova de consentimento.
- Revisão jurídica, inclusive a base legal e o que o art. 14 exige no seu caso. **Não verificado.**
- Texto para o professor (outro aceite, outro documento: Sprint 9).
