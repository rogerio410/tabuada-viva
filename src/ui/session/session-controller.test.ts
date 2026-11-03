import { describe, expect, it } from 'vitest'
import { seededRng } from '@domain/ports/clock'
import { InMemoryAttemptRepo } from '@domain/ports/fakes/in-memory-attempt-repo'
import { InMemoryFactStateRepo } from '@domain/ports/fakes/in-memory-fact-state-repo'
import { InMemorySessionRepo } from '@domain/ports/fakes/in-memory-session-repo'
import { InMemoryWalletRepo } from '@domain/ports/fakes/in-memory-wallet-repo'
import { PARAMS } from '@domain/config/params'
import { SessionController, type Services, type View } from './session-controller'

/** Abre a fase sem a lição (nos testes do fluxo de perguntas). */
async function openPhase(svc: Services, phaseId: string) {
  const c = await SessionController.open(svc, phaseId)
  c.skipLesson()
  return c
}

function setup() {
  let t = new Date(2026, 10, 2, 10, 0, 0).getTime()
  let n = 0
  const svc: Services = {
    childId: 'ana',
    facts: new InMemoryFactStateRepo(),
    attempts: new InMemoryAttemptRepo(),
    sessions: new InMemorySessionRepo(),
    wallet: new InMemoryWalletRepo(),
    clock: { now: () => new Date(t) },
    rng: seededRng(7),
    newId: () => `id-${n++}`,
  }
  return { svc, advance: (ms: number) => (t += ms) }
}

const question = (v: View) => {
  if (v.type !== 'question') throw new Error(`esperava pergunta, veio ${v.type}`)
  return v.question
}

describe('SessionController', () => {
  it('primeira sessão: apresenta fatos novos de adição, só adição', async () => {
    const { svc } = setup()
    const c = await openPhase(svc, 'W1-P01')
    const q = question(await c.next())
    expect(q.factId).toMatch(/^add:/)
    expect(q.answer).toBe(q.a + q.b)
    expect(q.status).toBe('aprendendo')
    expect(q.autoSupports).toEqual(['dedos', 'quadro-de-dez'])
  })

  it('grava a resposta, o estado do fato e a sessão a cada item', async () => {
    const { svc, advance } = setup()
    const c = await openPhase(svc, 'W1-P01')
    const q = question(await c.next())
    advance(2500)
    const fb = await c.answer(q.answer, svc.clock.now(), [])
    expect(fb.correct).toBe(true)
    const [attempt] = await svc.attempts.listBySession(
      (await svc.sessions.listByChild('ana'))[0]!.id,
    )
    expect(attempt).toMatchObject({ factId: q.factId, timeMs: 2500, correct: true, kind: 'fact' })
    expect(attempt!.phaseId).toBe('W1-P01')
    expect((await svc.facts.get('ana', q.factId))!.correct).toBe(1)
    const [s] = await svc.sessions.listByChild('ana')
    expect(s).toMatchObject({ itemCount: 1, accuracy: 1, endedAt: null })
  })

  it('apoio usado entra na Attempt e não conta como acerto sem apoio', async () => {
    const { svc } = setup()
    const c = await openPhase(svc, 'W1-P01')
    const q = question(await c.next())
    await c.answer(q.answer, svc.clock.now(), ['dedos'])
    const [a] = await svc.attempts.listByChild('ana')
    expect(a!.supportsUsed).toEqual(['dedos'])
    expect((await svc.sessions.listByChild('ana'))[0]!.accuracy).toBe(0)
  })

  it('erro volta o fato à fila em 2 a 3 itens e a resposta errada não vira acerto', async () => {
    const { svc } = setup()
    const c = await openPhase(svc, 'W1-P01')
    const first = question(await c.next())
    const fb = await c.answer(first.answer + 1, svc.clock.now(), [])
    expect(fb.correct).toBe(false)
    expect((await svc.facts.get('ana', first.factId))!.wrong).toBe(1)
    const seen: string[] = []
    for (let i = 0; i < 6; i++) {
      const q = question(await c.next())
      seen.push(q.factId)
      await c.answer(q.answer, svc.clock.now(), [])
    }
    expect(seen).toContain(first.factId)
  })

  it('depois de 10 min convida a descansar; continuar não pune e o convite não volta', async () => {
    const { svc, advance } = setup()
    const c = await openPhase(svc, 'W1-P01')
    const q = question(await c.next())
    await c.answer(q.answer, svc.clock.now(), [])
    advance(PARAMS.sessionMinutes.min * 60_000)
    expect((await c.next()).type).toBe('rest-offer')
    expect((await c.keepGoing()).type).toBe('question')
    expect((await c.next()).type).toBe('question')
  })

  it('aceitar descansar fecha a sessão em no máximo um item e marca endedAt', async () => {
    const { svc, advance } = setup()
    const c = await openPhase(svc, 'W1-P01')
    for (let i = 0; i < 4; i++) {
      const q = question(await c.next())
      await c.answer(q.answer, svc.clock.now(), [])
    }
    advance(PARAMS.sessionMinutes.min * 60_000)
    expect((await c.next()).type).toBe('rest-offer')
    let v = await c.rest()
    if (v.type === 'question') {
      await c.answer(question(v).answer, svc.clock.now(), [])
      v = await c.next()
    }
    expect(v.type).toBe('done')
    const [s] = await svc.sessions.listByChild('ana')
    expect(s!.endedAt).not.toBeNull()
  })

  it('reabrir retoma a mesma sessão aberta (recarregar a página)', async () => {
    const { svc } = setup()
    const c1 = await openPhase(svc, 'W1-P01')
    const q = question(await c1.next())
    await c1.answer(q.answer, svc.clock.now(), [])
    const c2 = await openPhase(svc, 'W1-P01')
    expect(c2.progress.done).toBe(1)
    expect((await svc.sessions.listByChild('ana')).length).toBe(1)
    expect(question(await c2.next()).factId).toMatch(/^add:/)
  })
})
