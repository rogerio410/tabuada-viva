import type { ChildId, Wallet } from '../types'
import type { WalletRepo } from '../wallet-repo'

const copy = (w: Wallet): Wallet => ({ ...w, stars: { ...w.stars }, stickers: [...w.stickers] })

export class InMemoryWalletRepo implements WalletRepo {
  private rows = new Map<ChildId, Wallet>()

  async get(childId: ChildId) {
    const w = this.rows.get(childId)
    return w ? copy(w) : { childId, cajus: 0, piggyBank: 0, stars: {}, stickers: [] }
  }
  async save(wallet: Wallet) {
    this.rows.set(wallet.childId, copy(wallet))
  }
  async deleteByChild(childId: ChildId) {
    this.rows.delete(childId)
  }
}
