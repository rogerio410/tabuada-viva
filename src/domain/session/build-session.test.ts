import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import type { FactState, FactStatus } from '../ports/types'
import { seededRng } from '../ports/clock'
import { addDays } from '../scheduler/apply-answer'
import {
  buildSession,
  reinsertAfterError,
  type SessionInput,
  type SessionItem,
} from './build-session'

const NOW = new Date(2026, 10, 2, 10, 0, 0)

const st = (
  factId: string,
  status: FactStatus,
  nextReview: Date | null = addDays(NOW, -1),
): FactState => ({
  childId: 'ana',
  factId,
  status,
  nextReview,
  streak: 0,
  fastDays: [],
  correct: 0,
  wrong: 0,
  medianMs: null,
})

const input = (over: Partial<SessionInput> = {}): SessionInput => ({
  childId: 'ana',
  states: [],
  phaseFacts: [],
  gateOpen: false,
  ...over,
})

const kinds = (items: SessionItem[]) => items.map((i) => i.kind)
const ids = (items: SessionItem[], kind: SessionItem['kind']) =>
  items.filter((i) => i.kind === kind).map((i) => i.factId)

describe('buildSession: estrutura (D12)', () => {
  it('ordem: aquecimento, revisões, novos, história, fechamento', () => {
    const states = [
      st('add:1+1', 'dominado', addDays(NOW, 5)),
      st('add:1+2', 'dominado', addDays(NOW, 5)),
      st('add:1+3', 'dominado', addDays(NOW, 5)),
      st('add:2+2', 'praticando'),
    ]
    const plan = buildSession(input({ states, phaseFacts: ['add:2+3'] }), seededRng(1), NOW)
    const order = kinds(plan.items)
    const rank = { warmup: 0, review: 1, new: 2, story: 3, closing: 4 } as const
    expect([...order].sort((a, b) => rank[a] - rank[b])).toEqual(order)
    expect(new Set(order)).toEqual(new Set(['warmup', 'review', 'new', 'story', 'closing']))
  })

  it('devolve a duração-alvo da sessão (a UI é quem para)', () => {
    expect(buildSession(input(), seededRng(1), NOW).sessionMinutes).toEqual(PARAMS.sessionMinutes)
  })

  it('criança nova: só conteúdo novo e história, sem aquecimento nem revisão nem fechamento', () => {
    const plan = buildSession(input({ phaseFacts: ['add:0+1', 'add:1+1'] }), seededRng(1), NOW)
    expect(kinds(plan.items)).toEqual(['new', 'new', 'story'])
  })

  it('é determinístico: mesma entrada e mesma semente, mesmo plano', () => {
    const states = Array.from({ length: 8 }, (_, i) =>
      st(`add:${i}+${i + 1}`, 'dominado', addDays(NOW, 3)),
    )
    const a = buildSession(input({ states }), seededRng(42), NOW)
    const b = buildSession(input({ states }), seededRng(42), NOW)
    expect(a).toEqual(b)
    const c = buildSession(input({ states }), seededRng(7), NOW)
    expect(ids(c.items, 'warmup')).not.toEqual(ids(a.items, 'warmup')) // a semente importa
  })

  it('não muta a entrada', () => {
    const states = [st('add:1+1', 'dominado')]
    const copy = JSON.stringify(states)
    buildSession(input({ states }), seededRng(1), NOW)
    expect(JSON.stringify(states)).toBe(copy)
  })
})

describe('aquecimento', () => {
  const dominated = (n: number) =>
    Array.from({ length: n }, (_, i) => st(`add:${i}+${i + 1}`, 'dominado', addDays(NOW, 3)))

  it('warmupFacts (3) fatos já Dominados', () => {
    const plan = buildSession(input({ states: dominated(6) }), seededRng(3), NOW)
    expect(ids(plan.items, 'warmup')).toHaveLength(PARAMS.warmupFacts)
  })
  it('sem Dominados, usa os de maior estado disponível', () => {
    const states = [
      st('add:1+1', 'aprendendo'),
      st('add:1+2', 'praticando'),
      st('add:1+3', 'fluente', addDays(NOW, 2)),
      st('add:1+4', 'praticando'),
    ]
    const warm = ids(buildSession(input({ states }), seededRng(3), NOW).items, 'warmup')
    expect(new Set(warm)).toEqual(new Set(['add:1+3', 'add:1+2', 'add:1+4']))
  })
  it('com menos fatos que o aquecimento, usa o que tem', () => {
    const warm = ids(
      buildSession(input({ states: dominated(1) }), seededRng(3), NOW).items,
      'warmup',
    )
    expect(warm).toHaveLength(1)
  })
  it('um fato do aquecimento não se repete nas revisões', () => {
    const states = dominated(3).map((s) => ({ ...s, nextReview: addDays(NOW, -1) }))
    const plan = buildSession(input({ states }), seededRng(3), NOW)
    const warm = new Set(ids(plan.items, 'warmup'))
    for (const r of ids(plan.items, 'review')) expect(warm.has(r)).toBe(false)
  })
})

