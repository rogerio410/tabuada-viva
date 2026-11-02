import type { ChildId, Session, SessionId } from './types'

export interface SessionRepo {
  /** Cria ou substitui a sessão (o progresso é guardado a qualquer momento). */
  save(session: Session): Promise<void>
  get(id: SessionId): Promise<Session | undefined>
  /** Sessões da criança em ordem cronológica. */
  listByChild(childId: ChildId): Promise<Session[]>
  /** Direito de apagar (LGPD). */
  deleteByChild(childId: ChildId): Promise<void>
}
