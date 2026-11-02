// Barreira LGPD art. 14: sem rastreadores/CDNs externos no build nem no HTML.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const banned = [
  /google-analytics/i,
  /googletagmanager/i,
  /gtag\(/,
  /fbevents/i,
  /hotjar/i,
  /mixpanel/i,
  /segment\.(com|io)/i,
  /posthog/i,
  /fonts\.googleapis/i,
  /fonts\.gstatic/i,
]
const files = ['index.html']
for (const d of ['dist']) {
  const walk = (p) =>
    readdirSync(p, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(join(p, e.name))
        : /\.(js|html|css)$/.test(e.name)
          ? [join(p, e.name)]
          : [],
    )
  try {
    files.push(...walk(d))
  } catch {}
}
let bad = 0
for (const f of files) {
  const txt = readFileSync(f, 'utf8')
  for (const re of banned)
    if (re.test(txt)) {
      console.error(`✗ ${f}: ${re}`)
      bad++
    }
}
if (bad) process.exit(1)
console.log(`✓ sem rastreadores (${files.length} arquivos)`)
