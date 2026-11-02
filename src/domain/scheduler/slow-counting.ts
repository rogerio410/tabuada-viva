import { PARAMS } from '../config/params'
import type { Attempt } from '../ports/types'
import { fastThresholdMs } from './timing'

/**
 * "Contou de um em um" (D3, D24): acerto sem apoio, em fato avulso, com tempo acima de `slowCountingFactor` × o
 * limiar rápido. Não é erro (nunca entra na taxa de erros do painel) e nunca interrompe um acerto.
 */
export function isSlowCountingAttempt(a: Attempt): boolean {
  if (!a.correct || a.supportsUsed.length > 0 || a.kind !== 'fact' || a.factId === null)
    return false
  if (!Number.isFinite(a.timeMs) || a.timeMs < 0) return false
  return a.timeMs > PARAMS.slowCountingFactor * fastThresholdMs(a.factId)
}

/**
 * A dica de estratégia aparece na PRÓXIMA apresentação do fato quando as últimas `slowCountingStreak` respostas
 * a ele (em ordem cronológica) foram todas "contou de um em um". Qualquer outra resposta no meio zera a sequência.
 */
export function needsStrategyHint(attempts: readonly Attempt[], factId: string): boolean {
  const mine = attempts
    .filter((a) => a.factId === factId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const last = mine.slice(-PARAMS.slowCountingStreak)
  return last.length === PARAMS.slowCountingStreak && last.every(isSlowCountingAttempt)
}
