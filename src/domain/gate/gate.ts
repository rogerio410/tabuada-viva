import { PARAMS } from '../config/params'
import { factsOf } from '../facts/catalog'
import type { Rng } from '../ports/clock'
import type { Attempt, FactState } from '../ports/types'
import { addDays } from '../scheduler/apply-answer'
import { isUnsupported } from '../support/support'

/**
 * Portão da Multiplicação (docs/gdd/portao.md, G1–G6). Funções puras `(estado, relógio) → { ok, progress }`.
 * A interface só pergunta "está aberto?" e não tem como forçar: `openGate` exige todos os critérios E a confirmação
 * do adulto. Nada fecha de novo depois de aberto (sem punição); este módulo só avalia e autoriza a abertura.
 */
export interface Progress {
  done: number
  total: number
}
export interface Criterion {
  ok: boolean
  progress: Progress
}

export interface GateInput {
  factStates: readonly FactState[]
  attempts: readonly Attempt[]
  /** Fases que apresentam uma ferramenta (apoio automático); suas respostas não entram no G5 (D8). */
  toolPhaseIds: ReadonlySet<string>
}

export interface GateStatus {
  g1: Criterion
  g2: Criterion
  g3: Criterion
  g4: Criterion
  g5: Criterion
  g6: Criterion
  readyToOpen: boolean
}

const G = PARAMS.gate
const EPS = 1e-9
const ADD_IDS = factsOf('add').map((f) => f.id)
const SUB_IDS = factsOf('sub').map((f) => f.id)

/** G1/G2: todos os fatos em Fluente ou Dominado e a fração pedida em Dominado. */
function masteryCriterion(
  ids: readonly string[],
  states: ReadonlyMap<string, FactState>,
  ratio: number,
): Criterion {
  let mastered = 0
  let allFluent = true
  for (const id of ids) {
    const status = states.get(id)?.status
    if (status === 'dominado') mastered++
    else if (status !== 'fluente') allFluent = false
  }
  return {
    ok: allFluent && mastered / ids.length >= ratio - EPS,
    progress: { done: mastered, total: ids.length },
  }
}

/** G3: acerto nos triângulos completados (família de fatos). */
function familyCriterion(attempts: readonly Attempt[]): Criterion {
  const fam = attempts.filter((a) => a.kind === 'family')
  const correct = fam.filter((a) => a.correct).length
  return {
    ok: fam.length > 0 && correct / fam.length >= G.familyAccuracy - EPS,
    progress: { done: correct, total: fam.length },
  }
}

/** G4: problemas aditivos: escolha da operação E cálculo. Erro de escolha = `wrong_operation`. */
function additiveProblemCriterion(attempts: readonly Attempt[]): Criterion {
  const stories = attempts.filter(
    (a) => a.kind === 'story' && (a.factId === null || /^(add|sub):/.test(a.factId)),
  )
  const wrongChoice = stories.filter((a) => a.errorType === 'wrong_operation').length
  const chosenRight = stories.length - wrongChoice
  const correct = stories.filter((a) => a.correct).length
  const ok =
    stories.length > 0 &&
    chosenRight > 0 &&
    chosenRight / stories.length >= G.additiveProblemAccuracy - EPS &&
    correct / chosenRight >= G.additiveProblemAccuracy - EPS
  return { ok, progress: { done: correct, total: stories.length } }
}

/** G5: taxa de apoio estritamente abaixo de 10% nas últimas 2 semanas (D8). */
function supportCriterion(
  input: GateInput,
  states: ReadonlyMap<string, FactState>,
  now: Date,
): Criterion {
  const from = addDays(now, -G.supportWindowWeeks * 7).getTime()
  const eligible = input.attempts.filter((a) => {
    const t = a.createdAt.getTime()
    if (t < from || t > now.getTime() || a.factId === null) return false
    if (a.phaseId !== null && input.toolPhaseIds.has(a.phaseId)) return false
    const status = states.get(a.factId)?.status
    return status === 'praticando' || status === 'fluente' || status === 'dominado'
  })
  const supported = eligible.filter((a) => !isUnsupported(a)).length
  return {
    ok: eligible.length > 0 && supported / eligible.length < G.supportRateBelow,
    progress: { done: eligible.length - supported, total: eligible.length },
  }
}

/** Provas válidas: 40 itens, nenhum com apoio, acerto ≥ 95%. Cada prova é o conjunto de respostas de uma sessão. */
function validProofDates(attempts: readonly Attempt[]): Date[] {
  const bySession = new Map<string, Attempt[]>()
  for (const a of attempts)
    if (a.kind === 'proof') bySession.set(a.sessionId, [...(bySession.get(a.sessionId) ?? []), a])
  const dates: Date[] = []
  for (const items of bySession.values()) {
    const correct = items.filter((a) => a.correct).length
    if (
      items.length === G.proofItems &&
      items.every(isUnsupported) &&
      correct / items.length >= G.proofAccuracy - EPS
    )
      dates.push(new Date(Math.max(...items.map((a) => a.createdAt.getTime()))))
  }
  return dates.sort((a, b) => a.getTime() - b.getTime())
}

