// Aplica as migrações do Supabase em um banco temporário de um Postgres local (com o schema `auth` simulado)
// e roda supabase/tests/*.test.sql. Falha de forma ruidosa se não houver Postgres: nada de pular em silêncio.
// Conexão: variáveis PG* (padrões: localhost:5432, usuário postgres). A senha nunca fica neste arquivo.
// No CI o serviço é descartável e sem senha: PG_NO_PASSWORD=1.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { SECURITY } from '../src/domain/config/security.ts'

// Credenciais só por ambiente: variáveis PG*, ~/.pgpass (PGPASSFILE) ou um .env.local fora do git.
// Nenhuma senha mora neste arquivo.
try {
  process.loadEnvFile('.env.local')
} catch {}
const env = {
  ...process.env,
  PGHOST: process.env.PGHOST ?? 'localhost',
  PGPORT: process.env.PGPORT ?? '5432',
  PGUSER: process.env.PGUSER ?? 'postgres',
}
if (
  env.PG_NO_PASSWORD !== '1' &&
  !env.PGPASSWORD &&
  !env.PGPASSFILE &&
  !existsSync(join(homedir(), '.pgpass'))
) {
  console.error(
    '✗ Sem senha do Postgres. Defina PGPASSWORD (ou use ~/.pgpass), ou crie um .env.local (ignorado pelo git) a partir de .env.example.',
  )
  process.exit(1)
}
const dbName = `tv_test_${process.pid}_${Date.now()}`

const psql = (args, opts = {}) =>
  execFileSync('psql', ['-X', '-q', '-v', 'ON_ERROR_STOP=1', ...args], {
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  })

function fail(message, detail) {
  console.error(`✗ ${message}`)
  if (detail) console.error(detail)
  process.exitCode = 1
}

try {
  psql(['-d', 'postgres', '-Atc', 'select 1'])
} catch (e) {
  console.error(
    `✗ Não consegui falar com o Postgres em ${env.PGHOST}:${env.PGPORT} (usuário ${env.PGUSER}).\n` +
      '  Suba um Postgres 15+ local e confira PGHOST, PGPORT, PGUSER e a senha (veja .env.example).\n' +
      String(e.stderr ?? e.message),
  )
  process.exit(1)
}

const sqlFiles = (dir, test) =>
  readdirSync(dir)
    .filter((f) => test.test(f))
    .sort()
    .map((f) => join(dir, f))

const setup = [
  ...sqlFiles('supabase/tests', /^0\d_.*\.sql$/).slice(0, 1), // 00_auth_stub
  ...sqlFiles('supabase/migrations', /\.sql$/),
  ...sqlFiles('supabase/tests', /^0\d_.*\.sql$/).slice(1), // 01_helpers (depois do schema público)
]
const tests = sqlFiles('supabase/tests', /\.test\.sql$/)

try {
  psql(['-d', 'postgres', '-c', `create database "${dbName}"`])
  const run = (file) => psql(['-d', dbName, '-f', file])

  for (const f of setup) {
    try {
      run(f)
    } catch (e) {
      throw Object.assign(new Error(`falha ao aplicar ${f}`), { detail: e.stderr })
    }
  }
  console.log(
    `✓ ${setup.length} arquivos de preparação aplicados (auth simulado, migrações, utilitários)`,
  )

  // Os valores de segurança do SQL têm de ser os do domínio (D22, provisórios).
  const cfg = Object.fromEntries(
    psql([
      '-d',
      dbName,
      '-At',
      '-F',
      '=',
      '-c',
      "select key, value from public.app_config where key like 'pin_%'",
    ])
      .trim()
      .split('\n')
      .map((l) => l.split('=')),
  )
  const want = {
    pin_max_failures: String(SECURITY.pin.maxFailures),
    pin_base_lock_seconds: String(SECURITY.pin.baseLockMs / 1000),
    pin_max_lock_seconds: String(SECURITY.pin.maxLockMs / 1000),
  }
  for (const [k, v] of Object.entries(want))
    if (cfg[k] !== v)
      throw Object.assign(new Error(`app_config.${k} = ${cfg[k]}, mas security.ts diz ${v}`), {})
  console.log('✓ app_config do PIN igual a src/domain/config/security.ts')

  for (const f of tests) {
    try {
      run(f)
      console.log(`✓ ${f.split('/').pop()}`)
    } catch (e) {
      throw Object.assign(new Error(`teste falhou: ${f}`), { detail: e.stderr })
    }
  }
  console.log(`✓ ${tests.length} arquivos de teste de banco passaram`)
} catch (e) {
  fail(e.message, e.detail)
} finally {
  try {
    psql(['-d', 'postgres', '-c', `drop database if exists "${dbName}" with (force)`])
  } catch {}
}
