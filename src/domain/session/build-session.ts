import { PARAMS } from '../config/params'
import { FACT_BY_ID } from '../facts/catalog'
import type { FactState, FactStatus } from '../ports/types'
import type { Rng } from '../ports/clock'

export type SessionItemKind = 'warmup' | 'review' | 'new' | 'story' | 'closing'

export interface SessionItem {
  kind: SessionItemKind
  /** Fato do item; null em história (o conteúdo vem do banco de histórias). */
  factId: string | null
  /** Em `new`: todos os fatos que a apresentação cobre (um triângulo, ou todos os de uma regra). */
  unit?: string[]
  /** A UI mostra a dica de estratégia nesta apresentação (D3: contou de um em um). */
  strategyHint?: boolean
}

export interface SessionPlan {
  items: SessionItem[]
  /** Duração-alvo; quem para a sessão é a UI. */
  sessionMinutes: { min: number; max: number }
}

export interface SessionInput {
  childId: string
  states: readonly FactState[]
  /** Fatos da fase atual, na ordem de apresentação. */
  phaseFacts: readonly string[]
  /** × e ÷ só entram com o Portão aberto (pilar: alicerce primeiro). */
  gateOpen: boolean
  /** Limite de itens novos (vem de `adaptNextSession`); padrão `maxNewFactsPerSession`. */
  maxNew?: number
  /** Quantas histórias (1 ou 2). */
  storyItems?: number
  /** Fatos com "contou de um em um" (`needsStrategyHint`): seus itens saem marcados com `strategyHint`. */
  slowCounting?: ReadonlySet<string>
}

const RANK: Record<FactStatus, number> = {
  novo: 0,
  aprendendo: 1,
  praticando: 2,
  fluente: 3,
  dominado: 4,
}
const blocked = (factId: string, gateOpen: boolean) => !gateOpen && /^(mul|div):/.test(factId)

function shuffled<T>(xs: readonly T[], rng: Rng): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** Unidade de apresentação (D16): regra = 1 item; − e ÷ = triângulo; + e × = o próprio fato. */
function unitKey(factId: string): string | null {
  const f = FACT_BY_ID.get(factId)
  if (!f) return null
  if (f.rule) return `rule:${f.op}`
  if (f.op === 'sub' || f.op === 'div') return `tri:${f.root[0]}`
  return factId
}

/** D16c: os irmãos − e ÷ só abrem quando o fato raiz está em Praticando ou acima. */
function rootReady(factId: string, byId: Map<string, FactState>): boolean {
  const f = FACT_BY_ID.get(factId)
  if (!f) return false
  if (f.op !== 'sub' && f.op !== 'div') return true
  const root = byId.get(f.root[0]!)
  return root !== undefined && RANK[root.status] >= RANK.praticando
}

/**
 * Monta uma sessão (D12): aquecimento → revisões vencidas → conteúdo novo → história → fechamento.
 * Pura e determinística: o tempo entra por `now`, o sorteio por `rng`. Não grava nada nem apresenta fatos:
 * quem executa o plano cria os `FactState` dos itens novos com `presentFact`.
 */
