// Detecção de segredos e credenciais no repositório e no build. Regras puras, testadas em Vitest.
// Linha com `secret-scan: ignore` é ignorada (use só com justificativa).

const PLACEHOLDER =
  /^(\$|<|\{\{|\*+$|x{4,}|changeme|exemplo|example|senha|password|your|seu|sua|placeholder)/i

/** [nome, regex] aplicadas a texto de arquivo. */
const TEXT_RULES = [
  ['chave-privada', /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----/],
  ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['slack-token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['stripe-chave-secreta', /\b[sr]k_live_[A-Za-z0-9]{10,}/],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{35}\b/],
]

const JWT = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g
const CONN =
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqps?):\/\/([^\s:@/]+):([^\s@/]+)@/g
// literal entre aspas atribuído a nome sensível
const QUOTED =
  /\b[\w.-]*(?:password|passwd|pwd|secret|api[_-]?key|token|private[_-]?key)\w*\s*[:=]\s*["']([^"'\s]{8,})["']/gi
// VARIAVEL_SENSIVEL=valor (env, yaml) no começo da linha
const ENV_LINE =
  /^\s*[A-Z][A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|PRIVATE_KEY|SERVICE_ROLE_KEY|API_KEY)[A-Z0-9_]*\s*[:=]\s*(\S.*)$/

function decodeJwtPayload(jwt) {
  try {
    const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

/** Verifica o conteúdo de um arquivo de texto. */
export function scanText(file, text) {
  const out = []
  const lines = text.split('\n')
  const ignored = new Set(lines.flatMap((l, i) => (l.includes('secret-scan: ignore') ? [i] : [])))
  const lineOf = (index) => text.slice(0, index).split('\n').length - 1
  const add = (rule, index, detail) => {
    const line = lineOf(index)
    if (!ignored.has(line)) out.push({ file, line: line + 1, rule, detail })
  }

  for (const [rule, re] of TEXT_RULES) {
    const m = re.exec(text)
    if (m) add(rule, m.index, `${m[0].slice(0, 6)}…`)
  }
  for (const m of text.matchAll(JWT)) {
    const payload = decodeJwtPayload(m[0])
    if (payload?.role === 'service_role')
      add('supabase-service-role', m.index, 'JWT com role service_role')
    else add('jwt', m.index, 'JWT no código: leia de variável de ambiente')
  }
  for (const m of text.matchAll(CONN))
    if (!PLACEHOLDER.test(m[2])) add('senha-em-url', m.index, `${m[1]}:***@`)
  for (const m of text.matchAll(QUOTED))
    if (!PLACEHOLDER.test(m[1])) add('senha-literal', m.index, 'literal atribuído a nome sensível')
  lines.forEach((l, i) => {
    const m = ENV_LINE.exec(l)
    if (!m || ignored.has(i)) return
    const value = m[1].trim().replace(/^["']|["']$/g, '')
    // sinalizadores (1, true, yes...) e valores curtíssimos não são segredos
    const flag = value.length < 6 || /^(true|false|yes|no|on|off)$/i.test(value)
    if (
      value &&
      !flag &&
      !PLACEHOLDER.test(value) &&
      !value.startsWith('process.env') &&
      !value.includes('${')
    )
      out.push({
        file,
        line: i + 1,
        rule: 'segredo-em-variavel',
        detail: l.split(/[:=]/)[0].trim(),
      })
  })
  return out
}

const ENV_FILE = /(^|\/)\.env(\..+)?$/
/** `.env*` nunca entra no repositório, exceto o exemplo (sem valores reais). */
export function scanPath(file) {
  if (ENV_FILE.test(file) && !/\.env\.example$/.test(file))
    return [{ file, line: 0, rule: 'arquivo-env', detail: 'arquivo .env versionado' }]
  if (/\.(pem|key|p12|pfx)$/i.test(file) || /(^|\/)\.pgpass$/.test(file))
    return [
      {
        file,
        line: 0,
        rule: 'arquivo-de-credencial',
        detail: 'arquivo de chave/credencial versionado',
      },
    ]
  return []
}

/** Variáveis VITE_* vão para o bundle do navegador: só as públicas, e nunca service_role. */
export const ALLOWED_VITE_VARS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

export function scanClientSource(file, text) {
  const out = []
  for (const m of text.matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g))
    if (!ALLOWED_VITE_VARS.includes(m[1]))
      out.push({ file, line: 0, rule: 'vite-var-nao-permitida', detail: m[1] })
  if (/service[_-]?role/i.test(text))
    out.push({
      file,
      line: 0,
      rule: 'service-role-no-cliente',
      detail: 'service_role no código do cliente',
    })
  return out
}

/** Arquivo do build: nenhum JWT de service_role e nenhuma variável sensível embutida. */
export function scanBuilt(file, text) {
  const out = []
  if (/service[_-]?role/i.test(text))
    out.push({ file, line: 0, rule: 'service-role-no-build', detail: 'service_role no bundle' })
  for (const m of text.matchAll(JWT))
    if (decodeJwtPayload(m[0])?.role === 'service_role')
      out.push({
        file,
        line: 0,
        rule: 'supabase-service-role',
        detail: 'JWT service_role no bundle',
      })
  for (const [rule, re] of TEXT_RULES)
    if (re.test(text)) out.push({ file, line: 0, rule, detail: 'padrão de credencial no bundle' })
  return out
}
