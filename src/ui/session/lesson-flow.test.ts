import { describe, expect, it } from 'vitest'
import { PARAMS } from '@domain/config/params'
import { seededRng } from '@domain/ports/clock'
import { InMemoryAttemptRepo } from '@domain/ports/fakes/in-memory-attempt-repo'
import { InMemoryFactStateRepo } from '@domain/ports/fakes/in-memory-fact-state-repo'
import { InMemorySessionRepo } from '@domain/ports/fakes/in-memory-session-repo'
import { InMemoryWalletRepo } from '@domain/ports/fakes/in-memory-wallet-repo'
import { presentFact } from '@domain/scheduler/apply-answer'
import { lessonFor } from './lessons'
import { SessionController, type Question, type Services, type View } from './session-controller'

function setup() {
  let t = new Date(2026, 10, 2, 10).getTime()
  let n = 0
  const svc: Services = {
    childId: 'ana',
    facts: new InMemoryFactStateRepo(),
    attempts: new InMemoryAttemptRepo(),
    sessions: new InMemorySessionRepo(),
    wallet: new InMemoryWalletRepo(),
    clock: { now: () => new Date(t) },
    rng: seededRng(5),
    newId: () => `id-${n++}`,
  }
  return { svc, advance: (ms: number) => (t += ms) }
}

const question = (v: View): Question => {
  if (v.type !== 'question') throw new Error(`esperava pergunta, veio ${v.type}`)
  return v.question
}

/** Responde certo até `count` perguntas e devolve cada uma. */
async function answerAll(c: SessionController, svc: Services, first: View, count: number) {
  const out: Question[] = []
  let view = first
  for (let i = 0; i < count; i++) {
    const q = question(view)
    out.push(q)
    await c.answer(q.answer, svc.clock.now(), [])
    view = await c.next()
  }
  return out
}

describe('lição na primeira vez', () => {
  it('fase sem nenhuma resposta abre a lição antes de qualquer pergunta, depois a prática guiada', async () => {
    const { svc } = setup()
    const c = await SessionController.open(svc, 'W1-P01')
    const first = await c.next()
    expect(first.type).toBe('lesson')
    if (first.type === 'lesson') expect(first.lesson).toEqual(lessonFor('W1-P01'))
    // repetir a chamada enquanto a lição não acabou devolve a mesma lição
    expect((await c.next()).type).toBe('lesson')
    const q = question(await c.lessonDone())
    expect(q.guided).toBe('full')
    expect(q.autoSupports.length).toBeGreaterThan(0)
  })

  it('a lição não grava resposta nem estado, nem conta apoio', async () => {
    const { svc } = setup()
    const c = await SessionController.open(svc, 'W1-P01')
    await c.next()
    expect(c.phaseLesson).toEqual(lessonFor('W1-P01'))
    expect(await svc.attempts.listByChild('ana')).toEqual([])
    expect(await svc.facts.listByChild('ana')).toEqual([])
  })

  it('depois de jogar a fase, a lição não abre sozinha (a 2ª vez vai direto às perguntas)', async () => {
    const { svc } = setup()
    const c1 = await SessionController.open(svc, 'W1-P01')
    const q = question(await c1.lessonDone())
    await c1.answer(q.answer, svc.clock.now(), [])
    const c2 = await SessionController.open(svc, 'W1-P01')
    expect((await c2.next()).type).toBe('question')
  })

  it('voltar do mapa durante a lição (sem respostas) recomeça a lição', async () => {
    const { svc } = setup()
    const c1 = await SessionController.open(svc, 'W1-P01')
    await c1.next()
    const c2 = await SessionController.open(svc, 'W1-P01')
    expect((await c2.next()).type).toBe('lesson')
  })
})

