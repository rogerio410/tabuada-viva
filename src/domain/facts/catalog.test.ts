import { describe, expect, it } from 'vitest'
import { CATALOG, FACT_BY_ID, isRule } from './catalog'
import { parseFactId, rootChain } from './fact-id'

describe('catálogo de fatos (D9, D10, D16)', () => {
  it('tem 66 fatos de adição, 121 de subtração, 45 de multiplicação e 81 de divisão', () => {
    const count = (op: 'add' | 'sub' | 'mul' | 'div') =>
      CATALOG.filter((f) => f.op === op && !f.rule).length
    // + e − têm as regras (+0, −0, n−n) DENTRO dos 66 e dos 121
    expect(CATALOG.filter((f) => f.op === 'add')).toHaveLength(66)
    expect(CATALOG.filter((f) => f.op === 'sub')).toHaveLength(121)
    expect(count('mul')).toBe(45)
    expect(count('div')).toBe(81)
  })

  it('ids são únicos e todos são canônicos', () => {
    expect(new Set(CATALOG.map((f) => f.id)).size).toBe(CATALOG.length)
    for (const f of CATALOG) expect(parseFactId(f.id), f.id).not.toBeNull()
  })

  it('as regras existem: +0, −0, n−n, ×0, ×1, ÷1, n÷n, 0÷n', () => {
    for (const id of [
      'add:0+7',
      'sub:7-0',
      'sub:7-7',
      'mul:0x7',
      'mul:1x7',
      'div:7/1',
      'div:7/7',
      'div:0/7',
    ])
      expect(isRule(id), id).toBe(true)
    expect(isRule('add:3+4')).toBe(false)
    expect(isRule('mul:3x4')).toBe(false)
  })

  it('todo fato de −, × e ÷ aponta para uma cadeia que termina em adição do catálogo', () => {
    for (const f of CATALOG) {
      const chain = rootChain(f.id)!
      if (f.op === 'add') {
        expect(chain, f.id).toEqual([])
        continue
      }
      expect(chain.length, f.id).toBeGreaterThan(0)
      for (const step of chain) expect(FACT_BY_ID.has(step), `${f.id} -> ${step}`).toBe(true)
      expect(parseFactId(chain[chain.length - 1]!)!.op, f.id).toBe('add')
      expect(f.root).toEqual(chain)
    }
  })

  it('div:12/3 desce por mul:3x4 até add:4+4', () => {
    expect(FACT_BY_ID.get('div:12/3')!.root).toEqual(['mul:3x4', 'add:4+4'])
  })

  it('subtração: minuendo até 20, subtraendo até 10; adição e × dentro de 0–10', () => {
    for (const f of CATALOG) {
      if (f.op === 'sub') expect(f.a <= 20 && f.b <= 10).toBe(true)
      if (f.op === 'add' || f.op === 'mul') expect(f.a <= 10 && f.b <= 10).toBe(true)
    }
  })
})
