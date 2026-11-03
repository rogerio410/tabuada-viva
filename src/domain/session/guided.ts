import { PARAMS } from '../config/params'
import type { Rng } from '../ports/clock'
import type { FactState, FactStatus } from '../ports/types'

/** Quantos fatos entram em foco na prática guiada (cada um aparece pelo menos 2 vezes). */
export const GUIDED_FOCUS_MAX = Math.floor(PARAMS.guidedPracticeItems.max / 2)

export type Scaffold = 'full' | 'button' | 'none'

const RANK: Record<FactStatus, number> = {
  novo: 0,
  aprendendo: 1,
  praticando: 2,
  fluente: 3,
  dominado: 4,
}

function shuffled<T>(xs: readonly T[], rng: Rng): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Prática guiada da 1ª sessão de uma fase (fonte L168): de `guidedPracticeItems.min` a `.max` itens com os fatos da
 * fase. Fatos nunca vistos (ou nos estados mais baixos) entram primeiro, até `GUIDED_FOCUS_MAX` em foco, e cada um
 * aparece pelo menos 2 vezes, intercalados (nunca o mesmo fato duas vezes seguidas, salvo se só há um). Pura.
 */
export function guidedItems(
  phaseFacts: readonly string[],
  states: readonly FactState[],
  rng: Rng,
): string[] {
  if (phaseFacts.length === 0) return []
  const rank = new Map(states.map((s) => [s.factId, RANK[s.status]]))
  const order = new Map(phaseFacts.map((f, i) => [f, i]))
  const focus = [...new Set(phaseFacts)]
    .sort(
      (a, b) =>
        (rank.get(a) ?? 0) - (rank.get(b) ?? 0) || (order.get(a) ?? 0) - (order.get(b) ?? 0),
    )
    .slice(0, GUIDED_FOCUS_MAX)

  const { min, max } = PARAMS.guidedPracticeItems
  const total = Math.min(max, Math.max(min, focus.length * 2))
  const rounds = Math.ceil(total / focus.length)
  const items: string[] = []
  for (let r = 0; r < rounds; r++) {
    let round = shuffled(focus, rng)
    // evita repetir o último da rodada anterior logo no começo da próxima
    if (round.length > 1 && round[0] === items.at(-1)) round = [...round.slice(1), round[0]!]
    items.push(...round)
  }
  return items.slice(0, total)
}

/**
 * Apoio da prática guiada: o primeiro terço com a ferramenta aberta e dica passo a passo, o segundo terço só no
 * botão de ajuda, o último sem apoio. Nunca volta a aumentar.
 */
export function scaffoldFor(index: number, total: number): Scaffold {
  if (index < Math.ceil(total / 3)) return 'full'
  if (index < Math.ceil((total * 2) / 3)) return 'button'
  return 'none'
}
