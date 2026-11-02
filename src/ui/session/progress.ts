import { phaseStatuses, type PhaseStatus } from '@domain/progress/phase-progress'
import { PHASE_ORDER } from './phases'
import type { Services } from './session-controller'

/** Estado de cada fase do mapa (liberada, atual, bloqueada) e as estrelas guardadas no aparelho. */
export async function loadProgress(svc: Services): Promise<PhaseStatus[]> {
  const [sessions, wallet] = await Promise.all([
    svc.sessions.listByChild(svc.childId),
    svc.wallet.get(svc.childId),
  ])
  return phaseStatuses(PHASE_ORDER, sessions, wallet.stars)
}
