import type { Clock, Rng } from '@domain/ports/clock'
import type { AttemptRepo } from '@domain/ports/attempt-repo'
import type { FactStateRepo } from '@domain/ports/fact-state-repo'
import type { SessionRepo } from '@domain/ports/session-repo'
import type { WalletRepo } from '@domain/ports/wallet-repo'
import type {
  Attempt,
  AttemptKind,
  ChildId,
  FactStatus,
  Session,
  SupportKind,
} from '@domain/ports/types'
import { FACT_BY_ID } from '@domain/facts/catalog'
import { parseFactId } from '@domain/facts/fact-id'
import { classifyError } from '@domain/errors/classify-error'
import { evaluatePhase, type PhaseEvaluation, type Stars } from '@domain/progress/phase-progress'
import { presentFact } from '@domain/scheduler/apply-answer'
import { recordAttempt } from '@domain/scheduler/record-attempt'
import { isUnsupported } from '@domain/support/support'
import { autoOpenSupports } from '@domain/support/auto-open'
import { shouldSuggestRest } from '@domain/session/rest'
import { adaptNextSession } from '@domain/session/adapt'
import { buildSession, reinsertAfterError, type SessionItem } from '@domain/session/build-session'
import { phaseFactsFor } from './phases'

export interface Services {
  childId: ChildId
  facts: FactStateRepo
  attempts: AttemptRepo
  sessions: SessionRepo
  wallet: WalletRepo
  clock: Clock
  rng: Rng
  newId: () => string
}

export interface Question {
  itemId: string
  factId: string
  op: 'add' | 'sub'
  a: number
  b: number
  answer: number
  status: FactStatus
  /** Conta da família de fatos do triângulo (Attempt.kind = 'family'). */
  family: boolean
  /** Apoios que a tela abre sozinha; só contam como usados se a criança os tocar. */
  autoSupports: SupportKind[]
  shownAt: Date
}

export interface Progress {
  done: number
  total: number
}

export interface PhaseResult extends PhaseEvaluation {
  phaseId: string
}

export type View =
  | { type: 'question'; question: Question; progress: Progress }
  | { type: 'rest-offer'; progress: Progress }
  | { type: 'done'; answered: number; result: PhaseResult }

export interface Feedback {
  correct: boolean
  given: number
  question: Question
  /** Apoios registrados nesta resposta (vazio = sem apoio). */
  supportsUsed: SupportKind[]
}

/** Item da fila; `family` marca as contas do triângulo geradas na hora. */
type QueueItem = SessionItem & { family?: boolean }

/**
 * Orquestra uma sessão de uma fase: monta a fila com o motor, grava cada resposta e cada item, devolve o que a tela
 * mostra e, ao fim, as estrelas da fase. Sem React e sem I/O próprio: tudo entra por `Services`. A sessão aberta
 * de uma fase reabre do aparelho (`open`) refazendo a fila a partir dos estados salvos.
 */
export class SessionController {
  private svc: Services
  private session: Session
  private phaseId: string
  private queue: QueueItem[] = []
  private index = 0
  private restOffered = false
  private wrapping = false
  private maxNew: number
  private question: Question | null = null

  private constructor(svc: Services, session: Session, phaseId: string, maxNew: number) {
    this.svc = svc
    this.session = session
    this.phaseId = phaseId
    this.maxNew = maxNew
  }

  /** Retoma a sessão aberta desta fase ou começa uma nova. */
  static async open(svc: Services, phaseId: string): Promise<SessionController> {
    phaseFactsFor(phaseId) // fase inexistente falha cedo
    const all = await svc.sessions.listByChild(svc.childId)
    const open = all.filter((s) => s.endedAt === null && s.phaseId === phaseId).at(-1)
    const session: Session = open ?? {
      id: svc.newId(),
      childId: svc.childId,
      phaseId,
      startedAt: svc.clock.now(),
      endedAt: null,
      itemCount: 0,
      accuracy: null,
    }
    if (!open) await svc.sessions.save(session)
    const history = all.filter((s) => s.endedAt !== null).map((s) => ({ accuracy: s.accuracy }))
    return new SessionController(svc, session, phaseId, adaptNextSession(history).maxNew)
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
    this.expandFamily()
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
    const kind: AttemptKind = q.family ? 'family' : 'fact'
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
      errorType: correct ? null : classifyError({ kind: 'fact', factId: q.factId }, given),
      // a resposta leva a fase da sessão (revisões de fases anteriores contam na fase que a criança joga)
      phaseId: this.phaseId,
      kind,
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

  private plan(states: Awaited<ReturnType<FactStateRepo['listByChild']>>): SessionItem[] {
    return buildSession(
      {
        childId: this.svc.childId,
        states,
        phaseFacts: phaseFactsFor(this.phaseId),
        gateOpen: false,
        storyItems: 0, // histórias: Sprint 3b
        maxNew: this.maxNew,
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

  /**
   * Triângulo novo de subtração (D16): em vez de uma conta, a família — a soma de origem e os fatos de subtração
   * do triângulo, em sequência. Regras (−0, n−n) e fatos já gerados não expandem.
   */
  private expandFamily() {
    const item = this.queue[this.index]
    if (!item || item.kind !== 'new' || item.family || item.factId === null) return
    const fact = FACT_BY_ID.get(item.factId)
    if (!fact || fact.op !== 'sub' || fact.rule) return
    const ids = [fact.root[0]!, ...(item.unit ?? [fact.id])]
    this.queue.splice(
      this.index,
      1,
      ...ids.map((factId): QueueItem => ({ kind: 'new', factId, family: true })),
    )
  }

  private async present(item: QueueItem): Promise<Question> {
    const factId = item.factId!
    for (const id of item.unit ?? [factId]) {
      if (!(await this.svc.facts.get(this.svc.childId, id)))
        await this.svc.facts.save(presentFact(this.svc.childId, id, this.svc.clock.now()))
    }
    const state = await this.svc.facts.get(this.svc.childId, factId)
    const fact = parseFactId(factId)
    if (!fact || (fact.op !== 'add' && fact.op !== 'sub'))
      throw new Error(`Mundos 1 e 2 só têm adição e subtração: ${factId}`)
    const status = state?.status ?? 'aprendendo'
    this.question = {
      itemId: this.svc.newId(),
      factId,
      op: fact.op,
      a: fact.a,
      b: fact.b,
      answer: fact.result,
      status,
      family: item.family === true,
      autoSupports: autoOpenSupports(status),
      shownAt: this.svc.clock.now(),
    }
    return this.question
  }

  private async finish(): Promise<View> {
    this.session = { ...this.session, endedAt: this.svc.clock.now() }
    await this.svc.sessions.save(this.session)
    const [sessions, attempts, wallet] = await Promise.all([
      this.svc.sessions.listByChild(this.svc.childId),
      this.svc.attempts.listByChild(this.svc.childId),
      this.svc.wallet.get(this.svc.childId),
    ])
    const best = (wallet.stars[this.phaseId] ?? 0) as Stars
    const evaluation = evaluatePhase(sessions, attempts, this.phaseId, best)
    await this.svc.wallet.save({
      ...wallet,
      stars: { ...wallet.stars, [this.phaseId]: evaluation.stars },
    })
    return {
      type: 'done',
      answered: this.session.itemCount,
      result: { phaseId: this.phaseId, ...evaluation },
    }
  }
}