describe('prática guiada', () => {
  it('traz 6 a 8 itens, depois o fluxo normal; o apoio some e nunca volta', async () => {
    const { svc } = setup()
    const c = await SessionController.open(svc, 'W1-P03')
    const first = await c.lessonDone()
    const { min, max } = PARAMS.guidedPracticeItems
    const qs = await answerAll(c, svc, first, max + 2)
    const guided = qs.filter((q) => q.guided)
    expect(guided.length).toBeGreaterThanOrEqual(min)
    expect(guided.length).toBeLessThanOrEqual(max)
    // os guiados vêm primeiro e o apoio não cresce
    expect(qs.slice(0, guided.length).every((q) => q.guided)).toBe(true)
    const rank = { full: 2, button: 1, none: 0 } as const
    const levels = guided.map((q) => rank[q.guided!])
    expect(levels[0]).toBe(2)
    expect(levels.at(-1)).toBe(0)
    for (let i = 1; i < levels.length; i++) expect(levels[i]!).toBeLessThanOrEqual(levels[i - 1]!)
    // só os "full" abrem a ferramenta sozinhos
    expect(guided.filter((q) => q.autoSupports.length > 0).every((q) => q.guided === 'full')).toBe(
      true,
    )
  })

  it('itens guiados são respostas normais (Attempt kind fact, na fase)', async () => {
    const { svc } = setup()
    const c = await SessionController.open(svc, 'W1-P03')
    const q = question(await c.lessonDone())
    await c.answer(q.answer, svc.clock.now(), ['dedos'])
    const [a] = await svc.attempts.listByChild('ana')
    expect(a).toMatchObject({ kind: 'fact', phaseId: 'W1-P03', supportsUsed: ['dedos'] })
  })

  it('Grande Desafio e fase de subtração com a soma de origem fraca não têm guiada de subtração', async () => {
    const { svc } = setup()
    const gd = await SessionController.open(svc, 'W1-P08')
    const q = question(await gd.lessonDone())
    expect(q.guided).toBeUndefined()
    const w2 = await SessionController.open(svc, 'W2-P02')
    const v = await w2.lessonDone()
    if (v.type === 'question') expect(v.question.factId.startsWith('sub:')).toBe(false)
  })
})

describe('"Ver o truque" (D24)', () => {
  it('acertos lentos e sem apoio, 2 vezes seguidas, marcam o fato com strategyHint', async () => {
    const { svc } = setup()
    await svc.facts.save(presentFact('ana', 'add:1+1', svc.clock.now()))
    for (let i = 0; i < 2; i++)
      await svc.attempts.add({
        childId: 'ana',
        sessionId: 'old',
        itemId: `i${i}`,
        factId: 'add:1+1',
        answer: 2,
        correct: true,
        timeMs: 12_000,
        supportsUsed: [],
        errorType: null,
        phaseId: 'W1-P02',
        kind: 'fact',
        createdAt: svc.clock.now(),
      })
    const c = await SessionController.open(svc, 'W1-P02')
    const q = question(await c.next())
    expect(q.factId).toBe('add:1+1')
    expect(q.strategyHint).toBe(true)
  })

  it('o tempo gasto vendo o truque não entra no tempo da resposta (timeMs)', async () => {
    const { svc, advance } = setup()
    const c = await SessionController.open(svc, 'W1-P01')
    const q = question(await c.lessonDone())
    advance(1000)
    c.truqueOpened()
    advance(90_000) // a criança vê a lição
    c.truqueClosed()
    advance(1500)
    await c.answer(q.answer, svc.clock.now(), [])
    const [a] = await svc.attempts.listByChild('ana')
    expect(a!.timeMs).toBe(2500) // 1000 antes + 1500 depois; os 90 s da lição ficam de fora
  })

  it('fechar o truque sem tê-lo aberto não muda nada', async () => {
    const { svc, advance } = setup()
    const c = await SessionController.open(svc, 'W1-P01')
    const q = question(await c.lessonDone())
    c.truqueClosed()
    advance(2000)
    await c.answer(q.answer, svc.clock.now(), [])
    const [a] = await svc.attempts.listByChild('ana')
    expect(a!.timeMs).toBe(2000)
  })
})
