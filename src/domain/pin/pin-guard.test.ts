import { describe, expect, it } from 'vitest'
import { SECURITY } from '../config/security'
import {
  attemptsLeft,
  canAttempt,
  initialPinGuard,
  isValidPinFormat,
  lockRemainingMs,
  parsePinGuardState,
  registerFailure,
  registerSuccess,
  type PinGuardState,
} from './pin-guard'

const MIN = 60 * 1000
const T0 = new Date('2026-11-02T10:00:00Z')
const at = (ms: number) => new Date(T0.getTime() + ms)

function fail(state: PinGuardState, times: number, now: Date) {
  let s = state
  for (let i = 0; i < times; i++) s = registerFailure(s, now)
  return s
}

describe('registerFailure', () => {
  it('conta falhas sem bloquear antes da 5ª', () => {
    const s = fail(initialPinGuard(), SECURITY.pin.maxFailures - 1, T0)
    expect(canAttempt(s, T0)).toBe(true)
    expect(lockRemainingMs(s, T0)).toBe(0)
    expect(attemptsLeft(s)).toBe(1)
  })

  it('bloqueia na 5ª falha por 15 minutos', () => {
    const s = fail(initialPinGuard(), SECURITY.pin.maxFailures, T0)
    expect(canAttempt(s, T0)).toBe(false)
    expect(lockRemainingMs(s, T0)).toBe(15 * MIN)
  })

  it('destrava exatamente depois do prazo', () => {
    const s = fail(initialPinGuard(), 5, T0)
    expect(lockRemainingMs(s, at(15 * MIN - 1))).toBe(1)
    expect(canAttempt(s, at(15 * MIN - 1))).toBe(false)
    expect(canAttempt(s, at(15 * MIN))).toBe(true)
    expect(lockRemainingMs(s, at(15 * MIN))).toBe(0)
  })

  it('depois de destravar, volta a ter 5 tentativas', () => {
    const s = fail(initialPinGuard(), 5, T0)
    expect(attemptsLeft(s)).toBe(5)
  })

  it('o bloqueio dobra a cada novo ciclo: 15, 30, 60 minutos', () => {
    let s = fail(initialPinGuard(), 5, T0)
    let now = at(15 * MIN)
    s = fail(s, 5, now)
    expect(lockRemainingMs(s, now)).toBe(30 * MIN)
    now = at(15 * MIN + 30 * MIN)
    s = fail(s, 5, now)
    expect(lockRemainingMs(s, now)).toBe(60 * MIN)
  })

  it('o bloqueio nunca passa de 24 horas', () => {
    let s = initialPinGuard()
    let now = T0
    for (let cycle = 0; cycle < 12; cycle++) {
      s = fail(s, 5, now)
      now = at(now.getTime() - T0.getTime() + lockRemainingMs(s, now))
    }
    expect(lockRemainingMs(fail(s, 0, now), now)).toBe(0)
    s = fail(s, 5, now)
    expect(lockRemainingMs(s, now)).toBe(SECURITY.pin.maxLockMs)
  })

  it('tentativa durante o bloqueio não conta e não estende o prazo', () => {
    const locked = fail(initialPinGuard(), 5, T0)
    const again = registerFailure(locked, at(5 * MIN))
    expect(lockRemainingMs(again, at(5 * MIN))).toBe(10 * MIN)
    expect(attemptsLeft(again)).toBe(5)
  })

  it('não muta o estado recebido', () => {
    const s = initialPinGuard()
    const copy = JSON.stringify(s)
    registerFailure(s, T0)
    expect(JSON.stringify(s)).toBe(copy)
  })
})

describe('registerSuccess', () => {
  it('zera falhas e ciclos', () => {
    let s = fail(initialPinGuard(), 5, T0)
    s = fail(s, 5, at(15 * MIN))
    const after = registerSuccess(s, at(15 * MIN + 30 * MIN))
    expect(after).toEqual({ ...initialPinGuard(), lastSeenMs: at(45 * MIN).getTime() })
    expect(fail(after, 5, at(45 * MIN)).lockLevel).toBe(1)
  })

  it('zera as falhas parciais', () => {
    const s = registerSuccess(fail(initialPinGuard(), 3, T0), T0)
    expect(attemptsLeft(s)).toBe(5)
  })

  it('durante o bloqueio um "sucesso" não destrava (a verificação nem deveria ter ocorrido)', () => {
    const locked = fail(initialPinGuard(), 5, T0)
    const s = registerSuccess(locked, at(MIN))
    expect(lockRemainingMs(s, at(MIN))).toBe(14 * MIN)
  })
})

describe('relógio recuado', () => {
  it('voltar o relógio do aparelho não destrava', () => {
    const locked = fail(initialPinGuard(), 5, at(60 * MIN))
    expect(lockRemainingMs(locked, T0)).toBe(15 * MIN)
    expect(canAttempt(locked, at(-24 * 60 * MIN))).toBe(false)
  })

  it('usa o maior instante já visto', () => {
    let s = fail(initialPinGuard(), 1, at(30 * MIN))
    s = registerFailure(s, T0)
    expect(s.lastSeenMs).toBe(at(30 * MIN).getTime())
  })
})

describe('serialização', () => {
  it('sobrevive a JSON (IndexedDB)', () => {
    const s = fail(initialPinGuard(), 5, T0)
    expect(parsePinGuardState(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })

  it('estado corrompido volta ao inicial, sem lançar', () => {
    for (const bad of [
      null,
      undefined,
      3,
      'x',
      {},
      { failures: -1 },
      { failures: 'a', lockLevel: 0, lockedUntilMs: null, lastSeenMs: 0 },
    ])
      expect(parsePinGuardState(bad)).toEqual(initialPinGuard())
  })
})

describe('isValidPinFormat', () => {
  it('aceita só dígitos no tamanho configurado', () => {
    expect(isValidPinFormat('1234')).toBe(true)
    expect(isValidPinFormat('0000')).toBe(true)
    for (const bad of ['123', '12345', '12a4', '', ' 123', '１２３４'])
      expect(isValidPinFormat(bad), bad).toBe(false)
  })
})
