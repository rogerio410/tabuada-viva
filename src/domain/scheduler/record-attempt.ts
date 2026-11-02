import type { Attempt, FactState } from '../ports/types'
import { applyAnswer, presentFact, type AnswerResult } from './apply-answer'
import { isFast } from './timing'
import { isUnsupported } from '../support/support'

/** Mediana de uma lista de tempos; null sem dados. */
export function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
}

/**
 * Registra uma resposta no estado do fato: decide "rápido" (D2), aplica a transição e atualiza `correct`, `wrong` e
 * `medianMs` (que `applyAnswer` deixa para quem persiste). `priorCorrectTimesMs` são os tempos dos acertos anteriores
 * do fato (de `AttemptRepo.listByFact`); só acertos entram na mediana. Pura: não muta a entrada.
 */
export function recordAttempt(
  prev: FactState | undefined,
  attempt: Attempt,
  priorCorrectTimesMs: readonly number[],
  now: Date,
): AnswerResult {
  if (attempt.factId === null)
    throw new Error('recordAttempt exige um fato (história sem fato único)')
  const state = prev ?? presentFact(attempt.childId, attempt.factId, now)
  const supported = !isUnsupported(attempt)
  const fast = isFast({
    factId: attempt.factId,
    timeMs: attempt.timeMs,
    supported,
    story: attempt.kind === 'story',
  })
  const result = applyAnswer(state, { correct: attempt.correct, fast, supported }, now)
  const times = attempt.correct ? [...priorCorrectTimesMs, attempt.timeMs] : priorCorrectTimesMs
  return {
    returnToQueue: result.returnToQueue,
    state: {
      ...result.state,
      correct: state.correct + (attempt.correct ? 1 : 0),
      wrong: state.wrong + (attempt.correct ? 0 : 1),
      medianMs: medianOf(times) ?? state.medianMs,
    },
  }
}
