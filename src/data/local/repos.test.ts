import 'fake-indexeddb/auto'
import {
  attemptRepoContract,
  factStateRepoContract,
  sessionRepoContract,
  walletRepoContract,
} from '@domain/ports/repo.contract'
import { TabuadaDb } from './db'
import { DexieAttemptRepo, DexieFactStateRepo, DexieSessionRepo, DexieWalletRepo } from './repos'

// Um banco novo (nome único) por teste: o contrato espera repositório vazio.
let n = 0
const fresh = () => new TabuadaDb(`test-${n++}`)

factStateRepoContract(() => new DexieFactStateRepo(fresh()))
attemptRepoContract(() => new DexieAttemptRepo(fresh()))
sessionRepoContract(() => new DexieSessionRepo(fresh()))
walletRepoContract(() => new DexieWalletRepo(fresh()))
