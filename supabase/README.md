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

Cria um banco temporário no Postgres indicado por `PGHOST`, `PGPORT`, `PGUSER` e `PGPASSWORD` (padrão local: `localhost:5432`, `postgres`/`postgres`, só para desenvolvimento), aplica tudo, roda os testes e apaga o banco. Falha de forma ruidosa se não houver Postgres. Roda na CI (job `db`), não no `npm run verify`.

O `auth.uid()` do teste é simulado (`request.jwt.claim.sub`), como o Supabase faz. Conferir contra um projeto Supabase real fica para o Sprint 4.
