import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import { seededRng } from '../ports/clock'
import type { FactState } from '../ports/types'
import { presentFact } from '../scheduler/apply-answer'
import { GUIDED_FOCUS_MAX, guidedItems, scaffoldFor } from './guided'

const T0 = new Date(2026, 10, 2, 10)
const seen = (factId: string, status: FactState['status'] = 'praticando'): FactState => ({
  ...presentFact('ana', factId, T0),
  status,
})

const FACTS = ['add:0+1', 'add:1+1', 'add:1+2', 'add:1+3', 'add:1+4', 'add:1+5']

describe('guidedItems', () => {
  it('traz de 6 a 8 itens (PARAMS.guidedPracticeItems)', () => {
    const { min, max } = PARAMS.guidedPracticeItems
    for (const n of [1, 2, 3, 4, 6, 20]) {
      const items = guidedItems(FACTS.slice(0, Math.min(n, FACTS.length)), [], seededRng(n))
      expect(items.length).toBeGreaterThanOrEqual(min)
      expect(items.length).toBeLessThanOrEqual(max)
    }
  })

  it('cada fato em foco aparece pelo menos 2 vezes; com muitos fatos, sorteia no máximo GUIDED_FOCUS_MAX', () => {
    const items = guidedItems(FACTS, [], seededRng(3))
    const counts = new Map<string, number>()
    for (const f of items) counts.set(f, (counts.get(f) ?? 0) + 1)
    expect(counts.size).toBeLessThanOrEqual(GUIDED_FOCUS_MAX)
    expect([...counts.values()].every((c) => c >= 2)).toBe(true)
  })

  it('só usa fatos da fase e prioriza os que a criança ainda não viu', () => {
    const states = FACTS.slice(0, 4).map((f) => seen(f))
    const items = guidedItems(FACTS, states, seededRng(1))
    expect(new Set(items)).toEqual(
      new Set(['add:1+4', 'add:1+5', ...items.filter((f) => states.some((s) => s.factId === f))]),
    )
    expect(items).toContain('add:1+4')
    expect(items).toContain('add:1+5')
    expect(items.every((f) => FACTS.includes(f))).toBe(true)
  })

  it('não repete o mesmo fato em seguida (quando há mais de um fato)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const items = guidedItems(FACTS, [], seededRng(seed))
      for (let i = 1; i < items.length; i++) expect(items[i]).not.toBe(items[i - 1])
    }
  })

  it('é determinístico para a mesma semente e vazio sem fatos', () => {
    expect(guidedItems(FACTS, [], seededRng(9))).toEqual(guidedItems(FACTS, [], seededRng(9)))
    expect(guidedItems([], [], seededRng(1))).toEqual([])
  })

  it('um único fato repete até 6 vezes (não há como evitar a repetição)', () => {
    const items = guidedItems(['add:0+1'], [], seededRng(1))
    expect(items.length).toBe(PARAMS.guidedPracticeItems.min)
    expect(new Set(items)).toEqual(new Set(['add:0+1']))
  })
})

describe('scaffoldFor (o apoio vai sumindo)', () => {
  it('começa com a ferramenta aberta, passa para o botão e termina sem apoio', () => {
    const levels = Array.from({ length: 8 }, (_, i) => scaffoldFor(i, 8))
    expect(levels[0]).toBe('full')
    expect(levels.at(-1)).toBe('none')
    expect(levels).toContain('button')
  })

  it('nunca volta a dar mais apoio', () => {
    const rank = { full: 2, button: 1, none: 0 } as const
    for (const total of [6, 7, 8]) {
      const levels = Array.from({ length: total }, (_, i) => rank[scaffoldFor(i, total)])
      for (let i = 1; i < levels.length; i++) expect(levels[i]!).toBeLessThanOrEqual(levels[i - 1]!)
    }
  })
})
