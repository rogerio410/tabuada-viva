import type { Clock, Rng } from '@domain/ports/clock'
import type { AttemptRepo } from '@domain/ports/attempt-repo'
import type { FactStateRepo } from '@domain/ports/fact-state-repo'
import type { SessionRepo } from '@domain/ports/session-repo'
import type {
  Attempt,
  ChildId,
  FactState,
  FactStatus,
  Session,
  SupportKind,
} from '@domain/ports/types'
import { parseFactId } from '@domain/facts/fact-id'
import { presentFact } from '@domain/scheduler/apply-answer'
import { recordAttempt } from '@domain/scheduler/record-attempt'
import { isUnsupported } from '@domain/support/support'
import { autoOpenSupports } from '@domain/support/auto-open'
import { shouldSuggestRest } from '@domain/session/rest'
import { buildSession, reinsertAfterError, type SessionItem } from '@domain/session/build-session'
import { PHASE_OF_FACT, SESSION_PHASES } from './phases'

export interface Services {
  childId: ChildId
  facts: FactStateRepo
  attempts: AttemptRepo
  sessions: SessionRepo
  clock: Clock
  rng: Rng
  newId: () => string
}

export interface Question {
  itemId: string
  factId: string
  a: number
  b: number
  answer: number
  status: FactStatus
  /** Apoios que a tela abre sozinha; só contam como usados se a criança os tocar. */
  autoSupports: SupportKind[]
  shownAt: Date
}

export interface Progress {
  done: number
  total: number
}

export type View =
  | { type: 'question'; question: Question; progress: Progress }
  | { type: 'rest-offer'; progress: Progress }
  | { type: 'done'; answered: number }

export interface Feedback {
  correct: boolean
  given: number
  question: Question
  /** Apoios registrados nesta resposta (vazio = sem apoio). */
  supportsUsed: SupportKind[]
}

/** Fase atual: a primeira das fases 1 a 7 que ainda tem fato nunca apresentado. */
export function currentPhaseFacts(states: readonly FactState[]): string[] {
  const seen = new Set(states.filter((s) => s.status !== 'novo').map((s) => s.factId))
  const phase = SESSION_PHASES.find((p) => p.facts.some((f) => !seen.has(f)))
  return (phase ?? SESSION_PHASES[SESSION_PHASES.length - 1]!).facts
}

/**
 * Orquestra uma sessão: monta a fila com o motor, grava cada resposta e cada item, devolve o que a tela mostra.
 * Sem React e sem I/O próprio: tudo entra por `Services`. A sessão reabre do aparelho (`resume`) refazendo a
 * fila a partir dos estados salvos.
 */
export class SessionController {
  private svc: Services
  private session: Session
  private queue: SessionItem[] = []
  private index = 0
  private restOffered = false
  private wrapping = false
  private question: Question | null = null

  private constructor(svc: Services, session: Session) {
    this.svc = svc
    this.session = session
  }

  /** Retoma a sessão aberta da criança ou começa uma nova. */
  static async open(svc: Services): Promise<SessionController> {
    const all = await svc.sessions.listByChild(svc.childId)
    const open = all.filter((s) => s.endedAt === null).at(-1)
    const session: Session = open ?? {
      id: svc.newId(),
      childId: svc.childId,
      startedAt: svc.clock.now(),
      endedAt: null,
      itemCount: 0,
      accuracy: null,
    }
    if (!open) await svc.sessions.save(session)
    return new SessionController(svc, session)
  }

  get progress(): Progress {
    const done = this.session.itemCount
    return { done, total: done + Math.max(0, this.queue.length - this.index) }
  }

  /** Mostra o próximo item (ou o convite a descansar, ou o fim). */
  async next(): Promise<View> {
    if (
      !this.restOffered &&
      !this.wrapping &&
      shouldSuggestRest(this.session.startedAt, this.svc.clock.now())
    ) {
      this.restOffered = true
      return { type: 'rest-offer', progress: this.progress }
    }
    if (this.index >= this.queue.length) {
      if (this.wrapping || !(await this.refill())) return this.finish()
    }
    const item = this.queue[this.index]!
    return { type: 'question', question: await this.present(item), progress: this.progress }
  }

