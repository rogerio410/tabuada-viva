import {
  attemptRepoContract,
  factStateRepoContract,
  sessionRepoContract,
  walletRepoContract,
} from './repo.contract'
import { InMemoryAttemptRepo } from './fakes/in-memory-attempt-repo'
import { InMemoryFactStateRepo } from './fakes/in-memory-fact-state-repo'
import { InMemorySessionRepo } from './fakes/in-memory-session-repo'
import { InMemoryWalletRepo } from './fakes/in-memory-wallet-repo'

factStateRepoContract(() => new InMemoryFactStateRepo())
attemptRepoContract(() => new InMemoryAttemptRepo())
sessionRepoContract(() => new InMemorySessionRepo())
walletRepoContract(() => new InMemoryWalletRepo())
