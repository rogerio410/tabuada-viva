import { PARAMS } from '../config/params'
import { isUnsupported, type WithSupport } from '../support/support'

export interface SessionSummary {
  /** Acerto da sessão (D4); null se não houve respostas. */
  accuracy: number | null
}

export interface Adaptation {
  /** Itens de apresentação novos permitidos na próxima sessão. */
  maxNew: number
  /** O apoio visual volta (aparece de novo sozinho). */
  restoreSupport: boolean
  /** Sinal de que a criança pode avançar mais depressa; o efeito é decidido no Sprint 3. */
  accelerate: boolean
}

/** Acerto da sessão (D4): respostas corretas SEM apoio ÷ todas as respostas; acerto com ajuda só no denominador. */
export function sessionAccuracy(
  attempts: ReadonlyArray<WithSupport & { correct: boolean }>,
): number | null {
  if (attempts.length === 0) return null
  return attempts.filter((a) => a.correct && isUnsupported(a)).length / attempts.length
}

/**
 * Ajuste para a próxima sessão (D4). Abaixo de `easeBelowAccuracy` reduz os novos e devolve o apoio; acima de
 * `accelerateAboveAccuracy` por `accelerateAfterSessions` sessões seguidas sinaliza acelerar. Reduzir vence.
 * A redução é de 1 item novo (mínimo 1): o GDD diz "reduz" sem dar o número.
 */
export function adaptNextSession(history: readonly SessionSummary[]): Adaptation {
  const played = history.flatMap((h) => (h.accuracy === null ? [] : [h.accuracy]))
  const last = played.at(-1)
  const normal = { maxNew: PARAMS.maxNewFactsPerSession, restoreSupport: false, accelerate: false }
  if (last === undefined) return normal

  if (last < PARAMS.easeBelowAccuracy)
    return {
      maxNew: Math.max(1, PARAMS.maxNewFactsPerSession - 1),
      restoreSupport: true,
      accelerate: false,
    }

  const window = played.slice(-PARAMS.accelerateAfterSessions)
  const accelerate =
    window.length === PARAMS.accelerateAfterSessions &&
    window.every((a) => a > PARAMS.accelerateAboveAccuracy)
  return { ...normal, accelerate }
}
