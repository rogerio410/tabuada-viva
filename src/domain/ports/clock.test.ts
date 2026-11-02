import { describe, expect, it } from 'vitest'
import { seededRng } from './clock'

describe('seededRng', () => {
  it('é determinístico para a mesma semente', () => {
    const a = seededRng(42)
    const b = seededRng(42)
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()])
  })
  it('fica em [0, 1)', () => {
    const r = seededRng(1)
    for (let i = 0; i < 1000; i++) {
      const v = r.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
