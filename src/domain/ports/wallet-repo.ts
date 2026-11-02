import type { ChildId, Wallet } from './types'

export interface WalletRepo {
  /** Carteira da criança; uma vazia (zeros) se ainda não existe. */
  get(childId: ChildId): Promise<Wallet>
  save(wallet: Wallet): Promise<void>
  /** Direito de apagar (LGPD). */
  deleteByChild(childId: ChildId): Promise<void>
}
