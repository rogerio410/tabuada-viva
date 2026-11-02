import Dexie, { type EntityTable } from 'dexie'
import type { Attempt, FactState, Session, Wallet } from '@domain/ports/types'

/** Linha de Attempt: o `id` é só a ordem de inserção local; não faz parte do domínio. */
export type AttemptRow = Attempt & { id?: number }

export class TabuadaDb extends Dexie {
  factStates!: EntityTable<FactState, 'factId'>
  attempts!: EntityTable<AttemptRow, 'id'>
  sessions!: EntityTable<Session, 'id'>
  wallets!: EntityTable<Wallet, 'childId'>

  constructor(name = 'tabuada-viva') {
    super(name)
    this.version(1).stores({
      factStates: '[childId+factId], childId',
      attempts: '++id, sessionId, childId, [childId+factId]',
      sessions: 'id, childId',
      wallets: 'childId',
    })
  }
}
