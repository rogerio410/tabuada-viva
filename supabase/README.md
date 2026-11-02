# Supabase

Modelo de dados, RLS e funções do Tabuada Viva, em SQL puro compatível com o Supabase. **Ainda não há projeto Supabase**: o app só passa a falar com a nuvem no Sprint 4, depois do consentimento (Fase D).

| Arquivo                            | O que faz                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `migrations/0001_schema.sql`       | tabelas, restrições e `app_config` (versão do termo e limites do PIN, valores provisórios da D22) |
| `migrations/0002_rls.sql`          | privilégios fechados por padrão, RLS em todas as tabelas, policies e funções auxiliares           |
| `migrations/0003_pin.sql`          | `set_adult_pin` e `verify_adult_pin` (bcrypt, limite de tentativas, bloqueio crescente)           |
| `migrations/0004_delete_child.sql` | `delete_child_data`: apaga tudo da criança e devolve a contagem                                   |
| `tests/*.sql`                      | schema `auth` simulado, utilitários e os testes (`*.test.sql`)                                    |

## Regras que o banco garante

- Responsável só acessa os próprios filhos; professor só lê criança com vínculo **vigente** e **autorizado pelo responsável da criança**; professor nunca escreve.
- Sem consentimento da versão vigente do termo, nenhum dado de aprendizagem é gravado. `consent` é append-only.
- `attempt` é append-only. Não há delete direto de criança: apagar passa por `delete_child_data`.
- `pin_hash` e `pin_guard` nunca são legíveis pelo cliente.
- O vínculo de turma só nasce por `authorize_class_membership(criança, código)`.

## Testar

```sh
npm run test:db
```

Cria um banco temporário no Postgres indicado por `PGHOST`, `PGPORT` (padrões `localhost` e `5432`) e `PGUSER` (padrão `postgres`). **A senha nunca fica no repositório**: use `PGPASSWORD` no ambiente, `~/.pgpass` ou um `.env.local` (ignorado pelo git, modelo em `.env.example`). Aplica tudo, roda os testes e apaga o banco. Falha de forma ruidosa se não houver Postgres. Roda na CI (job `db`), não no `npm run verify`.

O `auth.uid()` do teste é simulado (`request.jwt.claim.sub`), como o Supabase faz. Conferir contra um projeto Supabase real fica para o Sprint 4.

## Riscos conhecidos (a tratar até o Sprint 4/9)

- **Papel de professor é auto-declarado** no cadastro (`adult.role`); validar por convite ou aprovação antes de produção.
- O professor vê a linha inteira de `child_profile` (inclui `guardian_id`, opaco, e `created_at`); uma visão própria resolve (Sprint 9).
- `authorize_class_membership` não limita tentativas de código (16 hex = 64 bits, sem expiração); reforçar quando a tela existir.
- As funções auxiliares (`is_guardian_of`, `has_current_consent`...) são executáveis pelo cliente com qualquer uuid; avaliar torná-las internas ao conferir contra o Supabase real.
- O cliente grava `reward_wallet` e `fact_state` sem limite de valor: a economia é decisão humana (D15); a validação por regra entra com o Sprint 7.
- Os `default privileges` do Supabase concedem acesso a tabelas novas; o teste `10_rls_coverage` é o portão (RLS ligado e `anon` barrado em todas) e roda na CI.
- Quem tenta o PIN de um adulto que **não** tem PIN também consome o limite (comportamento aceito).
