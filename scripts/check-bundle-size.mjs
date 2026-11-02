// Falha se o JS comprimido (gzip) do build passar de 300 KB. Meta do doc: "Experiência no celular".
import { readdirSync, readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const LIMIT = 300 * 1024
const dir = 'dist/assets'
const total = readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .reduce((n, f) => n + gzipSync(readFileSync(join(dir, f))).length, 0)
console.log(`JS gzip: ${(total / 1024).toFixed(1)} KB (limite ${LIMIT / 1024} KB)`)
if (total > LIMIT) process.exit(1)