export function buildSession(input: SessionInput, rng: Rng, now: Date): SessionPlan {
  const { states, phaseFacts, gateOpen } = input
  const maxNew = input.maxNew ?? PARAMS.maxNewFactsPerSession
  const byId = new Map(states.map((s) => [s.factId, s]))
  const usable = states.filter((s) => s.status !== 'novo' && !blocked(s.factId, gateOpen))

  // 1. Aquecimento: fatos já dominados; sem dominados, os de maior estado disponível.
  const warmup: FactState[] = []
  for (const status of ['dominado', 'fluente', 'praticando', 'aprendendo'] as const) {
    if (warmup.length >= PARAMS.warmupFacts) break
    const pool = shuffled(
      usable.filter((s) => s.status === status),
      rng,
    )
    warmup.push(...pool.slice(0, PARAMS.warmupFacts - warmup.length))
  }
  const inWarmup = new Set(warmup.map((s) => s.factId))

  // 2. Revisões vencidas, do estado mais baixo ao mais alto (depois a mais antiga).
  const due = usable
    .filter(
      (s) =>
        s.nextReview !== null && s.nextReview.getTime() <= now.getTime() && !inWarmup.has(s.factId),
    )
    .sort(
      (a, b) =>
        RANK[a.status] - RANK[b.status] ||
        a.nextReview!.getTime() - b.nextReview!.getTime() ||
        a.factId.localeCompare(b.factId),
    )
  const knownDue = due.filter((s) => RANK[s.status] >= RANK.praticando)
  const fragile = due.filter((s) => s.status === 'aprendendo')
  const inPhase = new Set(phaseFacts)
  const fragileCurrent = fragile.filter((s) => inPhase.has(s.factId))
  const fragileOlder = fragile.filter((s) => !inPhase.has(s.factId))

  // 3. Conteúdo novo: unidades de apresentação da fase atual que a criança ainda não viu.
  const units = new Map<string, string[]>()
  for (const factId of phaseFacts) {
    const seen = byId.get(factId)
    if (seen && seen.status !== 'novo') continue
    if (blocked(factId, gateOpen) || !rootReady(factId, byId)) continue
    const key = unitKey(factId)
    if (key === null) continue
    units.set(key, [...(units.get(key) ?? []), factId])
  }
  const newUnits = [...units.values()].slice(0, Math.max(0, maxNew))

  // Dosagem ~70/30: frágeis + novos não passam de 30% do total quando há conhecidos.
  const knownCount = warmup.length + knownDue.length
  // floor com folga de ponto flutuante: 7 conhecidos permitem 3 não conhecidos (30%), nunca 4
  const budget =
    knownCount === 0
      ? Infinity
      : Math.max(
          1,
          Math.floor(
            (knownCount * PARAMS.knownToNewRatio.new) / PARAMS.knownToNewRatio.known + 1e-9,
          ),
        )
  const reserveNew = newUnits.length > 0 ? 1 : 0 // a fase nunca fica sem avançar por causa dos frágeis
  const fragileA = fragileCurrent.slice(0, Math.max(0, budget - reserveNew))
  const newTaken = newUnits.slice(
    0,
    Math.max(reserveNew, Math.min(newUnits.length, budget - fragileA.length)),
  )
  const fragileB = fragileOlder.slice(0, Math.max(0, budget - fragileA.length - newTaken.length))

  const reviews = [...knownDue, ...fragileA, ...fragileB].sort(
    (a, b) =>
      RANK[a.status] - RANK[b.status] ||
      a.nextReview!.getTime() - b.nextReview!.getTime() ||
      a.factId.localeCompare(b.factId),
  )

  const items: SessionItem[] = [
    ...warmup.map((s): SessionItem => ({ kind: 'warmup', factId: s.factId })),
    ...reviews.map((s): SessionItem => ({ kind: 'review', factId: s.factId })),
    ...newTaken.map((unit): SessionItem => ({ kind: 'new', factId: unit[0]!, unit })),
  ]

  // 4. História (1 ou 2 situações-problema).
  for (let i = 0; i < Math.max(0, input.storyItems ?? 1); i++)
    items.push({ kind: 'story', factId: null })

  // 5. Fechamento: um item fácil (fato já conhecido; prefere um que ainda não saiu).
  const planned = new Set(items.map((i) => i.factId))
  const easy = usable
    .filter((s) => RANK[s.status] >= RANK.praticando)
    .sort(
      (a, b) =>
        Number(planned.has(a.factId)) - Number(planned.has(b.factId)) ||
        RANK[b.status] - RANK[a.status] ||
        a.factId.localeCompare(b.factId),
    )[0]
  if (easy) items.push({ kind: 'closing', factId: easy.factId })

  const slow = input.slowCounting
  if (slow && slow.size > 0)
    for (const item of items)
      if (item.factId !== null && (slow.has(item.factId) || item.unit?.some((f) => slow.has(f))))
        item.strategyHint = true

  return { items, sessionMinutes: { ...PARAMS.sessionMinutes } }
}

/** Erro na sessão: o fato volta depois de `errorReturnAfterItems` (2 a 3) itens. Pura: devolve outra fila. */
export function reinsertAfterError(
  queue: readonly SessionItem[],
  factId: string,
  afterIndex: number,
  rng: Rng,
): SessionItem[] {
  const { min, max } = PARAMS.errorReturnAfterItems
  const gap = min + Math.floor(rng.next() * (max - min + 1))
  const at = Math.min(queue.length, afterIndex + 1 + gap)
  const out = [...queue]
  out.splice(at, 0, { kind: 'review', factId })
  return out
}
