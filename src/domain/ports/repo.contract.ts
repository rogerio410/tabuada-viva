import { beforeEach, describe, expect, it } from 'vitest'
import type { AttemptRepo } from './attempt-repo'
import type { FactStateRepo } from './fact-state-repo'
import type { SessionRepo } from './session-repo'
import type { Attempt, FactState, Session, Wallet } from './types'
import type { WalletRepo } from './wallet-repo'

/** Contrato compartilhado: o repositório Dexie (Sprint 2) deve passar nestes mesmos testes. */

const d = (s: string) => new Date(s)

const fs = (over: Partial<FactState> = {}): FactState => ({
  childId: 'ana',
  factId: 'add:3+4',
  status: 'aprendendo',
  nextReview: d('2026-11-02T10:00:00Z'),
  streak: 0,
  fastDays: [],
  correct: 0,
  wrong: 0,
  medianMs: null,
  ...over,
})

const at = (over: Partial<Attempt> = {}): Attempt => ({
  childId: 'ana',
  sessionId: 's1',
  itemId: 'i1',
  factId: 'add:3+4',
  answer: 7,
  correct: true,
  timeMs: 2000,
  supportsUsed: [],
  errorType: null,
  phaseId: null,
  kind: 'fact',
  createdAt: d('2026-11-02T10:00:00Z'),
  ...over,
})

export function factStateRepoContract(make: () => FactStateRepo) {
  describe('FactStateRepo (contrato)', () => {
    let repo: FactStateRepo
    beforeEach(() => {
      repo = make()
    })

    it('get devolve undefined quando não existe', async () => {
      expect(await repo.get('ana', 'add:3+4')).toBeUndefined()
    })

    it('save cria e depois substitui', async () => {
      await repo.save(fs())
      await repo.save(fs({ status: 'praticando', streak: 3 }))
      expect(await repo.get('ana', 'add:3+4')).toMatchObject({ status: 'praticando', streak: 3 })
      expect(await repo.listByChild('ana')).toHaveLength(1)
    })

    it('não compartilha referência com o chamador', async () => {
      const s = fs()
      await repo.save(s)
      s.status = 'dominado'
      s.fastDays.push('2026-11-02')
      const got = await repo.get('ana', 'add:3+4')
      expect(got?.status).toBe('aprendendo')
      expect(got?.fastDays).toEqual([])
    })

    it('isola crianças', async () => {
      await repo.save(fs())
      await repo.save(fs({ childId: 'beto' }))
      expect(await repo.listByChild('ana')).toHaveLength(1)
    })

    it('listDue: só vencidos (<= now), dos estados mais baixos aos mais altos', async () => {
      await repo.save(fs({ factId: 'a', status: 'fluente', nextReview: d('2026-11-01T00:00:00Z') }))
      await repo.save(
        fs({ factId: 'b', status: 'aprendendo', nextReview: d('2026-11-02T00:00:00Z') }),
      )
      await repo.save(
        fs({ factId: 'c', status: 'praticando', nextReview: d('2026-11-02T12:00:00Z') }),
      )
      await repo.save(fs({ factId: 'd', status: 'novo', nextReview: null }))
      const due = await repo.listDue('ana', d('2026-11-02T12:00:00Z'))
      expect(due.map((x) => x.factId)).toEqual(['b', 'c', 'a'])
    })

    it('deleteByChild apaga só aquela criança', async () => {
      await repo.save(fs())
      await repo.save(fs({ childId: 'beto' }))
      await repo.deleteByChild('ana')
      expect(await repo.listByChild('ana')).toEqual([])
      expect(await repo.listByChild('beto')).toHaveLength(1)
    })
  })
}

