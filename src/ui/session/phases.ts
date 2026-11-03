import world1 from '@content/phases/world-1.json'
import world2 from '@content/phases/world-2.json'

/** Fase do jogo (catálogo de `src/content/phases`). Sprint 3: Mundos 1 e 2, em ordem fixa. */
export interface GamePhase {
  id: string
  name: string
  world: 1 | 2
  newFacts: string[]
  grandChallenge: boolean
}

export const GAME_PHASES: readonly GamePhase[] = [
  ...world1.phases.map((p) => ({ ...p, world: 1 as const })),
  ...world2.phases.map((p) => ({ ...p, world: 2 as const })),
]

export const PHASE_ORDER: readonly string[] = GAME_PHASES.map((p) => p.id)

export const phaseById = (id: string): GamePhase | undefined => GAME_PHASES.find((p) => p.id === id)

/**
 * Fatos que a fase apresenta. O Grande Desafio não tem fato novo: mistura tudo do mundo (por enquanto sem
 * histórias; elas chegam no Sprint 3b).
 */
export function phaseFactsFor(phaseId: string): string[] {
  const phase = phaseById(phaseId)
  if (!phase) throw new Error(`fase desconhecida: ${phaseId}`)
  if (!phase.grandChallenge) return phase.newFacts
  return GAME_PHASES.filter((p) => p.world === phase.world).flatMap((p) => p.newFacts)
}
