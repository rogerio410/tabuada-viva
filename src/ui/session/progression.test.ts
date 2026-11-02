import { describe, expect, it } from 'vitest'
import { PARAMS } from '@domain/config/params'
import { seededRng } from '@domain/ports/clock'
import { InMemoryAttemptRepo } from '@domain/ports/fakes/in-memory-attempt-repo'
import { InMemoryFactStateRepo } from '@domain/ports/fakes/in-memory-fact-state-repo'
import { InMemorySessionRepo } from '@domain/ports/fakes/in-memory-session-repo'
import { InMemoryWalletRepo } from '@domain/ports/fakes/in-memory-wallet-repo'
import { PHASE_ORDER } from './phases'
import { loadProgress } from './progress'
import { SessionController, type Services, type View } from './session-controller'

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
    rng: seededRng(11),
    newId: () => `id-${n++}`,
  }
  return {
    svc,
    advance: (ms: number) => (t += ms),
    nextDay: () => {
      const d = new Date(t)
      d.setDate(d.getDate() + 1)
      d.setHours(10, 0, 0, 0)
      t = d.getTime()
    },
  }
}

/**
 * Joga uma sessão inteira como uma criança que acerta tudo em 2 s: responde até o convite de descanso (itens a
 * 20 s de relógio), aceita descansar e termina. Devolve o que foi perguntado.
 */
async function playSession(
  env: ReturnType<typeof setup>,
  phaseId: string,
  wrongEvery = 0,
): Promise<{
  facts: string[]
  kinds: string[]
  result: Extract<View, { type: 'done' }>['result']
}> {
  const c = await SessionController.open(env.svc, phaseId)
  const facts: string[] = []
  const kinds: string[] = []
  let count = 0
  let view = await c.next()
  for (let guard = 0; guard < 2000; guard++) {
    if (view.type === 'rest-offer') view = await c.rest()
    if (view.type === 'done') return { facts, kinds, result: view.result }
    const q = view.question
    facts.push(q.factId)
    kinds.push(q.family ? 'family' : 'fact')
    env.advance(2000)
    const wrong = wrongEvery > 0 && ++count % wrongEvery === 0
    await c.answer(wrong ? q.answer + 1 : q.answer, env.svc.clock.now(), [])
    env.advance(18_000)
    view = await c.next()
  }
  throw new Error('sessão não terminou')
}

describe('progressão pelas fases', () => {
  it('perfil novo: só a primeira fase liberada, 0 estrelas', async () => {
    const { svc } = setup()
    const p = await loadProgress(svc)
    expect(p[0]).toEqual({ id: 'W1-P01', state: 'current', stars: 0 })
    expect(p.slice(1).every((s) => s.state === 'locked' && s.stars === 0)).toBe(true)
    expect(p.map((s) => s.id)).toEqual([...PHASE_ORDER])
  })

  it('acertar tudo: estrelas salvas na Wallet, a fase só libera a próxima depois do mínimo de sessões', async () => {
    const env = setup()
    const first = await playSession(env, 'W1-P01')
    expect(first.result).toMatchObject({ stars: 3, passed: false })
    expect((await env.svc.wallet.get('ana')).stars['W1-P01']).toBe(3)
    expect((await loadProgress(env.svc))[1]!.state).toBe('locked')

    env.nextDay()
    await playSession(env, 'W1-P01')
    env.nextDay()
    const third = await playSession(env, 'W1-P01')
    expect(third.result.passed).toBe(true)
    const p = await loadProgress(env.svc)
    expect(p[0]).toEqual({ id: 'W1-P01', state: 'done', stars: 3 })
    expect(p[1]!.state).toBe('current')
  })

  it('as respostas levam a fase da sessão', async () => {
    const env = setup()
    await playSession(env, 'W1-P01')
    const all = await env.svc.attempts.listByChild('ana')
    expect(all.length).toBeGreaterThan(0)
    expect(all.every((a) => a.phaseId === 'W1-P01')).toBe(true)
  })

  it('acertar pouco dá 0 ou 1 estrela e não libera a próxima', async () => {
    const env = setup()
    const r = await playSession(env, 'W1-P01', 2) // erra metade
    expect(r.result.stars).toBeLessThanOrEqual(1)
    expect(r.result.passed).toBe(false)
  })

  it('sessões de fases diferentes não se misturam', async () => {
    const env = setup()
    const c1 = await SessionController.open(env.svc, 'W1-P01')
    const q = await c1.next()
    expect(q.type).toBe('question')
    const c2 = await SessionController.open(env.svc, 'W1-P02')
    await c2.next()
    const sessions = await env.svc.sessions.listByChild('ana')
    expect(sessions.map((s) => s.phaseId).sort()).toEqual(['W1-P01', 'W1-P02'])
  })

  it('várias sessões em dias seguidos levam do Mundo 1 à subtração, sem travar (simulação)', async () => {
    const env = setup()
    const seen = new Set<string>()
    const families: string[] = []
    let sessions = 0
    for (; sessions < 80; sessions++) {
      const current = (await loadProgress(env.svc)).find((s) => s.state === 'current')
      if (!current || current.id === 'W2-P03') break
      const r = await playSession(env, current.id)
      r.facts.forEach((f) => seen.add(f))
      r.kinds.forEach((k, i) => k === 'family' && families.push(r.facts[i]!))
      env.nextDay()
    }
    const progress = await loadProgress(env.svc)
    expect(progress.find((s) => s.id === 'W2-P03')!.state).toBe('current') // chegou até a W2-P03
    expect([...seen].some((f) => f.startsWith('sub:'))).toBe(true)
    expect(families.some((f) => f.startsWith('add:'))).toBe(true) // a soma de origem entra na família
    expect(families.some((f) => f.startsWith('sub:'))).toBe(true)
    expect(sessions).toBeLessThan(80)
    expect(PARAMS.phaseSessions.max).toBeGreaterThan(0)
  })

  it('uma criança que erra 1 em 7 também avança de fase, sem travar (simulação)', async () => {
    const env = setup()
    let sessions = 0
    for (; sessions < 80; sessions++) {
      const progress = await loadProgress(env.svc)
      if (progress.find((s) => s.id === 'W1-P03')!.state === 'current') break
      const current = progress.find((s) => s.state === 'current')!
      await playSession(env, current.id, 7)
      env.nextDay()
    }
    expect(sessions).toBeLessThan(80)
  })
})
