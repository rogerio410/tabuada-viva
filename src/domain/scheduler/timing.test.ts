import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import { fastThresholdMs, isFast } from './timing'

describe('fastThresholdMs (D2)', () => {
  it('resultado de 1 dígito: 4000 ms', () => {
    expect(fastThresholdMs('add:3+4')).toBe(PARAMS.fastAnswerMs)
    expect(fastThresholdMs('mul:2x4')).toBe(4000)
  })
  it('+1000 ms por dígito extra no resultado', () => {
    expect(fastThresholdMs('add:6+7')).toBe(4000 + 1000) // 13
    expect(fastThresholdMs('mul:9x9')).toBe(4000 + 1000) // 81
    expect(fastThresholdMs('mul:10x10')).toBe(4000 + 2000) // 100
  })
  it('divisão soma fastAnswerDivisionExtraMs', () => {
    expect(fastThresholdMs('div:12/3')).toBe(4000 + PARAMS.fastAnswerDivisionExtraMs) // resultado 4
    expect(fastThresholdMs('div:100/10')).toBe(
      4000 + PARAMS.fastAnswerDivisionExtraMs + PARAMS.fastAnswerExtraMsPerDigit, // resultado 10
    )
  })
  it('id inválido lança erro claro', () => {
    expect(() => fastThresholdMs('nada')).toThrow()
  })
})

describe('isFast', () => {
  const base = { factId: 'add:3+4', timeMs: 3000, supported: false, story: false }
  it('rápida: dentro do limiar, sem apoio, fato avulso', () => {
    expect(isFast(base)).toBe(true)
    expect(isFast({ ...base, timeMs: 4000 })).toBe(true)
  })
  it('lenta: acima do limiar', () => {
    expect(isFast({ ...base, timeMs: 4001 })).toBe(false)
  })
  it('apoio aberto nunca é rápida', () => {
    expect(isFast({ ...base, supported: true, timeMs: 100 })).toBe(false)
  })
  it('item de história nunca é rápido', () => {
    expect(isFast({ ...base, story: true, timeMs: 100 })).toBe(false)
  })
  it('tempo inválido (negativo, NaN, infinito) nunca é rápido', () => {
    for (const t of [-1, NaN, Infinity]) expect(isFast({ ...base, timeMs: t })).toBe(false)
  })
})
