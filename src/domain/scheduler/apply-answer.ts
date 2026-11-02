import { PARAMS } from '../config/params'
import type { ChildId, FactId, FactState, FactStatus } from '../ports/types'

/** Resposta já resolvida por quem chama: `supported` vem de `supportsUsed`, `fast` de `isFast`. */
export interface AnswerOutcome {
  correct: boolean
  fast: boolean
  supported: boolean
}

export interface AnswerResult {
  state: FactState
  /** Erro: o fato volta à mesma sessão após `errorReturnAfterItems` itens (quem monta a fila decide onde). */
  returnToQueue: boolean
}

type Active = Exclude<FactStatus, 'novo'>

/** Soma dias de CALENDÁRIO (hora local), seguro na virada de horário de verão. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Dia local YYYY-MM-DD (D1: "dias de calendário diferentes"). */
export function dayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** Apresentar um fato novo o cria em Aprendendo, para revisar já na sessão. */
export function presentFact(childId: ChildId, factId: FactId, now: Date): FactState {
  return {
    childId,
    factId,
    status: 'aprendendo',
    nextReview: new Date(now),
    streak: 0,
    fastDays: [],
    correct: 0,
    wrong: 0,
    medianMs: null,
  }
}

const interval = (s: Active) => PARAMS.reviewIntervalDays[s]

/**
 * Transição de estado de um fato (D1; tabela de docs/gdd/mecanica-aprendizagem.md). Pura: não muta a entrada.
 * Só atualiza `status`, `nextReview`, `streak` e `fastDays`; contadores e tempo mediano são de quem persiste a Attempt.
 */
export function applyAnswer(state: FactState, answer: AnswerOutcome, now: Date): AnswerResult {
  const status: Active = state.status === 'novo' ? 'aprendendo' : state.status
  const was: FactState = { ...state, status, fastDays: [...state.fastDays] }
  const wasDue = state.nextReview !== null && state.nextReview.getTime() <= now.getTime()

  const to = (next: Active, patch: Partial<FactState> = {}): FactState => ({
    ...was,
    status: next,
    nextReview: addDays(now, interval(next)),
    ...patch,
  })

  if (!answer.correct) {
    // Erro: desce um nível (mínimo Aprendendo), reinicia o intervalo e volta à fila.
    const down: Record<Active, Active> = {
      aprendendo: 'aprendendo',
      praticando: 'aprendendo',
      fluente: 'praticando',
      dominado: 'fluente',
    }
    return { state: to(down[status], { streak: 0, fastDays: [] }), returnToQueue: true }
  }

  const cleanFast = answer.fast && !answer.supported
  const cleanAnswer = !answer.supported

  switch (status) {
    case 'aprendendo': {
      if (!cleanAnswer) return { state: to('aprendendo'), returnToQueue: false } // apoio: sequência não avança
      const streak = was.streak + 1
      return streak >= PARAMS.streakToPracticing
        ? { state: to('praticando', { streak: 0, fastDays: [] }), returnToQueue: false }
        : { state: to('aprendendo', { streak }), returnToQueue: false }
    }
    case 'praticando': {
      if (!cleanFast) return { state: to('praticando'), returnToQueue: false }
      const fastDays = was.fastDays.includes(dayKey(now))
        ? was.fastDays
        : [...was.fastDays, dayKey(now)]
      return fastDays.length >= PARAMS.fluentDistinctDays
        ? { state: to('fluente', { fastDays: [] }), returnToQueue: false }
        : { state: to('praticando', { fastDays }), returnToQueue: false }
    }
    case 'fluente': {
      if (cleanFast && wasDue) return { state: to('dominado'), returnToQueue: false }
      // "acerto do dia": rápido, sem apoio, fora da revisão vencida: nada muda
      if (cleanFast) return { state: was, returnToQueue: false }
      return { state: to('fluente'), returnToQueue: false } // lento ou com apoio: fica, não promove
    }
    case 'dominado': {
      if (answer.supported) return { state: to('fluente'), returnToQueue: false }
      if (answer.fast) return { state: to('dominado'), returnToQueue: false }
      // lento sem apoio: fica, mas a revisão vem mais cedo (5 dias = intervalo de Fluente)
      return {
        state: { ...was, status: 'dominado', nextReview: addDays(now, interval('fluente')) },
        returnToQueue: false,
      }
    }
  }
}
