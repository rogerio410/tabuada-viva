# Política de privacidade — versão v1

> **[RASCUNHO — revisão 100% humana + jurídica]** Escrito pela IA só como estrutura. Não entra no app nem no site antes da sua reescrita e aprovação. Não é parecer jurídico. LGPD citada apenas pelo art. 14; o resto está **não verificado**. Campos `[EM BRANCO]` são seus. Esta política é para o **adulto**, então pode ter links (a área da criança nunca tem).

Status: rascunho · Base: `docs/privacidade/mapa-de-dados.md` e `retencao-e-apagamento.md`.

## Estrutura sugerida

1. **Quem somos e como falar com a gente** — `[EM BRANCO: controlador, e-mail de privacidade]`.
2. **O que o Tabuada Viva é** — jogo para crianças de 7 e 8 anos aprenderem as tabuadas; só o adulto tem conta.
3. **Dados que tratamos** — tabela resumida do `mapa-de-dados.md`: adulto (e-mail, papel, PIN em hash); criança (apelido, avatar, ano escolar); aprendizagem (respostas, tempo, uso de ajuda, estados dos fatos, sessões, prêmios); turma (vínculo autorizado); consentimento.
4. **Dados que não tratamos** — lista do `mapa-de-dados.md`.
5. **Para que usamos** — escolher exercícios, mostrar progresso ao adulto, manter o login. Nada de publicidade, perfil comercial ou venda.
6. **Quem acessa** — responsável; professor só com vínculo autorizado e vigente; nós, só o necessário para manter o serviço.
7. **Com quem compartilhamos** — provedores técnicos: hospedagem do site (Vercel) e banco de dados (Supabase, região `[EM BRANCO]`). Nenhum analytics, anúncio ou rastreador de terceiros. **Conferir** o que cada provedor registra por padrão (por exemplo, endereço IP em logs de acesso) e como minimizar: **não verificado**.
8. **Onde os dados ficam e por quanto tempo** — aparelho e nuvem; prazos de `retencao-e-apagamento.md` (D21, `[PROPOSTA]`).
9. **Seus direitos e como exercê-los** — ver, corrigir, apagar, retirar o consentimento, revogar vínculo de turma; botão no painel; contato. **Lista de direitos conforme a lei: a verificar com o jurídico.**
10. **Segurança** — o que já é verdade e testado: tudo por HTTPS na hospedagem; CSP restritiva; PIN com limite de tentativas; isolamento por família no banco (testes automáticos); PIN guardado só como hash. **Não prometer** o que não está testado.
11. **Crianças** — consentimento do responsável (art. 14); a criança nunca cria conta nem digita texto livre.
12. **Mudanças nesta política** — versão e data; mudança relevante pede novo aceite (`consent.terms_version`).
13. **Data de vigência.**

## Afirmações que o texto final pode fazer (e a prova no repositório)

| Afirmação                                    | Prova                                                                |
| -------------------------------------------- | -------------------------------------------------------------------- |
| O jogo não carrega recursos de terceiros     | `npm run check:trackers`; `tests/e2e/privacy.spec.ts` (CSP)          |
| A criança não digita texto livre             | varredura de `src/ui` em `check:trackers`; e2e sem `input`           |
| Professor só vê criança autorizada e vigente | `supabase/tests/40_teacher.test.sql`                                 |
| Sem consentimento vigente nada é gravado     | `supabase/tests/30_consent.test.sql`                                 |
| Responsável apaga tudo da criança            | `supabase/tests/60_delete.test.sql`; `deleteByChild` local           |
| PIN com limite de tentativas                 | `src/domain/pin/pin-guard.test.ts`; `supabase/tests/50_pin.test.sql` |
| Sem anúncios, compras, chat ou ranking       | regras de `CLAUDE.md`; revisor de segurança infantil                 |

Qualquer frase da política **sem** linha nesta tabela precisa de prova ou sai do texto.
