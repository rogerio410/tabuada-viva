import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import type { FactState, FactStatus } from '../ports/types'
import { addDays, applyAnswer, dayKey, presentFact, type AnswerOutcome } from './apply-answer'

// Datas em hora local: o "dia de calendário" é o dia local (D1).
const T0 = new Date(2026, 10, 2, 10, 0, 0)
const day = (n: number) => addDays(T0, n)

const state = (status: FactStatus, over: Partial<FactState> = {}): FactState => ({
  childId: 'ana',
  factId: 'add:3+4',
  status,
  nextReview: T0,
  streak: 0,
  fastDays: [],
  correct: 0,
  wrong: 0,
  medianMs: null,
  ...over,
})

const FAST_OK: AnswerOutcome = { correct: true, fast: true, supported: false }
const SLOW_OK: AnswerOutcome = { correct: true, fast: false, supported: false }
const HELPED_OK: AnswerOutcome = { correct: true, fast: false, supported: true }
const WRONG: AnswerOutcome = { correct: false, fast: false, supported: false }

describe('presentFact', () => {
  it('cria o fato em Aprendendo, para revisar na hora', () => {
    expect(presentFact('ana', 'add:3+4', T0)).toEqual({
      childId: 'ana',
      factId: 'add:3+4',
      status: 'aprendendo',
      nextReview: T0,
      streak: 0,
      fastDays: [],
      correct: 0,
      wrong: 0,
      medianMs: null,
    })
  })
})

describe('Aprendendo', () => {
  it('acerto rápido sem apoio soma 1 à sequência', () => {
    const r = applyAnswer(state('aprendendo'), FAST_OK, T0)
    expect(r.state).toMatchObject({ status: 'aprendendo', streak: 1 })
    expect(r.returnToQueue).toBe(false)
  })
  it('acerto lento sem apoio também soma à sequência', () => {
    expect(applyAnswer(state('aprendendo'), SLOW_OK, T0).state.streak).toBe(1)
  })
  it('acerto com apoio não avança a sequência', () => {
    expect(applyAnswer(state('aprendendo', { streak: 2 }), HELPED_OK, T0).state).toMatchObject({
      status: 'aprendendo',
      streak: 2,
    })
  })
  it('3 acertos seguidos sem apoio (streakToPracticing) viram Praticando', () => {
    let s = state('aprendendo')
    for (let i = 0; i < PARAMS.streakToPracticing; i++) s = applyAnswer(s, SLOW_OK, T0).state
    expect(s.status).toBe('praticando')
    expect(s.nextReview).toEqual(day(PARAMS.reviewIntervalDays.praticando))
  })
  it('erro zera a sequência, fica em Aprendendo e o fato volta à fila', () => {
    const r = applyAnswer(state('aprendendo', { streak: 2 }), WRONG, T0)
    expect(r.state).toMatchObject({ status: 'aprendendo', streak: 0 })
    expect(r.returnToQueue).toBe(true)
  })
  it('erro em Aprendendo não desce abaixo de Aprendendo e reinicia o intervalo', () => {
    const r = applyAnswer(state('aprendendo', { nextReview: day(3) }), WRONG, T0)
    expect(r.state.status).toBe('aprendendo')
    expect(r.state.nextReview).toEqual(T0) // intervalo 0
  })
  it('acerto lento não é zerado por ser lento: a sequência só zera por erro', () => {
    let s = state('aprendendo')
    s = applyAnswer(s, FAST_OK, T0).state
    s = applyAnswer(s, SLOW_OK, T0).state
    expect(s.streak).toBe(2)
  })
  it('um fato "novo" é tratado como Aprendendo', () => {
    expect(applyAnswer(state('novo'), FAST_OK, T0).state.status).toBe('aprendendo')
  })
})

describe('Praticando', () => {
  it('acerto rápido sem apoio registra o dia (Fluente exige 2 dias diferentes)', () => {
    const r = applyAnswer(state('praticando'), FAST_OK, T0)
    expect(r.state).toMatchObject({ status: 'praticando', fastDays: [dayKey(T0)] })
    expect(r.state.nextReview).toEqual(day(2))
  })
  it('dois acertos rápidos no MESMO dia não promovem', () => {
    let s = applyAnswer(state('praticando'), FAST_OK, T0).state
    s = applyAnswer(s, FAST_OK, addDays(T0, 0)).state
    expect(s.status).toBe('praticando')
    expect(s.fastDays).toEqual([dayKey(T0)])
  })
  it('acertos rápidos em 2 dias diferentes viram Fluente, com revisão em 5 dias', () => {
    let s = applyAnswer(state('praticando'), FAST_OK, T0).state
    s = applyAnswer(s, FAST_OK, day(1)).state
    expect(s.status).toBe('fluente')
    expect(s.nextReview).toEqual(addDays(day(1), PARAMS.reviewIntervalDays.fluente))
  })
  it('acerto lento sem apoio: fica, não rebaixa e não registra dia', () => {
    const r = applyAnswer(state('praticando'), SLOW_OK, T0)
    expect(r.state).toMatchObject({ status: 'praticando', fastDays: [] })
  })
  it('acerto com apoio: fica e não conta dia', () => {
    const r = applyAnswer(state('praticando'), HELPED_OK, T0)
    expect(r.state).toMatchObject({ status: 'praticando', fastDays: [] })
  })
  it('erro desce para Aprendendo, zera fastDays e volta à fila', () => {
    const r = applyAnswer(state('praticando', { fastDays: [dayKey(T0)] }), WRONG, T0)
    expect(r.state).toMatchObject({ status: 'aprendendo', streak: 0, fastDays: [] })
    expect(r.returnToQueue).toBe(true)
  })
})

