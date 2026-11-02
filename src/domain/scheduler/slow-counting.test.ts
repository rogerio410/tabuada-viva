import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import type { Attempt } from '../ports/types'
import { fastThresholdMs } from './timing'
import { isSlowCountingAttempt, needsStrategyHint } from './slow-counting'

const FACT = 'add:3+4'
const LIMIT = fastThresholdMs(FACT) // 4000
let n = 0
const att = (over: Partial<Attempt> = {}): Attempt => ({
  childId: 'ana',
  sessionId: 's',
  itemId: `i${n++}`,
  factId: FACT,
  answer: 7,
  correct: true,
  timeMs: LIMIT * PARAMS.slowCountingFactor + 1,
  supportsUsed: [],
  errorType: null,
  phaseId: 'W1-P04',
  kind: 'fact',
  createdAt: new Date(2026, 10, 2, 10, n),
  ...over,
})

describe('isSlowCountingAttempt (D3)', () => {
  it('acerto sem apoio com tempo > 2 × o limiar', () => {
    expect(isSlowCountingAttempt(att())).toBe(true)
  })
  it('exatamente 2 × o limiar ainda não conta', () => {
    expect(isSlowCountingAttempt(att({ timeMs: LIMIT * 2 }))).toBe(false)
  })
  it('erro, apoio, história ou fato nulo nunca contam', () => {
    expect(isSlowCountingAttempt(att({ correct: false }))).toBe(false)
    expect(isSlowCountingAttempt(att({ supportsUsed: ['dedos'] }))).toBe(false)
    expect(isSlowCountingAttempt(att({ kind: 'story' }))).toBe(false)
    expect(isSlowCountingAttempt(att({ factId: null }))).toBe(false)
  })
  it('tempo inválido não conta', () => {
    expect(isSlowCountingAttempt(att({ timeMs: NaN }))).toBe(false)
  })
  it('o limiar do fato muda a conta (resultado de 2 dígitos tem limiar maior)', () => {
    const big = att({ factId: 'add:6+7', timeMs: 5000 * 2 })
    expect(isSlowCountingAttempt(big)).toBe(false)
    expect(isSlowCountingAttempt({ ...big, timeMs: 5000 * 2 + 1 })).toBe(true)
  })
})

describe('needsStrategyHint: 2 vezes seguidas no mesmo fato', () => {
  it('duas seguidas dispara', () => {
    expect(needsStrategyHint([att(), att()], FACT)).toBe(true)
  })
  it('uma só não dispara', () => {
    expect(needsStrategyHint([att()], FACT)).toBe(false)
  })
  it('um acerto normal no meio interrompe a sequência', () => {
    expect(needsStrategyHint([att(), att({ timeMs: 1000 }), att()], FACT)).toBe(false)
  })
  it('um erro no meio interrompe a sequência', () => {
    expect(needsStrategyHint([att(), att({ correct: false }), att()], FACT)).toBe(false)
  })
  it('vale a ordem cronológica, não a ordem do vetor', () => {
    const [a, b] = [att(), att()]
    expect(
      needsStrategyHint(
        [b, att({ timeMs: 1000, createdAt: new Date(2026, 10, 2, 9, 0) }), a],
        FACT,
      ),
    ).toBe(true)
  })
  it('só olha o mesmo fato', () => {
    expect(needsStrategyHint([att(), att({ factId: 'add:1+2' })], FACT)).toBe(false)
  })
  it('sem tentativas', () => {
    expect(needsStrategyHint([], FACT)).toBe(false)
  })
})