describe('revisões vencidas', () => {
  it('só entram os vencidos (nextReview <= agora), do estado mais baixo ao mais alto', () => {
    const states = [
      st('add:5+5', 'fluente', addDays(NOW, -3)),
      st('add:1+1', 'praticando', addDays(NOW, -1)),
      st('add:2+2', 'praticando', addDays(NOW, 4)), // não vencido
      st('add:3+3', 'aprendendo', NOW), // vence exatamente agora
      st('add:4+4', 'dominado', addDays(NOW, 9)),
      st('add:6+6', 'dominado', addDays(NOW, 9)),
      st('add:7+7', 'dominado', addDays(NOW, 9)),
    ]
    const rev = ids(buildSession(input({ states }), seededRng(1), NOW).items, 'review')
    expect(rev).toEqual(['add:3+3', 'add:1+1', 'add:5+5'])
  })
  it('um fato Novo (sem revisão) nunca é revisão', () => {
    const rev = ids(
      buildSession(input({ states: [st('add:1+1', 'novo', null)] }), seededRng(1), NOW).items,
      'review',
    )
    expect(rev).toEqual([])
  })
})

describe('conteúdo novo (D12, D16)', () => {
  it('no máximo maxNewFactsPerSession (2) itens de apresentação', () => {
    const phaseFacts = ['add:0+1', 'add:1+1', 'add:1+2', 'add:1+3']
    const items = buildSession(input({ phaseFacts }), seededRng(1), NOW).items
    expect(items.filter((i) => i.kind === 'new')).toHaveLength(2)
  })
  it('respeita o maxNew vindo da adaptação', () => {
    const phaseFacts = ['add:1+1', 'add:1+2', 'add:1+3']
    expect(
      buildSession(input({ phaseFacts, maxNew: 1 }), seededRng(1), NOW).items.filter(
        (i) => i.kind === 'new',
      ),
    ).toHaveLength(1)
    expect(
      buildSession(input({ phaseFacts, maxNew: 0 }), seededRng(1), NOW).items.filter(
        (i) => i.kind === 'new',
      ),
    ).toHaveLength(0)
  })
  it('fato que a criança já viu não é novo', () => {
    const items = buildSession(
      input({ phaseFacts: ['add:1+1'], states: [st('add:1+1', 'aprendendo')] }),
      seededRng(1),
      NOW,
    ).items
    expect(items.filter((i) => i.kind === 'new')).toHaveLength(0)
  })
  it('uma regra conta como 1 item novo, mas cobre cada fato dela (D16a)', () => {
    const rule = Array.from({ length: 11 }, (_, b) => `add:0+${b}`)
    const items = buildSession(input({ phaseFacts: rule }), seededRng(1), NOW).items.filter(
      (i) => i.kind === 'new',
    )
    expect(items).toHaveLength(1)
    expect(items[0]!.unit).toHaveLength(11)
  })
  it('a unidade de − é o triângulo: os dois irmãos juntos (D16b)', () => {
    const states = [st('add:4+5', 'praticando', addDays(NOW, 2))]
    const items = buildSession(
      input({ states, phaseFacts: ['sub:9-4', 'sub:9-5'] }),
      seededRng(1),
      NOW,
    ).items.filter((i) => i.kind === 'new')
    expect(items).toHaveLength(1)
    expect(items[0]!.unit!.sort()).toEqual(['sub:9-4', 'sub:9-5'])
  })
  it('subtração só abre quando a adição raiz está em Praticando ou acima (D16c)', () => {
    const phaseFacts = ['sub:9-4', 'sub:9-5']
    const learning = [st('add:4+5', 'aprendendo', addDays(NOW, 2))]
    expect(
      buildSession(input({ states: learning, phaseFacts }), seededRng(1), NOW).items.filter(
        (i) => i.kind === 'new',
      ),
    ).toHaveLength(0)
    const none: FactState[] = []
    expect(
      buildSession(input({ states: none, phaseFacts }), seededRng(1), NOW).items.filter(
        (i) => i.kind === 'new',
      ),
    ).toHaveLength(0)
    const ready = [st('add:4+5', 'praticando', addDays(NOW, 2))]
    expect(
      buildSession(input({ states: ready, phaseFacts }), seededRng(1), NOW).items.filter(
        (i) => i.kind === 'new',
      ),
    ).toHaveLength(1)
  })
  it('× e ÷ nunca aparecem com o Portão fechado, mesmo que a fase os liste', () => {
    const phaseFacts = ['mul:2x3', 'mul:2x4', 'div:6/2']
    const states = [
      st('add:3+3', 'dominado', addDays(NOW, 3)),
      st('mul:2x2', 'praticando'),
      st('div:4/2', 'praticando'),
    ]
    const items = buildSession(
      input({ states, phaseFacts, gateOpen: false }),
      seededRng(1),
      NOW,
    ).items
    for (const i of items)
      expect(i.factId === null || /^(add|sub):/.test(i.factId), String(i.factId)).toBe(true)
    // com o Portão aberto, aparecem
    const open = buildSession(
      input({ states, phaseFacts, gateOpen: true }),
      seededRng(1),
      NOW,
    ).items
    expect(open.some((i) => i.factId && /^(mul|div):/.test(i.factId))).toBe(true)
  })
})

