import type { SessionRepo } from '../session-repo'
import type { ChildId, Session, SessionId } from '../types'

const copy = (s: Session): Session => ({
  ...s,
  startedAt: new Date(s.startedAt),
  endedAt: s.endedAt ? new Date(s.endedAt) : null,
})

export class InMemorySessionRepo implements SessionRepo {
  private rows = new Map<SessionId, Session>()

  async save(session: Session) {
    this.rows.set(session.id, copy(session))
  }
  async get(id: SessionId) {
    const s = this.rows.get(id)
    return s && copy(s)
  }
  async listByChild(childId: ChildId) {
    return [...this.rows.values()]
      .filter((s) => s.childId === childId)
      .map(copy)
      .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
  }
  async deleteByChild(childId: ChildId) {
    for (const [k, s] of this.rows) if (s.childId === childId) this.rows.delete(k)
  }
}
