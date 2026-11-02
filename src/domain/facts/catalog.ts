import { factId, parseFactId, rootChain, type Fact } from './fact-id'

/**
 * Catálogo de fatos da v1 (D9, D10, D16). Contagem: 66 de adição (par não ordenado, 0–10), 121 de subtração
 * (todas as células da grade, subtraendo ≤ 10 e resto ≤ 10), 45 de multiplicação (2–10, a ≤ b) e 81 de divisão
 * (os irmãos dos 45). As regras (+0, −0, n−n já estão dentro dos 66 e 121; ×0, ×1, ÷1, n÷n, 0÷n) têm `rule: true`.
 */
export interface CatalogFact extends Fact {
  /** Regra (somar zero, ×0, ×1, ÷1...) em vez de fato a decorar. */
  rule: boolean
  /** Do fato até a soma de origem (D11); [] em adição. */
  root: string[]
}

const out: CatalogFact[] = []
const seen = new Set<string>()
function push(id: string, rule: boolean) {
  if (seen.has(id)) return
  const fact = parseFactId(id)
  if (!fact) throw new Error(`catálogo: id inválido ${id}`)
  seen.add(id)
  out.push({ ...fact, rule, root: rootChain(id) ?? [] })
}

// adição: 66 pares a ≤ b em 0–10; +0 é regra
for (let a = 0; a <= 10; a++) for (let b = a; b <= 10; b++) push(factId('add', a, b), a === 0)

// subtração: 121 = cada par (x, y) em 0–10 gera (x + y) − x = y; −0 e n−n são regra
for (let x = 0; x <= 10; x++)
  for (let y = 0; y <= 10; y++) push(factId('sub', x + y, x), x === 0 || y === 0)

// multiplicação: 45 fatos (2–10) e as regras ×0 e ×1 (21 pares)
for (let a = 2; a <= 10; a++) for (let b = a; b <= 10; b++) push(factId('mul', a, b), false)
for (let a = 0; a <= 1; a++) for (let b = a; b <= 10; b++) push(factId('mul', a, b), true)

// divisão: os dois irmãos de cada fato de ×; mais ÷1, n÷n e 0÷n como regra
for (let a = 2; a <= 10; a++)
  for (let b = a; b <= 10; b++) {
    push(factId('div', a * b, a), false)
    if (a !== b) push(factId('div', a * b, b), false)
  }
for (let n = 0; n <= 10; n++) push(factId('div', n, 1), true)
for (let n = 2; n <= 10; n++) {
  push(factId('div', n, n), true)
  push(factId('div', 0, n), true)
}

export const CATALOG: readonly CatalogFact[] = out
export const FACT_BY_ID: ReadonlyMap<string, CatalogFact> = new Map(out.map((f) => [f.id, f]))

export const factsOf = (op: Fact['op']): CatalogFact[] => out.filter((f) => f.op === op)
export const isRule = (id: string): boolean => FACT_BY_ID.get(id)?.rule === true