describe('dosagem 70/30', () => {
  it('limita os frágeis + novos a ~30% quando há conhecidos', () => {
    const known = Array.from({ length: 7 }, (_, i) =>
      st(`add:${i}+${i + 3}`, 'fluente', addDays(NOW, -1)),
    )
    const fragile = Array.from({ length: 6 }, (_, i) => st(`add:${i}+${i + 1}`, 'aprendendo', NOW))
    const items = buildSession(input({ states: [...known, ...fragile] }), seededRng(1), NOW).items
    const nonKnown =
      items.filter((i) => i.kind === 'new').length +
      fragile.filter((f) => items.some((i) => i.factId === f.factId && i.kind !== 'warmup')).length
    const knownCount = items.filter(
      (i) =>
        i.kind === 'warmup' || (i.kind === 'review' && known.some((k) => k.factId === i.factId)),
    ).length
    expect(nonKnown / (nonKnown + knownCount)).toBeLessThanOrEqual(0.31)
  })
})

describe('história e fechamento', () => {
  it('uma história por padrão; storyItems muda', () => {
    expect(
      kinds(buildSession(input(), seededRng(1), NOW).items).filter((k) => k === 'story'),
    ).toHaveLength(1)
    expect(
      kinds(buildSession(input({ storyItems: 2 }), seededRng(1), NOW).items).filter(
        (k) => k === 'story',
      ),
    ).toHaveLength(2)
  })
  it('o fechamento é um fato já conhecido (item fácil)', () => {
    const states = [st('add:1+1', 'dominado', addDays(NOW, 3)), st('add:2+2', 'aprendendo', NOW)]
    const closing = buildSession(input({ states }), seededRng(1), NOW).items.find(
      (i) => i.kind === 'closing',
    )!
    expect(closing.factId).toBe('add:1+1')
  })
})

describe('dica de estratégia (D3, D24)', () => {
  it('marca strategyHint nos itens cujo fato está em slowCounting', () => {
    const states = [
      st('add:1+1', 'dominado', addDays(NOW, 3)),
      st('add:2+2', 'praticando'),
      st('add:3+3', 'praticando'),
    ]
    const plan = buildSession(
      input({ states, phaseFacts: ['add:4+4'], slowCounting: new Set(['add:2+2', 'add:4+4']) }),
      seededRng(1),
      NOW,
    )
    const hinted = plan.items.filter((i) => i.strategyHint).map((i) => i.factId)
    expect(new Set(hinted)).toEqual(new Set(['add:2+2', 'add:4+4']))
    expect(plan.items.filter((i) => i.factId === 'add:3+3').every((i) => !i.strategyHint)).toBe(
      true,
    )
  })
  it('sem o conjunto, nenhum item tem dica', () => {
    const plan = buildSession(input({ states: [st('add:2+2', 'praticando')] }), seededRng(1), NOW)
    expect(plan.items.some((i) => i.strategyHint)).toBe(false)
  })
})

describe('reinsertAfterError (errorReturnAfterItems: 2 a 3 itens)', () => {
  const q: SessionItem[] = Array.from({ length: 10 }, (_, i) => ({
    kind: 'review',
    factId: `add:${i}+${i}`,
  }))

  it('recoloca o fato com 2 ou 3 itens no meio', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const out = reinsertAfterError(q, 'add:0+0', 0, seededRng(seed))
      expect(out).toHaveLength(q.length + 1)
      const at = out.findIndex((i, idx) => idx > 0 && i.factId === 'add:0+0')
      expect([3, 4]).toContain(at) // índice 0 + (2|3) itens no meio + 1
    }
  })
  it('perto do fim da fila, coloca no fim', () => {
    const out = reinsertAfterError(q, 'add:9+9', 9, seededRng(1))
    expect(out.at(-1)!.factId).toBe('add:9+9')
    expect(out).toHaveLength(q.length + 1)
  })
  it('não muta a fila e é determinística', () => {
    const copy = JSON.stringify(q)
    const a = reinsertAfterError(q, 'add:2+2', 2, seededRng(5))
    expect(JSON.stringify(q)).toBe(copy)
    expect(reinsertAfterError(q, 'add:2+2', 2, seededRng(5))).toEqual(a)
  })
})
