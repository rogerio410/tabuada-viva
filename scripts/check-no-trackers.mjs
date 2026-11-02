// Barreira LGPD art. 14: sem rastreadores/CDNs/URLs externas no build e no HTML, sem links externos
// nem texto livre na área da criança (src/ui). Regras em scripts/lib/tracker-rules.mjs.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { scanBuiltFile, scanChildUiSource } from './lib/tracker-rules.mjs'

const walk = (dir, test) => {
  try {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(join(dir, e.name), test)
        : test.test(e.name)
          ? [join(dir, e.name)]
          : [],
    )
  } catch {
    return []
  }
}

const built = ['index.html', ...walk('dist', /\.(js|html|css|webmanifest)$/)]
const childUi = walk('src/ui', /\.(ts|tsx)$/).filter((f) => !/\.test\.tsx?$/.test(f))

const violations = [
  ...built.flatMap((f) => scanBuiltFile(f, readFileSync(f, 'utf8'))),
  ...childUi.flatMap((f) => scanChildUiSource(f, readFileSync(f, 'utf8'))),
]
for (const v of violations) console.error(`✗ ${v.file}: [${v.rule}] ${v.detail}`)
if (violations.length) process.exit(1)
console.log(`✓ sem rastreadores (${built.length} arquivos de build, ${childUi.length} de src/ui)`)