/** G6: `proofsRequired` provas válidas, cada uma ≥ `proofMinDaysApart` dias depois da anterior contada. */
function proofCriterion(attempts: readonly Attempt[]): Criterion {
  let counted = 0
  let last: Date | null = null
  for (const d of validProofDates(attempts)) {
    if (last === null || addDays(last, G.proofMinDaysApart).getTime() <= d.getTime()) {
      counted++
      last = d
      if (counted === G.proofsRequired) break
    }
  }
  return { ok: counted >= G.proofsRequired, progress: { done: counted, total: G.proofsRequired } }
}

export function gateStatus(input: GateInput, now: Date): GateStatus {
  const states = new Map(input.factStates.map((s) => [s.factId, s]))
  const g1 = masteryCriterion(ADD_IDS, states, G.additionMasteredRatio)
  const g2 = masteryCriterion(SUB_IDS, states, G.subtractionMasteredRatio)
  const g3 = familyCriterion(input.attempts)
  const g4 = additiveProblemCriterion(input.attempts)
  const g5 = supportCriterion(input, states, now)
  const g6 = proofCriterion(input.attempts)
  return { g1, g2, g3, g4, g5, g6, readyToOpen: [g1, g2, g3, g4, g5, g6].every((c) => c.ok) }
}

export type GateOpenResult =
  { opened: true } | { opened: false; reason: 'not-ready' | 'not-confirmed' }

/** Só abre com todos os critérios E a confirmação do adulto (PIN verificado fora do domínio). */
export function openGate(status: GateStatus, adultConfirmed: boolean): GateOpenResult {
  if (!status.readyToOpen) return { opened: false, reason: 'not-ready' }
  if (!adultConfirmed) return { opened: false, reason: 'not-confirmed' }
  return { opened: true }
}

/** Um item da Prova do Portão: fato avulso, família ou problema curto; o banco de itens vem de quem chama. */
export interface ProofItem {
  kind: 'fact' | 'family' | 'story'
  factId: string | null
  key: string
}

/** Sorteia os itens da prova do banco de itens, sem repetir, por `Rng` injetado (G6). */
export function drawProofItems<T extends ProofItem>(pool: readonly T[], rng: Rng): T[] {
  if (pool.length < G.proofItems)
    throw new Error(`banco com ${pool.length} itens; a prova precisa de ${G.proofItems}`)
  const a = [...pool]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a.slice(0, G.proofItems)
}

const DAY_MS = 24 * 60 * 60 * 1000
const wait = (s: FactState, now: Date) =>
  s.nextReview ? Math.max(0, Math.ceil((s.nextReview.getTime() - now.getTime()) / DAY_MS)) : 0

/** Menor número de dias até Dominado, praticando todas as oportunidades, pelas regras do motor (D1). */
function daysToDominated(s: FactState | undefined, now: Date): number {
  if (!s || s.status === 'novo' || s.status === 'aprendendo') return (s ? wait(s, now) : 0) + 9
  if (s.status === 'praticando') return wait(s, now) + (s.fastDays.length >= 1 ? 5 : 7)
  if (s.status === 'fluente') return wait(s, now)
  return 0
}
function daysToFluent(s: FactState | undefined, now: Date): number {
  if (!s || s.status === 'novo' || s.status === 'aprendendo') return (s ? wait(s, now) : 0) + 4
  if (s.status === 'praticando') return wait(s, now) + (s.fastDays.length >= 1 ? 0 : 2)
  return 0
}

/**
 * LIMITE INFERIOR, em dias, até o Portão poder abrir (G1/G2 + o intervalo entre as duas provas), se a criança
 * praticar em todas as oportunidades e acertar rápido. Não promete data: G3 a G5 dependem de evidência. É mais
 * otimista que os "4 a 5 semanas" de portao.md, que contam também o retorno de 14 dias de Dominado; o painel
 * deve mostrar o prazo mais prudente ao adulto.
 */
export function estimatedMinDaysToOpen(factStates: readonly FactState[], now: Date): number {
  const states = new Map(factStates.map((s) => [s.factId, s]))
  const forSet = (ids: readonly string[], ratio: number) => {
    const toFluent = Math.max(...ids.map((id) => daysToFluent(states.get(id), now)))
    const need = Math.ceil(ids.length * ratio - EPS)
    const toDominated = ids.map((id) => daysToDominated(states.get(id), now)).sort((a, b) => a - b)
    return Math.max(toFluent, toDominated[need - 1] ?? 0)
  }
  return (
    Math.max(
      forSet(ADD_IDS, G.additionMasteredRatio),
      forSet(SUB_IDS, G.subtractionMasteredRatio),
    ) + G.proofMinDaysApart
  )
}
