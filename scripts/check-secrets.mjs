// Barreira de segredos: nada de senha, chave ou token no repositório nem no build. Roda no verify e no pre-commit.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { scanBuilt, scanClientSource, scanPath, scanText } from './lib/secret-rules.mjs'

const BINARY = /\.(png|jpe?g|webp|gif|ico|woff2?|ttf|otf|pdf|zip|gz)$/i
const SKIP = /(^|\/)(package-lock\.json|node_modules\/)/

// rastreados + novos ainda não adicionados (e não ignorados)
const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((f) => !BINARY.test(f) && !SKIP.test(f))
  .filter((f) => {
    try {
      return statSync(f).isFile()
    } catch {
      return false // apagado, ainda no índice
    }
  })

const walk = (dir) => {
  try {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(join(dir, e.name))
        : /\.(js|css|html|json|webmanifest|map)$/.test(e.name)
          ? [join(dir, e.name)]
          : [],
    )
  } catch {
    return []
  }
}
const built = walk('dist')

const violations = [
  ...files.flatMap((f) => [...scanPath(f), ...scanText(f, readFileSync(f, 'utf8'))]),
  ...files
    .filter((f) => /^src\/.*\.(ts|tsx)$/.test(f) && !/\.test\./.test(f))
    .flatMap((f) => scanClientSource(f, readFileSync(f, 'utf8'))),
  ...built.flatMap((f) => scanBuilt(f, readFileSync(f, 'utf8'))),
]
for (const v of violations)
  console.error(`✗ ${v.file}${v.line ? `:${v.line}` : ''} [${v.rule}] ${v.detail}`)
if (violations.length) {
  console.error(
    '\nSe for um valor de teste sem risco, troque por um placeholder ou use `secret-scan: ignore` na linha, com justificativa.',
  )
  process.exit(1)
}
console.log(`✓ sem segredos (${files.length} arquivos do repositório, ${built.length} do build)`)
