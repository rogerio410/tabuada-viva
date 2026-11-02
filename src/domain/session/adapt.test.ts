import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import { adaptNextSession, sessionAccuracy } from './adapt'

const acc = (...xs: Array<number | null>) => xs.map((accuracy) => ({ accuracy }))
const att = (correct: boolean, supported = false) => ({
  correct,
  supportsUsed: supported ? (['dedos'] as const) : [],
})

describe('sessionAccuracy (D4)', () => {
  it('acertos SEM apoio ÷ todas as respostas; acerto com ajuda entra só no denominador', () => {
    expect(sessionAccuracy([att(true), att(true, true), att(false), att(true)])).toBe(0.5)
  })
  it('sem respostas devolve null', () => {
    expect(sessionAccuracy([])).toBeNull()
  })
})

describe('adaptNextSession (D4)', () => {
  const normal = { maxNew: PARAMS.maxNewFactsPerSession, restoreSupport: false, accelerate: false }

  it('sem histórico: nada muda', () => {
    expect(adaptNextSession([])).toEqual(normal)
    expect(adaptNextSession(acc(null))).toEqual(normal)
  })
  it('zona 70–80% e 80–90%: nada muda', () => {
    for (const a of [0.7, 0.75, 0.8, 0.85, 0.9]) expect(adaptNextSession(acc(a))).toEqual(normal)
  })
  it('abaixo de 70% reduz os novos e devolve o apoio', () => {
    const r = adaptNextSession(acc(0.8, 0.69))
    expect(r.maxNew).toBeLessThan(PARAMS.maxNewFactsPerSession)
    expect(r.maxNew).toBeGreaterThanOrEqual(1)
    expect(r.restoreSupport).toBe(true)
    expect(r.accelerate).toBe(false)
  })
  it('exatamente 70% não reduz', () => {
    expect(adaptNextSession(acc(0.7)).restoreSupport).toBe(false)
  })
  it('acima de 90% por 3 sessões seguidas acelera', () => {
    expect(adaptNextSession(acc(0.95, 0.92, 0.91)).accelerate).toBe(true)
  })
  it('acima de 90% por menos de 3 sessões não acelera', () => {
    expect(adaptNextSession(acc(0.95, 0.95)).accelerate).toBe(false)
    expect(adaptNextSession(acc(0.85, 0.95, 0.95)).accelerate).toBe(false)
  })
  it('exatamente 90% não acelera', () => {
    expect(adaptNextSession(acc(0.9, 0.9, 0.9)).accelerate).toBe(false)
  })
  it('sessão sem respostas (null) é ignorada na janela', () => {
    expect(adaptNextSession(acc(0.95, null, 0.95, 0.95)).accelerate).toBe(true)
  })
  it('reduzir vence acelerar', () => {
    // a última sessão está abaixo de 70% mesmo que as anteriores fossem altas
    const r = adaptNextSession(acc(0.95, 0.95, 0.95, 0.5))
    expect(r.restoreSupport).toBe(true)
    expect(r.accelerate).toBe(false)
  })
})
