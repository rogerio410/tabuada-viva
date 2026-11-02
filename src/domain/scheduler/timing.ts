import { PARAMS } from '../config/params'
import { parseFactId } from '../facts/fact-id'

/**
 * Limiar de resposta rápida (D2): 4 s base; +1 s por dígito extra no resultado; + `fastAnswerDivisionExtraMs`
 * em fatos de divisão. Medido do aparecimento da conta ao primeiro toque de resposta (a UI mede; aqui só se decide).
 */
export function fastThresholdMs(factId: string): number {
  const fact = parseFactId(factId)
  if (!fact) throw new Error(`fato inválido: ${factId}`)
  const extraDigits = Math.max(0, String(fact.result).length - 1)
  return (
    PARAMS.fastAnswerMs +
    extraDigits * PARAMS.fastAnswerExtraMsPerDigit +
    (fact.op === 'div' ? PARAMS.fastAnswerDivisionExtraMs : 0)
  )
}

export interface TimedAnswer {
  factId: string
  timeMs: number
  /** Abriu qualquer apoio antes de responder: nunca é rápida (apoio não promove). */
  supported: boolean
  /** Item de história: nunca é rápido (D2). */
  story: boolean
}

export function isFast({ factId, timeMs, supported, story }: TimedAnswer): boolean {
  if (supported || story) return false
  if (!Number.isFinite(timeMs) || timeMs < 0) return false
  return timeMs <= fastThresholdMs(factId)
}
