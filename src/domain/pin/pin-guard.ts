import { PARAMS } from '../config/params'
import { SECURITY } from '../config/security'

/**
 * Limite de tentativas do PIN do adulto (D22). O PIN é um portão do painel, não a autenticação:
 * com 4 dígitos há só 10 000 combinações, então o limite é a defesa. Domínio puro: o relógio entra
 * como argumento e nada aqui lê, grava ou registra o PIN. O estado é JSON puro (vai para o Dexie).
 *
 * Limite conhecido: offline, quem apaga os dados do navegador zera este estado. A defesa de verdade
 * é a verificação no servidor (supabase/migrations/0003_pin.sql), que não depende do aparelho.
 */
export interface PinGuardState {
  /** Falhas no ciclo atual (0 enquanto bloqueado). */
  failures: number
  /** Bloqueios já aplicados desde o último sucesso; define a duração do próximo. */
  lockLevel: number
  /** Fim do bloqueio (ms desde a época) ou null. */
  lockedUntilMs: number | null
  /** Maior instante já observado; impede destravar recuando o relógio. */
  lastSeenMs: number
}

export const initialPinGuard = (): PinGuardState => ({
  failures: 0,
  lockLevel: 0,
  lockedUntilMs: null,
  lastSeenMs: 0,
})

const effectiveNow = (s: PinGuardState, now: Date) => Math.max(now.getTime(), s.lastSeenMs)

export function lockRemainingMs(state: PinGuardState, now: Date): number {
  if (state.lockedUntilMs === null) return 0
  return Math.max(0, state.lockedUntilMs - effectiveNow(state, now))
}

export const canAttempt = (state: PinGuardState, now: Date): boolean =>
  lockRemainingMs(state, now) === 0

export const attemptsLeft = (state: PinGuardState): number =>
  SECURITY.pin.maxFailures - state.failures

/** Registra um PIN errado. Durante o bloqueio não conta e não estende o prazo. */
export function registerFailure(state: PinGuardState, now: Date): PinGuardState {
  const t = effectiveNow(state, now)
  if (lockRemainingMs(state, now) > 0) return { ...state, lastSeenMs: t }
  const failures = state.failures + 1
  if (failures < SECURITY.pin.maxFailures) return { ...state, failures, lastSeenMs: t }
  const lockLevel = state.lockLevel + 1
  const lockMs = Math.min(SECURITY.pin.baseLockMs * 2 ** (lockLevel - 1), SECURITY.pin.maxLockMs)
  return { failures: 0, lockLevel, lockedUntilMs: t + lockMs, lastSeenMs: t }
}

/** Registra um PIN certo: zera falhas e ciclos. Durante o bloqueio não destrava. */
export function registerSuccess(state: PinGuardState, now: Date): PinGuardState {
  const t = effectiveNow(state, now)
  if (lockRemainingMs(state, now) > 0) return { ...state, lastSeenMs: t }
  return { ...initialPinGuard(), lastSeenMs: t }
}

const isCount = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0

/** Lê o estado salvo; qualquer coisa fora do formato volta ao inicial, sem lançar. */
export function parsePinGuardState(raw: unknown): PinGuardState {
  if (typeof raw !== 'object' || raw === null) return initialPinGuard()
  const r = raw as Record<string, unknown>
  const lockedOk = r.lockedUntilMs === null || isCount(r.lockedUntilMs)
  if (!isCount(r.failures) || !isCount(r.lockLevel) || !lockedOk || !isCount(r.lastSeenMs))
    return initialPinGuard()
  return {
    failures: r.failures,
    lockLevel: r.lockLevel,
    lockedUntilMs: r.lockedUntilMs as number | null,
    lastSeenMs: r.lastSeenMs,
  }
}

/** Só dígitos ASCII, no tamanho de `PARAMS.pinLength`. */
export const isValidPinFormat = (pin: string): boolean =>
  pin.length === PARAMS.pinLength && /^[0-9]+$/.test(pin)
