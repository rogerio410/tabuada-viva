// Gera vercel.json a partir de config/security-headers.mjs. Com --check, só confere (entra em `npm run verify`).
import { readFileSync, writeFileSync } from 'node:fs'
import { vercelConfig } from '../config/security-headers.mjs'

const expected = JSON.stringify(vercelConfig(), null, 2) + '\n'
if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync('vercel.json', 'utf8')
  } catch {}
  if (current !== expected) {
    console.error(
      '✗ vercel.json fora de sincronia com config/security-headers.mjs. Rode: npm run gen:headers',
    )
    process.exit(1)
  }
  console.log('✓ vercel.json em sincronia com config/security-headers.mjs')
} else {
  writeFileSync('vercel.json', expected)
  console.log('vercel.json gerado')
}
