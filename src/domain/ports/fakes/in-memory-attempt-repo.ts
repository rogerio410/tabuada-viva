import type { AttemptRepo } from '../attempt-repo'
import type { Attempt, ChildId, FactId, SessionId } from '../types'

const copy = (a: Attempt): Attempt => ({
  ...a,
  supportsUsed: [...a.supportsUsed],
  createdAt: new Date(a.createdAt),
})

export class InMemoryAttemptRepo implements AttemptRepo {
  private rows: Attempt[] = []

  async add(attempt: Attempt) {
    this.rows.push(copy(attempt))
  }
  async listBySession(sessionId: SessionId) {
    return this.rows.filter((a) => a.sessionId === sessionId).map(copy)
  }
  async listByChild(childId: ChildId, range: { from?: Date; to?: Date } = {}) {
    return this.rows
      .filter((a) => a.childId === childId)
      .filter((a) => !range.from || a.createdAt >= range.from)
      .filter((a) => !range.to || a.createdAt < range.to)
      .map(copy)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }
  async listByFact(childId: ChildId, factId: FactId) {
    return this.rows.filter((a) => a.childId === childId && a.factId === factId).map(copy)
  }
  async deleteByChild(childId: ChildId) {
    this.rows = this.rows.filter((a) => a.childId !== childId)
  }
}