describe('Fluente', () => {
  const due = { nextReview: addDays(T0, -1) }
  it('acerto rápido sem apoio em revisão vencida vira Dominado (revisão em 14 dias)', () => {
    const r = applyAnswer(state('fluente', due), FAST_OK, T0)
    expect(r.state.status).toBe('dominado')
    expect(r.state.nextReview).toEqual(day(PARAMS.reviewIntervalDays.dominado))
  })
  it('acerto rápido fora da revisão vencida é só "acerto do dia": nada muda', () => {
    const s = state('fluente', { nextReview: day(3) })
    const r = applyAnswer(s, FAST_OK, T0)
    expect(r.state).toEqual(s)
  })
  it('acerto lento ou com apoio: fica e não promove', () => {
    expect(applyAnswer(state('fluente', due), SLOW_OK, T0).state.status).toBe('fluente')
    expect(applyAnswer(state('fluente', due), HELPED_OK, T0).state.status).toBe('fluente')
  })
  it('erro desce para Praticando', () => {
    const r = applyAnswer(state('fluente', due), WRONG, T0)
    expect(r.state.status).toBe('praticando')
    expect(r.state.nextReview).toEqual(day(2))
    expect(r.returnToQueue).toBe(true)
  })
})

describe('Dominado', () => {
  it('acerto rápido sem apoio mantém, próxima revisão em 14 dias', () => {
    const r = applyAnswer(state('dominado'), FAST_OK, T0)
    expect(r.state.status).toBe('dominado')
    expect(r.state.nextReview).toEqual(day(14))
  })
  it('acerto lento sem apoio: fica, revisão em 5 dias', () => {
    const r = applyAnswer(state('dominado'), SLOW_OK, T0)
    expect(r.state.status).toBe('dominado')
    expect(r.state.nextReview).toEqual(day(5))
  })
  it('acerto com apoio volta a Fluente', () => {
    expect(applyAnswer(state('dominado'), HELPED_OK, T0).state.status).toBe('fluente')
  })
  it('erro desce para Fluente', () => {
    const r = applyAnswer(state('dominado'), WRONG, T0)
    expect(r.state.status).toBe('fluente')
    expect(r.returnToQueue).toBe(true)
  })
})

describe('regras que valem sempre', () => {
  it('apoio nunca promove: Aprendendo, Praticando e Fluente ficam onde estão', () => {
    const due = addDays(T0, -9)
    expect(applyAnswer(state('aprendendo', { streak: 2 }), HELPED_OK, T0).state.status).toBe(
      'aprendendo',
    )
    expect(
      applyAnswer(state('praticando', { fastDays: [dayKey(day(-1))] }), HELPED_OK, T0).state.status,
    ).toBe('praticando')
    expect(applyAnswer(state('fluente', { nextReview: due }), HELPED_OK, T0).state.status).toBe(
      'fluente',
    )
  })
  it('acerto lento sem apoio nunca rebaixa', () => {
    const order: FactStatus[] = ['aprendendo', 'praticando', 'fluente', 'dominado']
    for (const status of order) {
      const next = applyAnswer(state(status, { nextReview: addDays(T0, -9) }), SLOW_OK, T0).state
        .status
      expect(order.indexOf(next)).toBeGreaterThanOrEqual(order.indexOf(status))
    }
  })
  it('erro nunca desce abaixo de Aprendendo', () => {
    expect(applyAnswer(state('aprendendo'), WRONG, T0).state.status).toBe('aprendendo')
  })
  it('só um erro volta à fila', () => {
    for (const status of ['aprendendo', 'praticando', 'fluente', 'dominado'] as const)
      for (const a of [FAST_OK, SLOW_OK, HELPED_OK])
        expect(applyAnswer(state(status), a, T0).returnToQueue).toBe(false)
  })
  it('não muta o estado recebido', () => {
    const s = state('aprendendo', { fastDays: ['2026-11-01'] })
    const copy = JSON.stringify(s)
    applyAnswer(s, FAST_OK, T0)
    expect(JSON.stringify(s)).toBe(copy)
  })
  it('o dia de calendário é o dia local: 23:59 e 00:01 são dias diferentes', () => {
    const a = new Date(2026, 10, 2, 23, 59)
    const b = new Date(2026, 10, 3, 0, 1)
    expect(dayKey(a)).toBe('2026-11-02')
    expect(dayKey(b)).toBe('2026-11-03')
    let s = applyAnswer(state('praticando'), FAST_OK, a).state
    s = applyAnswer(s, FAST_OK, b).state
    expect(s.status).toBe('fluente')
  })
  it('addDays soma dias de calendário, também na virada de horário de verão', () => {
    const d = new Date(2026, 9, 31, 10, 0)
    const r = addDays(d, 2)
    expect([r.getFullYear(), r.getMonth(), r.getDate(), r.getHours()]).toEqual([2026, 10, 2, 10])
  })
})
