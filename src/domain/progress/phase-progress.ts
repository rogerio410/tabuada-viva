import { PARAMS } from '../config/params'
import { adaptNextSession } from '../session/adapt'

export type Stars = 0 | 1 | 2 | 3

/** O que o progresso precisa saber de uma sessão. */
export interface PhaseSession {
  id: string
  phaseId?: string | null
  startedAt: Date
  endedAt: Date | null
  /** Acerto da sessão (D4); alimenta `adaptNextSession`. */
  accuracy: number | null
}

export interface PhaseAttempt {
  sessionId: string
  phaseId: string | null
  correct: boolean
}

export interface PhaseEvaluation {
  stars: Stars
  /** ≥ 2 estrelas e o mínimo de sessões da fase (D5, D12, D25): a próxima fase abre. */
  passed: boolean
}

export interface PhaseStatus {
  id: string
  state: 'locked' | 'current' | 'done'
  stars: Stars
}

/** Estrelas de um acerto (D5): limiares em `PARAMS.starThresholds`. */
export function starsFor(accuracy: number | null): Stars {
  if (accuracy === null) return 0
  const t = PARAMS.starThresholds
  return accuracy >= t.three ? 3 : accuracy >= t.two ? 2 : accuracy >= t.one ? 1 : 0
}

/** Sessões encerradas da fase, da mais antiga à mais nova. Sessão aberta não conta. */
export function completedSessions(
  sessions: readonly PhaseSession[],
  phaseId: string,
): PhaseSession[] {
  return sessions
    .filter((s) => s.phaseId === phaseId && s.endedAt !== null)
    .sort((a, b) => a.endedAt!.getTime() - b.endedAt!.getTime())
}

/**
 * Acerto da fase: acertos ÷ respostas (simples; o apoio só fica registrado) das últimas `phaseSessions.max`
 * sessões encerradas da fase. Uma primeira sessão ruim não pesa para sempre. Null sem sessões encerradas.
 */
export function phaseAccuracy(
  sessions: readonly PhaseSession[],
  attempts: readonly PhaseAttempt[],
  phaseId: string,
): number | null {
  const window = new Set(
    completedSessions(sessions, phaseId)
      .slice(-PARAMS.phaseSessions.max)
      .map((s) => s.id),
  )
  const answers = attempts.filter((a) => a.phaseId === phaseId && window.has(a.sessionId))
  if (answers.length === 0) return null
  return answers.filter((a) => a.correct).length / answers.length
}

/** Estrelas (o melhor resultado vale) e se a fase libera a próxima. */
export function evaluatePhase(
  sessions: readonly PhaseSession[],
  attempts: readonly PhaseAttempt[],
  phaseId: string,
  bestStars: Stars,
): PhaseEvaluation {
  const done = completedSessions(sessions, phaseId)
  const stars = Math.max(bestStars, starsFor(phaseAccuracy(sessions, attempts, phaseId))) as Stars
  return { stars, passed: isPassed(done, stars) }
}

function isPassed(done: readonly PhaseSession[], stars: Stars): boolean {
  if (stars < 2) return false
  const { sessionsBeforeAdvance } = adaptNextSession(done.map((s) => ({ accuracy: s.accuracy })))
  return done.length >= sessionsBeforeAdvance
}

/**
 * Estado de cada fase no mapa, em ordem fixa: a primeira fase não aprovada é a atual; antes dela, feitas; depois,
 * bloqueadas. `stars` é o melhor resultado guardado (Wallet).
 */
export function phaseStatuses(
  order: readonly string[],
  sessions: readonly PhaseSession[],
  stars: Readonly<Record<string, Stars>>,
): PhaseStatus[] {
  let open = true
  return order.map((id) => {
    const best = stars[id] ?? 0
    if (!open) return { id, state: 'locked', stars: best }
    if (isPassed(completedSessions(sessions, id), best)) return { id, state: 'done', stars: best }
    open = false
    return { id, state: 'current', stars: best }
  })
}
