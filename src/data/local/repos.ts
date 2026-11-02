import type { AttemptRepo } from '@domain/ports/attempt-repo'
import type { FactStateRepo } from '@domain/ports/fact-state-repo'
import type { SessionRepo } from '@domain/ports/session-repo'
import type { WalletRepo } from '@domain/ports/wallet-repo'
import type {
  Attempt,
  ChildId,
  FactId,
  FactState,
  FactStatus,
  Session,
  SessionId,
  Wallet,
} from '@domain/ports/types'
import type { AttemptRow, TabuadaDb } from './db'

const ORDER: Record<FactStatus, number> = {
  novo: 0,
  aprendendo: 1,
  praticando: 2,
  fluente: 3,
  dominado: 4,
}

const toAttempt = ({ id: _id, ...attempt }: AttemptRow): Attempt => attempt
const byTime = (a: Attempt, b: Attempt) => a.createdAt.getTime() - b.createdAt.getTime()

export class DexieFactStateRepo implements FactStateRepo {
  private db: TabuadaDb
  constructor(db: TabuadaDb) {
    this.db = db
  }

  get(childId: ChildId, factId: FactId) {
    return this.db.factStates.get([childId, factId])
  }
  async save(state: FactState) {
    await this.db.factStates.put(state)
  }
  listByChild(childId: ChildId) {
    return this.db.factStates.where('childId').equals(childId).toArray()
  }
  async listDue(childId: ChildId, now: Date) {
    return (await this.listByChild(childId))
      .filter((s) => s.nextReview !== null && s.nextReview.getTime() <= now.getTime())
      .sort((a, b) => ORDER[a.status] - ORDER[b.status])
  }
  async deleteByChild(childId: ChildId) {
    await this.db.factStates.where('childId').equals(childId).delete()
  }
}

export class DexieAttemptRepo implements AttemptRepo {
  private db: TabuadaDb
  constructor(db: TabuadaDb) {
    this.db = db
  }

  async add(attempt: Attempt) {
    await this.db.attempts.add({ ...attempt })
  }
  async listBySession(sessionId: SessionId) {
    const rows = await this.db.attempts.where('sessionId').equals(sessionId).sortBy('id')
    return rows.map(toAttempt)
  }
  async listByChild(childId: ChildId, range: { from?: Date; to?: Date } = {}) {
    const rows = await this.db.attempts.where('childId').equals(childId).toArray()
    return rows
      .map(toAttempt)
      .filter(
        (a) => (!range.from || a.createdAt >= range.from) && (!range.to || a.createdAt < range.to),
      )
      .sort(byTime)
  }
  async listByFact(childId: ChildId, factId: FactId) {
    const rows = await this.db.attempts
      .where('[childId+factId]')
      .equals([childId, factId])
      .toArray()
    return rows.map(toAttempt).sort(byTime)
  }
  async deleteByChild(childId: ChildId) {
    await this.db.attempts.where('childId').equals(childId).delete()
  }
}

export class DexieSessionRepo implements SessionRepo {
  private db: TabuadaDb
  constructor(db: TabuadaDb) {
    this.db = db
  }

  async save(session: Session) {
    await this.db.sessions.put(session)
  }
  get(id: SessionId) {
    return this.db.sessions.get(id)
  }
  async listByChild(childId: ChildId) {
    const rows = await this.db.sessions.where('childId').equals(childId).toArray()
    return rows.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
  }
  async deleteByChild(childId: ChildId) {
    await this.db.sessions.where('childId').equals(childId).delete()
  }
}

export class DexieWalletRepo implements WalletRepo {
  private db: TabuadaDb
  constructor(db: TabuadaDb) {
    this.db = db
  }

  async get(childId: ChildId) {
    return (
      (await this.db.wallets.get(childId)) ?? {
        childId,
        cajus: 0,
        piggyBank: 0,
        stars: {},
        stickers: [],
      }
    )
  }
  async save(wallet: Wallet) {
    await this.db.wallets.put(wallet)
  }
  async deleteByChild(childId: ChildId) {
    await this.db.wallets.delete(childId)
  }
}
