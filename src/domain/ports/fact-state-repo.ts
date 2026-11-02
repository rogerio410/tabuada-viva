import type { ChildId, FactId, FactState } from './types'

export interface FactStateRepo {
  get(childId: ChildId, factId: FactId): Promise<FactState | undefined>
  /** Cria ou substitui o estado do fato. */
  save(state: FactState): Promise<void>
  listByChild(childId: ChildId): Promise<FactState[]>
  /** Fatos com revisão vencida (`nextReview <= now`), do estado mais baixo para o mais alto. */
  listDue(childId: ChildId, now: Date): Promise<FactState[]>
  /** Direito de apagar (LGPD). */
  deleteByChild(childId: ChildId): Promise<void>
}