export function attemptRepoContract(make: () => AttemptRepo) {
  describe('AttemptRepo (contrato)', () => {
    let repo: AttemptRepo
    beforeEach(() => {
      repo = make()
    })

    it('add e listBySession preservam a ordem de inserção', async () => {
      await repo.add(at({ itemId: 'i1' }))
      await repo.add(at({ itemId: 'i2' }))
      await repo.add(at({ itemId: 'x', sessionId: 's2' }))
      expect((await repo.listBySession('s1')).map((a) => a.itemId)).toEqual(['i1', 'i2'])
    })

    it('listByChild filtra por intervalo [from, to) em ordem cronológica', async () => {
      await repo.add(at({ itemId: 'late', createdAt: d('2026-11-03T00:00:00Z') }))
      await repo.add(at({ itemId: 'early', createdAt: d('2026-11-01T00:00:00Z') }))
      await repo.add(at({ itemId: 'mid', createdAt: d('2026-11-02T00:00:00Z') }))
      const all = await repo.listByChild('ana')
      expect(all.map((a) => a.itemId)).toEqual(['early', 'mid', 'late'])
      const r = await repo.listByChild('ana', {
        from: d('2026-11-02T00:00:00Z'),
        to: d('2026-11-03T00:00:00Z'),
      })
      expect(r.map((a) => a.itemId)).toEqual(['mid'])
    })

    it('listByFact filtra por criança e fato', async () => {
      await repo.add(at({ itemId: '1' }))
      await repo.add(at({ itemId: '2', factId: 'add:1+1' }))
      await repo.add(at({ itemId: '3', childId: 'beto' }))
      expect((await repo.listByFact('ana', 'add:3+4')).map((a) => a.itemId)).toEqual(['1'])
    })

    it('guarda apoios e tipo de erro', async () => {
      await repo.add(at({ correct: false, supportsUsed: ['dedos'], errorType: 'other' }))
      const [a] = await repo.listBySession('s1')
      expect(a?.supportsUsed).toEqual(['dedos'])
      expect(a?.errorType).toBe('other')
    })

    it('deleteByChild apaga só aquela criança', async () => {
      await repo.add(at())
      await repo.add(at({ childId: 'beto', sessionId: 's9' }))
      await repo.deleteByChild('ana')
      expect(await repo.listByChild('ana')).toEqual([])
      expect(await repo.listByChild('beto')).toHaveLength(1)
    })
  })
}

export function sessionRepoContract(make: () => SessionRepo) {
  describe('SessionRepo (contrato)', () => {
    let repo: SessionRepo
    beforeEach(() => {
      repo = make()
    })
    const s = (over: Partial<Session> = {}): Session => ({
      id: 's1',
      childId: 'ana',
      startedAt: d('2026-11-02T10:00:00Z'),
      endedAt: null,
      itemCount: 0,
      accuracy: null,
      ...over,
    })

    it('save é upsert e get lê', async () => {
      await repo.save(s())
      await repo.save(s({ itemCount: 5, endedAt: d('2026-11-02T10:10:00Z'), accuracy: 0.8 }))
      expect(await repo.get('s1')).toMatchObject({ itemCount: 5, accuracy: 0.8 })
      expect(await repo.get('nada')).toBeUndefined()
    })

    it('listByChild em ordem cronológica e isolado', async () => {
      await repo.save(s({ id: 'b', startedAt: d('2026-11-03T00:00:00Z') }))
      await repo.save(s({ id: 'a', startedAt: d('2026-11-01T00:00:00Z') }))
      await repo.save(s({ id: 'x', childId: 'beto' }))
      expect((await repo.listByChild('ana')).map((x) => x.id)).toEqual(['a', 'b'])
    })

    it('deleteByChild apaga só aquela criança', async () => {
      await repo.save(s())
      await repo.save(s({ id: 'x', childId: 'beto' }))
      await repo.deleteByChild('ana')
      expect(await repo.get('s1')).toBeUndefined()
      expect(await repo.get('x')).toBeDefined()
    })
  })
}

export function walletRepoContract(make: () => WalletRepo) {
  describe('WalletRepo (contrato)', () => {
    let repo: WalletRepo
    beforeEach(() => {
      repo = make()
    })

    it('get devolve carteira vazia quando não existe', async () => {
      expect(await repo.get('ana')).toEqual<Wallet>({
        childId: 'ana',
        cajus: 0,
        piggyBank: 0,
        stars: {},
        stickers: [],
      })
    })

    it('save e get fazem ida e volta, sem compartilhar referência', async () => {
      const w: Wallet = {
        childId: 'ana',
        cajus: 40,
        piggyBank: 10,
        stars: { 'W1-P01': 2 },
        stickers: ['jacare'],
      }
      await repo.save(w)
      w.stars['W1-P01'] = 3
      w.stickers.push('x')
      expect(await repo.get('ana')).toMatchObject({ stars: { 'W1-P01': 2 }, stickers: ['jacare'] })
    })

    it('deleteByChild volta à carteira vazia', async () => {
      await repo.save({ childId: 'ana', cajus: 9, piggyBank: 0, stars: {}, stickers: [] })
      await repo.deleteByChild('ana')
      expect((await repo.get('ana')).cajus).toBe(0)
    })
  })
}
