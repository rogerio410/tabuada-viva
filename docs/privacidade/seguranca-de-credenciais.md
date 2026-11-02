# Segurança de credenciais e dados sensíveis

Status: `[PROPOSTA]` técnica (as configurações do Supabase Auth abaixo só se aplicam quando o projeto existir, Sprint 4). Nada aqui é parecer jurídico. Prova automática de cada regra: coluna "Como é garantido".

## Classificação

| Dado                             | Sensibilidade                       | Onde mora                                            | Regra                                                    |
| -------------------------------- | ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Senha do adulto                  | **crítica**                         | só no Supabase Auth (hash)                           | nunca passa pelo nosso código, banco ou log              |
| PIN do adulto                    | alta (portão, não autenticação)     | `adult.pin_hash` (bcrypt); local: hash PBKDF2        | nunca em texto puro; cliente nunca lê o hash             |
| Chave `service_role` do Supabase | **crítica** (ignora o RLS)          | só no painel do provedor e em segredo de CI/servidor | **nunca** no repositório, no front nem em `VITE_*`       |
| Chave `anon`, URL do Supabase    | pública por desenho                 | variáveis `VITE_*` na Vercel                         | segurança vem do RLS, não do sigilo da chave             |
| Senha do Postgres local/CI       | média                               | ambiente (`PGPASSWORD`, `.env.local`, segredo do CI) | nunca em arquivo versionado                              |
| Dados da criança                 | alta (menor de idade, LGPD art. 14) | aparelho e Supabase                                  | coleta mínima, RLS, apagar a pedido (`mapa-de-dados.md`) |

## Regras e como são garantidas

| Regra                                                             | Como é garantido                                                                                                                                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nenhum segredo no repositório, no histórico novo nem no build     | `npm run check:secrets` (verify e pre-commit): chaves privadas, tokens, JWT, senha em URL, `VAR_SENSIVEL=valor`, arquivos `.env*`/`.pem`/`.pgpass`; testes em `scripts/check-secrets.test.ts` |
| `service_role` nunca vai para o cliente                           | o mesmo scanner barra `service_role` em `src/` e em `dist/`, e só aceita `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`                                                                       |
| `.env*` fora do git (só `.env.example`)                           | `.gitignore` + `scanPath` do scanner                                                                                                                                                          |
| Senha de banco fora do código                                     | `scripts/test-db.mjs` só lê de `PGPASSWORD`, `~/.pgpass` ou `.env.local`; o CI gera uma senha por execução (`ci-<run_id>-<tentativa>`)                                                        |
| PIN com hash forte no servidor, comparação sem revelar existência | bcrypt custo 10 (`0003_pin.sql`), resposta de mesmo formato, hash fictício quando não há PIN; `supabase/tests/50_pin.test.sql`                                                                |
| PIN: limite de tentativas e troca só com o PIN atual              | `verify_adult_pin`, `set_adult_pin`; `pin-guard.ts` no aparelho                                                                                                                               |
| Nada de dado pessoal em log do navegador                          | oxlint `no-console` como **erro** em `src/` (testes e scripts ficam fora)                                                                                                                     |
| Dependências sem vulnerabilidade conhecida de severidade alta     | `npm audit --omit=dev --audit-level=high` no CI                                                                                                                                               |
| Cliente nunca lê `pin_hash` nem `pin_guard`                       | grants por coluna e RLS sem policy; `supabase/tests/10_rls_coverage.test.sql`                                                                                                                 |

## Para o Sprint 4 (quando houver login e PIN local)

- **Senha do adulto:** não implementar login próprio; só Supabase Auth. Configurar no projeto: senha com pelo menos 10 caracteres; proteção contra senhas vazadas (se o plano permitir); confirmação de e-mail obrigatória; cadastro anônimo desligado; limites de taxa ativos; validade curta do token de acesso; lista fechada de URLs de redirecionamento; MFA recomendado para professores. **Não verificado**: confira cada opção no painel do projeto.
- **PIN local (offline):** derivar com PBKDF2-SHA256 pela WebCrypto, sal aleatório por aparelho, **pelo menos 600 000 iterações** `[não verificado: confira a recomendação atual da OWASP]`, comparação em tempo constante; guardar só o hash no Dexie. O PIN nunca vai para `localStorage`, URL, log ou analytics.
- **Dados da criança no aparelho:** IndexedDB não é criptografado. É aceito porque o conteúdo é só apelido, ano escolar e respostas, e o aparelho é do responsável; não guarde nada mais sensível. Apagar dados do navegador apaga tudo.
- **Chaves e segredos de servidor:** `service_role` e quaisquer segredos só em segredos do provedor (Vercel/GitHub), nunca em `VITE_*`. Funções que precisem dela rodam no servidor (Edge Function), nunca no navegador.
- **Logs do provedor:** conferir se registram IP e user agent do adulto e reduzir a retenção ao mínimo. Ativar registro (audit) só com finalidade definida.

## Se uma chave vazar

1. **Revogue/rotacione agora** no provedor (a chave vazada é considerada comprometida mesmo depois de apagada do git).
2. Troque a variável na Vercel/CI e faça novo deploy.
3. Revise os logs de acesso do período.
4. Não reescreva o histórico como única medida: rotacionar é obrigatório, limpar é complemento.
5. Se houver dado da criança exposto, avise o responsável pelo tratamento para avaliar a comunicação devida `[prazos e deveres legais: não verificados, consulte o jurídico]`.
