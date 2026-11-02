import type { FactStateRepo } from '../fact-state-repo'
import type { ChildId, FactId, FactState, FactStatus } from '../types'

const ORDER: Record<FactStatus, number> = {
  novo: 0,
  aprendendo: 1,
  praticando: 2,
  fluente: 3,
  dominado: 4,
}

const copy = (s: FactState): FactState => ({
  ...s,
  nextReview: s.nextReview ? new Date(s.nextReview) : null,
  fastDays: [...s.fastDays],
})

export class InMemoryFactStateRepo implements FactStateRepo {
  private rows = new Map<string, FactState>()
  private key = (c: ChildId, f: FactId) => `${c}|${f}`

  async get(childId: ChildId, factId: FactId) {
    const s = this.rows.get(this.key(childId, factId))
    return s && copy(s)
  }
  async save(state: FactState) {
    this.rows.set(this.key(state.childId, state.factId), copy(state))
  }
  async listByChild(childId: ChildId) {
    return [...this.rows.values()].filter((s) => s.childId === childId).map(copy)
  }
  async listDue(childId: ChildId, now: Date) {
    return (await this.listByChild(childId))
      .filter((s) => s.nextReview !== null && s.nextReview.getTime() <= now.getTime())
      .sort((a, b) => ORDER[a.status] - ORDER[b.status])
  }
  async deleteByChild(childId: ChildId) {
    for (const [k, s] of this.rows) if (s.childId === childId) this.rows.delete(k)
  }
}
