import { describe, expect, it } from 'vitest'
import type { Attempt, FactState } from '../ports/types'
import { presentFact } from './apply-answer'
import { medianOf, recordAttempt } from './record-attempt'

const T0 = new Date(2026, 10, 2, 10, 0, 0)

const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  childId: 'ana',
  sessionId: 's1',
  itemId: 'i1',
  factId: 'add:3+4',
  answer: 7,
  correct: true,
  timeMs: 2000,
  supportsUsed: [],
  errorType: null,
  phaseId: 'W1-P04',
  kind: 'fact',
  createdAt: T0,
  ...over,
})

describe('medianOf', () => {
  it('mediana de quantidade ímpar e par; null sem dados', () => {
    expect(medianOf([])).toBeNull()
    expect(medianOf([3000, 1000, 2000])).toBe(2000)
    expect(medianOf([1000, 2000, 3000, 4000])).toBe(2500)
  })
})

describe('recordAttempt', () => {
  it('cria o fato Novo ao primeiro registro e conta o acerto', () => {
    const { state } = recordAttempt(undefined, attempt(), [], T0)
    expect(state.status).toBe('aprendendo')
    expect(state.correct).toBe(1)
    expect(state.wrong).toBe(0)
    expect(state.streak).toBe(1)
    expect(state.medianMs).toBe(2000)
  })

  it('erro conta em wrong, pede retorno à fila e não entra na mediana', () => {
    const prev: FactState = { ...presentFact('ana', 'add:3+4', T0), correct: 2, medianMs: 1500 }
    const res = recordAttempt(
      prev,
      attempt({ correct: false, answer: 8, timeMs: 9000 }),
      [1500, 1500],
      T0,
    )
    expect(res.state.wrong).toBe(1)
    expect(res.state.correct).toBe(2)
    expect(res.returnToQueue).toBe(true)
    expect(res.state.medianMs).toBe(1500)
  })

  it('a mediana usa os tempos anteriores dos acertos mais o atual', () => {
    const prev = presentFact('ana', 'add:3+4', T0)
    const { state } = recordAttempt(prev, attempt({ timeMs: 3000 }), [1000, 2000], T0)
    expect(state.medianMs).toBe(2000)
  })

  it('decide "rápido" pelo limiar do fato: rápido sem apoio avança, com apoio nunca', () => {
    const prev: FactState = { ...presentFact('ana', 'add:3+4', T0), status: 'praticando' }
    const fast = recordAttempt(prev, attempt({ timeMs: 1000 }), [], T0)
    expect(fast.state.fastDays).toEqual(['2026-11-02'])
    const helped = recordAttempt(prev, attempt({ timeMs: 1000, supportsUsed: ['dedos'] }), [], T0)
    expect(helped.state.fastDays).toEqual([])
  })

  it('acerto com apoio não avança a sequência em Aprendendo', () => {
    const prev = presentFact('ana', 'add:3+4', T0)
    const { state } = recordAttempt(prev, attempt({ supportsUsed: ['quadro-de-dez'] }), [], T0)
    expect(state.streak).toBe(0)
    expect(state.correct).toBe(1)
  })

  it('não muta o estado de entrada', () => {
    const prev = presentFact('ana', 'add:3+4', T0)
    const copy = structuredClone(prev)
    recordAttempt(prev, attempt(), [], T0)
    expect(prev).toEqual(copy)
  })

  it('recusa tentativa sem fato (história sem fato único)', () => {
    expect(() => recordAttempt(undefined, attempt({ factId: null }), [], T0)).toThrow()
  })
})
