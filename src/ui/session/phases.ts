import world1 from '@content/phases/world-1.json'

/** Sprint 2: sessão só de adição, nas fases 1 a 7 do Mundo 1, em ordem fixa (a P08 é o Grande Desafio). */
export interface SessionPhase {
  id: string
  facts: string[]
}

export const SESSION_PHASES: readonly SessionPhase[] = world1.phases
  .filter((p) => !p.grandChallenge)
  .slice(0, 7)
  .map((p) => ({ id: p.id, facts: p.newFacts }))

export const PHASE_OF_FACT: ReadonlyMap<string, string> = new Map(
  SESSION_PHASES.flatMap((p) => p.facts.map((f) => [f, p.id] as const)),
)
