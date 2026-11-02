import { describe, expect, it } from 'vitest'
import { scanBuilt, scanClientSource, scanPath, scanText } from './lib/secret-rules.mjs'

// Valores falsos montados em tempo de execução, para este arquivo não disparar o próprio scanner.
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (role: string) => `eyJ${b64({ alg: 'HS256' })}.${b64({ role })}.${'a'.repeat(20)}`
const rules = (v: Array<{ rule: string }>) => v.map((x) => x.rule)

describe('scanText', () => {
  it('pega chaves privadas e tokens conhecidos', () => {
    expect(rules(scanText('a.txt', '-----BEGIN ' + 'PRIVATE KEY-----'))).toContain('chave-privada')
    expect(rules(scanText('a.txt', 'k=' + 'AKIA' + 'ABCDEFGHIJKLMNOP'))).toContain('aws-access-key')
    expect(rules(scanText('a.txt', 'ghp_' + 'a'.repeat(36)))).toContain('github-token')
    expect(rules(scanText('a.txt', 'sk_' + 'live_' + 'a'.repeat(20)))).toContain(
      'stripe-chave-secreta',
    )
  })

  it('distingue o JWT de service_role (grave) de qualquer outro JWT no código', () => {
    expect(rules(scanText('a.ts', `const k = "${jwt('service_role')}"`))).toContain(
      'supabase-service-role',
    )
    expect(rules(scanText('a.ts', `const k = "${jwt('anon')}"`))).toEqual(['jwt'])
  })

  it('pega senha em URL de conexão, mas aceita placeholder', () => {
    expect(rules(scanText('a.ts', 'postgres://app:' + 'S3nh4Real9@host/db'))).toContain(
      'senha-em-url',
    )
    expect(scanText('a.ts', 'postgres://app:<senha>@host/db')).toEqual([])
    expect(scanText('a.ts', 'postgres://app:${PGPASSWORD}@host/db')).toEqual([])
  })

  it('pega literal em nome sensível e VARIAVEL=valor, mas aceita env e placeholder', () => {
    expect(rules(scanText('a.ts', 'const password = "' + 'hunter2hunter2"'))).toContain(
      'senha-literal',
    )
    expect(rules(scanText('a.yml', '  POSTGRES_' + 'PASSWORD: postgres'))).toContain(
      'segredo-em-variavel',
    )
    expect(rules(scanText('.env.x', 'API_' + 'TOKEN=abc123def456'))).toContain(
      'segredo-em-variavel',
    )
    expect(scanText('a.yml', '  POSTGRES_PASSWORD: ci-${{ github.run_id }}')).toEqual([])
    expect(scanText('a.ts', 'const password = process.env.PGPASSWORD')).toEqual([])
    expect(scanText('.env.example', 'PGPASSWORD=')).toEqual([])
    expect(scanText('.env.example', 'PGPASSWORD=<sua-senha-local>')).toEqual([])
  })

  it('respeita secret-scan: ignore na linha', () => {
    expect(scanText('a.yml', 'POSTGRES_' + 'PASSWORD: postgres # secret-scan: ignore')).toEqual([])
  })

  it('texto comum passa', () => {
    expect(
      scanText('a.md', 'O PIN nunca é guardado em texto puro. Use PGPASSWORD no ambiente.'),
    ).toEqual([])
  })
})

describe('scanPath', () => {
  it('barra .env e chaves versionadas; aceita .env.example', () => {
    expect(rules(scanPath('.env'))).toContain('arquivo-env')
    expect(rules(scanPath('.env.local'))).toContain('arquivo-env')
    expect(rules(scanPath('config/.env.production'))).toContain('arquivo-env')
    expect(rules(scanPath('deploy/server.pem'))).toContain('arquivo-de-credencial')
    expect(scanPath('.env.example')).toEqual([])
    expect(scanPath('src/environment.ts')).toEqual([])
  })
})

describe('scanClientSource', () => {
  it('só variáveis VITE_ públicas e nunca service_role no cliente', () => {
    expect(scanClientSource('a.ts', 'import.meta.env.VITE_SUPABASE_URL')).toEqual([])
    expect(rules(scanClientSource('a.ts', 'import.meta.env.VITE_SECRET_X'))).toContain(
      'vite-var-nao-permitida',
    )
    expect(rules(scanClientSource('a.ts', 'const k = SERVICE_ROLE_KEY'))).toContain(
      'service-role-no-cliente',
    )
  })
})

describe('scanBuilt', () => {
  it('nada de service_role nem credenciais no bundle', () => {
    expect(rules(scanBuilt('dist/a.js', 'x="service_role"'))).toContain('service-role-no-build')
    expect(rules(scanBuilt('dist/a.js', 'ghp_' + 'b'.repeat(36)))).toContain('github-token')
    expect(scanBuilt('dist/a.js', 'var a=1')).toEqual([])
  })
})