  /** A criança aceitou descansar: só falta um item do fechamento. */
  async rest(): Promise<View> {
    this.wrapping = true
    const states = await this.svc.facts.listByChild(this.svc.childId)
    const closing = this.plan(states).find((i) => i.kind === 'closing')
    this.queue = closing ? [closing] : []
    this.index = 0
    return this.next()
  }

  /** A criança escolheu continuar: nenhuma punição, o convite não volta. */
  keepGoing(): Promise<View> {
    return this.next()
  }

  async answer(given: number, firstTouchAt: Date, supportsUsed: SupportKind[]): Promise<Feedback> {
    const q = this.question
    if (!q) throw new Error('nenhuma pergunta aberta')
    const now = this.svc.clock.now()
    const correct = given === q.answer
    const attempt: Attempt = {
      childId: this.svc.childId,
      sessionId: this.session.id,
      itemId: q.itemId,
      factId: q.factId,
      answer: given,
      correct,
      // D2: do aparecimento da conta ao primeiro toque de resposta; nunca mostrado.
      timeMs: Math.max(0, firstTouchAt.getTime() - q.shownAt.getTime()),
      supportsUsed,
      errorType: null,
      phaseId: PHASE_OF_FACT.get(q.factId) ?? null,
      kind: 'fact',
      createdAt: now,
    }
    const prev = await this.svc.facts.get(this.svc.childId, q.factId)
    const prior = (await this.svc.attempts.listByFact(this.svc.childId, q.factId))
      .filter((a) => a.correct)
      .map((a) => a.timeMs)
    const result = recordAttempt(prev, attempt, prior, now)
    await this.svc.attempts.add(attempt)
    await this.svc.facts.save(result.state)

    if (result.returnToQueue)
      this.queue = reinsertAfterError(this.queue, q.factId, this.index, this.svc.rng)
    this.index++
    this.question = null

    const answers = await this.svc.attempts.listBySession(this.session.id)
    this.session = {
      ...this.session,
      itemCount: answers.length,
      accuracy: answers.filter((a) => a.correct && isUnsupported(a)).length / answers.length,
    }
    await this.svc.sessions.save(this.session)
    return { correct, given, question: q, supportsUsed }
  }

  private plan(states: FactState[]): SessionItem[] {
    return buildSession(
      {
        childId: this.svc.childId,
        states,
        phaseFacts: currentPhaseFacts(states),
        gateOpen: false,
        storyItems: 0,
      },
      this.svc.rng,
      this.svc.clock.now(),
    ).items
  }

  /** Fila esgotada: novo plano com os estados atuais. Sem o fechamento no meio da sessão. */
  private async refill(): Promise<boolean> {
    const states = await this.svc.facts.listByChild(this.svc.childId)
    const items = this.plan(states).filter((i) => i.kind !== 'closing')
    this.queue = items
    this.index = 0
    return items.length > 0
  }

  private async present(item: SessionItem): Promise<Question> {
    const factId = item.factId!
    for (const id of item.unit ?? [factId]) {
      if (!(await this.svc.facts.get(this.svc.childId, id)))
        await this.svc.facts.save(presentFact(this.svc.childId, id, this.svc.clock.now()))
    }
    const state = await this.svc.facts.get(this.svc.childId, factId)
    const fact = parseFactId(factId)
    if (!fact || fact.op !== 'add') throw new Error(`Sprint 2 só tem adição: ${factId}`)
    const status = state?.status ?? 'aprendendo'
    this.question = {
      itemId: this.svc.newId(),
      factId,
      a: fact.a,
      b: fact.b,
      answer: fact.result,
      status,
      autoSupports: autoOpenSupports(status),
      shownAt: this.svc.clock.now(),
    }
    return this.question
  }

  private async finish(): Promise<View> {
    this.session = { ...this.session, endedAt: this.svc.clock.now() }
    await this.svc.sessions.save(this.session)
    return { type: 'done', answered: this.session.itemCount }
  }
}
