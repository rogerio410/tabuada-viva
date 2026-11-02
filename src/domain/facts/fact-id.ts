/**
 * Identificador canônico de fato e cadeia de fatos raiz (D10, D11).
 * `add:3+4` e `mul:3x4` guardam o par não ordenado (a ≤ b); `sub:13-8` e `div:12/3` são ordenados.
 */
export type Op = 'add' | 'sub' | 'mul' | 'div'

export interface Fact {
  id: string
  op: Op
  a: number
  b: number
  result: number
}

const SYMBOL: Record<Op, string> = { add: '+', sub: '-', mul: 'x', div: '/' }
const PATTERN = /^(add|sub|mul|div):(0|[1-9]\d*)([+\-x/])(0|[1-9]\d*)$/

export function factId(op: Op, a: number, b: number): string {
  const [x, y] = op === 'add' || op === 'mul' ? [Math.min(a, b), Math.max(a, b)] : [a, b]
  return `${op}:${x}${SYMBOL[op]}${y}`
}

export function parseFactId(id: string): Fact | null {
  const m = PATTERN.exec(id)
  if (!m) return null
  const op = m[1] as Op
  if (m[3] !== SYMBOL[op]) return null
  const a = Number(m[2])
  const b = Number(m[4])
  switch (op) {
    case 'add':
      return a <= b ? { id, op, a, b, result: a + b } : null
    case 'mul':
      return a <= b ? { id, op, a, b, result: a * b } : null
    case 'sub':
      return b <= a ? { id, op, a, b, result: a - b } : null
    case 'div':
      return b >= 1 && a % b === 0 ? { id, op, a, b, result: a / b } : null
  }
}

/**
 * Do fato até a soma: − → adição inversa; × → soma repetida da maior parcela;
 * ÷ → × irmão → soma repetida. Adição devolve []. Id inválido devolve null.
 * Suposição para as regras: ×0 → add:0+0 e ×1 → add:0+n.
 */
export function rootChain(id: string): string[] | null {
  const f = parseFactId(id)
  if (!f) return null
  switch (f.op) {
    case 'add':
      return []
    case 'sub':
      return [factId('add', f.b, f.result)]
    case 'mul': {
      const root =
        f.a === 0
          ? factId('add', 0, 0)
          : f.a === 1
            ? factId('add', 0, f.b)
            : factId('add', f.b, f.b)
      return [root]
    }
    case 'div': {
      const sibling = factId('mul', f.b, f.result)
      return [sibling, ...(rootChain(sibling) ?? [])]
    }
  }
}
