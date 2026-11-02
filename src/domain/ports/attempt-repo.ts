import type { Attempt, ChildId, FactId, SessionId } from './types'

export interface AttemptRepo {
  add(attempt: Attempt): Promise<void>
  listBySession(sessionId: SessionId): Promise<Attempt[]>
  /** Respostas com `createdAt` em [from, to), em ordem cronológica. */
  listByChild(childId: ChildId, range?: { from?: Date; to?: Date }): Promise<Attempt[]>
  listByFact(childId: ChildId, factId: FactId): Promise<Attempt[]>
  /** Direito de apagar (LGPD). */
  deleteByChild(childId: ChildId): Promise<void>
}
