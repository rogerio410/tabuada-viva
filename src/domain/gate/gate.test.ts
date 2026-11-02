import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import { factsOf } from '../facts/catalog'
import type { Attempt, FactState, FactStatus } from '../ports/types'
import { seededRng } from '../ports/clock'
import { addDays } from '../scheduler/apply-answer'
import {
  drawProofItems,
  estimatedMinDaysToOpen,
  gateStatus,
  openGate,
  type GateInput,
} from './gate'

const NOW = new Date(2026, 10, 30, 10, 0, 0)

const ADD = factsOf('add').map((f) => f.id)
const SUB = factsOf('sub').map((f) => f.id)

function states(ids: string[], dominated: number, rest: FactStatus = 'fluente'): FactState[] {
  return ids.map((factId, i) => ({
    childId: 'ana',
    factId,
    status: i < dominated ? 'dominado' : rest,
    nextReview: addDays(NOW, 5),
    streak: 0,
    fastDays: [],
    correct: 0,
    wrong: 0,
    medianMs: null,
  }))
}

let n = 0
const att = (over: Partial<Attempt> = {}): Attempt => ({
  childId: 'ana',
  sessionId: 's1',
  itemId: `i${n++}`,
  factId: 'add:3+4',
  answer: 7,
  correct: true,
  timeMs: 2000,
  supportsUsed: [],
  errorType: null,
  phaseId: 'W3-P01',
  kind: 'fact',
  createdAt: addDays(NOW, -1),
  ...over,
})
const many = (k: number, over: Partial<Attempt> = {}) => Array.from({ length: k }, () => att(over))

const base = (over: Partial<GateInput> = {}): GateInput => ({
  factStates: [...states(ADD, ADD.length), ...states(SUB, SUB.length)],
  attempts: [],
  toolPhaseIds: new Set<string>(),
  ...over,
})

describe('G1 e G2: fatos de adição e subtração (portao.md)', () => {
  it('o catálogo tem 66 fatos de adição e 121 de subtração', () => {
    expect(ADD).toHaveLength(66)
    expect(SUB).toHaveLength(121)
  })
  it('G1: todos Fluente ou Dominado e ≥ 90% Dominado; 59/66 falha, 60/66 passa', () => {
    expect(
      gateStatus(base({ factStates: [...states(ADD, 59), ...states(SUB, 121)] }), NOW).g1.ok,
    ).toBe(false)
    expect(
      gateStatus(base({ factStates: [...states(ADD, 60), ...states(SUB, 121)] }), NOW).g1.ok,
    ).toBe(true)
  })
  it('G1 falha se um fato ainda está em Praticando, mesmo com 90% dominados', () => {
    const add = states(ADD, 65, 'praticando') // 65 dominados + 1 praticando
    expect(gateStatus(base({ factStates: [...add, ...states(SUB, 121)] }), NOW).g1.ok).toBe(false)
  })
  it('G1 falha se falta o estado de algum fato (nunca visto)', () => {
    expect(
      gateStatus(base({ factStates: [...states(ADD.slice(1), 65), ...states(SUB, 121)] }), NOW).g1
        .ok,
    ).toBe(false)
  })
  it('G2: 108/121 falha, 109/121 passa', () => {
    expect(
      gateStatus(base({ factStates: [...states(ADD, 66), ...states(SUB, 108)] }), NOW).g2.ok,
    ).toBe(false)
    expect(
      gateStatus(base({ factStates: [...states(ADD, 66), ...states(SUB, 109)] }), NOW).g2.ok,
    ).toBe(true)
  })
  it('o progresso mostra quantos faltam', () => {
    const g1 = gateStatus(base({ factStates: [...states(ADD, 40), ...states(SUB, 121)] }), NOW).g1
    expect(g1.progress).toEqual({ done: 40, total: 66 })
  })
})

describe('G3: família de fatos (≥ 90%)', () => {
  it('sem tentativas não passa', () => expect(gateStatus(base(), NOW).g3.ok).toBe(false))
  it('9 de 10 passa; 8 de 10 falha', () => {
    const ok = [...many(9, { kind: 'family' }), ...many(1, { kind: 'family', correct: false })]
    const bad = [...many(8, { kind: 'family' }), ...many(2, { kind: 'family', correct: false })]
    expect(gateStatus(base({ attempts: ok }), NOW).g3.ok).toBe(true)
    expect(gateStatus(base({ attempts: bad }), NOW).g3.ok).toBe(false)
  })
  it('ignora respostas de outros tipos', () => {
    expect(
      gateStatus(base({ attempts: many(20, { kind: 'fact', correct: false }) }), NOW).g3.ok,
    ).toBe(false)
  })
})

describe('G4: problemas aditivos (≥ 85% na escolha E no cálculo)', () => {
  const story = (k: number, over: Partial<Attempt> = {}) =>
    many(k, { kind: 'story', factId: null, ...over })
  it('passa com escolha e cálculo ≥ 85%', () => {
    const attempts = [
      ...story(17),
      ...story(1, { correct: false }),
      ...story(2, { correct: false, errorType: 'wrong_operation' }),
    ]
    // 20 histórias: 2 erros de escolha (90%); entre 18 com escolha certa, 17 certas (94%)
    expect(gateStatus(base({ attempts }), NOW).g4.ok).toBe(true)
  })
  it('falha se a escolha da operação fica abaixo de 85% mesmo calculando bem', () => {
    const attempts = [...story(16), ...story(4, { correct: false, errorType: 'wrong_operation' })] // escolha 80%
    expect(gateStatus(base({ attempts }), NOW).g4.ok).toBe(false)
  })
  it('falha se o cálculo fica abaixo de 85% mesmo escolhendo bem', () => {
    const attempts = [...story(8), ...story(2, { correct: false })] // cálculo 80%, escolha 100%
    expect(gateStatus(base({ attempts }), NOW).g4.ok).toBe(false)
  })
  it('histórias de × ou ÷ não contam (só problemas aditivos)', () => {
    const attempts = story(20, { factId: 'mul:3x4', correct: false })
    expect(gateStatus(base({ attempts }), NOW).g4.ok).toBe(false)
  })
})

describe('G5: uso de apoio < 10% nas últimas 2 semanas (D8)', () => {
  const sup = { supportsUsed: ['dedos'] as never[] }

  it('9 com apoio em 100 (9%) passa; 10 em 100 (10%) falha: estritamente menor', () => {
    const ok = [...many(91), ...many(9, sup)]
    const edge = [...many(90), ...many(10, sup)]
    expect(gateStatus(base({ attempts: ok }), NOW).g5.ok).toBe(true)
    expect(gateStatus(base({ attempts: edge }), NOW).g5.ok).toBe(false)
  })
  it('sem respostas elegíveis não há evidência: não passa', () => {
    expect(gateStatus(base(), NOW).g5.ok).toBe(false)
  })
  it('só conta a janela de 2 semanas', () => {
    const old = many(50, { ...sup, createdAt: addDays(NOW, -15) })
    const recent = many(20)
    expect(gateStatus(base({ attempts: [...old, ...recent] }), NOW).g5.ok).toBe(true)
  })
  it('respostas em fases que apresentam a ferramenta não contam (D8)', () => {
    const tool = many(50, { ...sup, phaseId: 'W3-P03' })
    const input = base({ attempts: [...tool, ...many(20)], toolPhaseIds: new Set(['W3-P03']) })
    expect(gateStatus(input, NOW).g5.ok).toBe(true)
    expect(gateStatus({ ...input, toolPhaseIds: new Set() }, NOW).g5.ok).toBe(false)
  })
  it('só conta fatos já em Praticando ou acima', () => {
    const learning = states(['add:3+4'], 0, 'aprendendo')
    const factStates = [...base().factStates.filter((s) => s.factId !== 'add:3+4'), ...learning]
    expect(gateStatus({ ...base({ attempts: many(30, sup) }), factStates }, NOW).g5.ok).toBe(false) // sem evidência elegível
  })
})

describe('G6: Prova do Portão (40 itens, sem apoio, ≥ 95%, 2 vezes com ≥ 7 dias)', () => {
  const proof = (id: string, when: Date, wrong = 0, supported = 0): Attempt[] =>
    Array.from({ length: PARAMS.gate.proofItems }, (_, i) =>
      att({
        sessionId: id,
        kind: 'proof',
        phaseId: null,
        createdAt: when,
        correct: i >= wrong,
        supportsUsed: i < supported ? (['dedos'] as never[]) : [],
      }),
    )

  it('uma prova só não basta', () => {
    expect(gateStatus(base({ attempts: proof('p1', addDays(NOW, -10)) }), NOW).g6).toMatchObject({
      ok: false,
      progress: { done: 1, total: 2 },
    })
  })
  it('duas provas com 6 dias de diferença falham; com 7 dias passam', () => {
    const six = [...proof('p1', addDays(NOW, -10)), ...proof('p2', addDays(NOW, -4))]
    const seven = [...proof('p1', addDays(NOW, -10)), ...proof('p2', addDays(NOW, -3))]
    expect(gateStatus(base({ attempts: six }), NOW).g6.ok).toBe(false)
    expect(gateStatus(base({ attempts: seven }), NOW).g6.ok).toBe(true)
  })
  it('exige ≥ 95%: 2 erros em 40 (95%) passa; 3 erros (92,5%) falha', () => {
    const pass = [...proof('p1', addDays(NOW, -20), 2), ...proof('p2', addDays(NOW, -2), 2)]
    const fail = [...proof('p1', addDays(NOW, -20), 3), ...proof('p2', addDays(NOW, -2), 3)]
    expect(gateStatus(base({ attempts: pass }), NOW).g6.ok).toBe(true)
    expect(gateStatus(base({ attempts: fail }), NOW).g6.ok).toBe(false)
  })
  it('prova com qualquer apoio não vale', () => {
    const a = [...proof('p1', addDays(NOW, -20), 0, 1), ...proof('p2', addDays(NOW, -2))]
    expect(gateStatus(base({ attempts: a }), NOW).g6.ok).toBe(false)
  })
  it('prova incompleta (menos de 40 itens) não vale', () => {
    const short = proof('p1', addDays(NOW, -20)).slice(0, 39)
    expect(
      gateStatus(base({ attempts: [...short, ...proof('p2', addDays(NOW, -2))] }), NOW).g6.ok,
    ).toBe(false)
  })
  it('uma tentativa ruim no meio não atrapalha: só contam as válidas', () => {
    const a = [
      ...proof('p1', addDays(NOW, -20)),
      ...proof('ruim', addDays(NOW, -10), 20),
      ...proof('p2', addDays(NOW, -2)),
    ]
    expect(gateStatus(base({ attempts: a }), NOW).g6.ok).toBe(true)
  })
})

describe('abertura do Portão', () => {
  const ready = () => {
    const proofs = ['p1', 'p2'].flatMap((id, i) =>
      Array.from({ length: 40 }, () =>
        att({
          sessionId: id,
          kind: 'proof',
          phaseId: null,
          createdAt: addDays(NOW, i === 0 ? -20 : -2),
        }),
      ),
    )
    const fam = many(10, { kind: 'family' })
    const story = many(10, { kind: 'story', factId: null })
    const recent = many(20)
    return base({ attempts: [...proofs, ...fam, ...story, ...recent] })
  }

  it('com G1 a G6 verdadeiros, está pronto para abrir', () => {
    expect(gateStatus(ready(), NOW).readyToOpen).toBe(true)
  })
  it('falhando um só critério, não está pronto', () => {
    const r = ready()
    expect(
      gateStatus({ ...r, factStates: [...states(ADD, 10), ...states(SUB, 121)] }, NOW).readyToOpen,
    ).toBe(false)
  })
  it('só abre com a confirmação do adulto: pronto sem confirmação não abre', () => {
    const status = gateStatus(ready(), NOW)
    expect(openGate(status, false)).toEqual({ opened: false, reason: 'not-confirmed' })
    expect(openGate(status, true)).toEqual({ opened: true })
  })
  it('confirmação sem estar pronto também não abre (a UI não força)', () => {
    const status = gateStatus(base(), NOW)
    expect(openGate(status, true)).toEqual({ opened: false, reason: 'not-ready' })
  })
  it('independe da ordem das respostas', () => {
    const r = ready()
    const shuffled = { ...r, attempts: [...r.attempts].reverse() }
    expect(gateStatus(shuffled, NOW)).toEqual(gateStatus(r, NOW))
  })
  it('apoio aberto não conta como acerto sem apoio nas provas', () => {
    const r = ready()
    const tampered = r.attempts.map((a, i) =>
      a.kind === 'proof' && i < 3 ? { ...a, supportsUsed: ['reta' as const] } : a,
    )
    expect(gateStatus({ ...r, attempts: tampered }, NOW).g6.ok).toBe(false)
  })
})

describe('drawProofItems (sorteio por Rng)', () => {
  const pool = Array.from({ length: 80 }, (_, i) => ({
    kind: 'fact' as const,
    factId: `add:${i % 10}+${(i % 10) + 1}`,
    key: `k${i}`,
  }))
  it('sorteia 40 itens distintos', () => {
    const items = drawProofItems(pool, seededRng(1))
    expect(items).toHaveLength(PARAMS.gate.proofItems)
    expect(new Set(items.map((i) => i.key)).size).toBe(40)
  })
  it('é determinístico para a mesma semente e muda com outra', () => {
    const a = drawProofItems(pool, seededRng(9)).map((i) => i.key)
    expect(drawProofItems(pool, seededRng(9)).map((i) => i.key)).toEqual(a)
    expect(drawProofItems(pool, seededRng(10)).map((i) => i.key)).not.toEqual(a)
  })
  it('lança erro claro se o banco de itens é pequeno demais', () => {
    expect(() => drawProofItems(pool.slice(0, 10), seededRng(1))).toThrow()
  })
})

describe('estimatedMinDaysToOpen (limite inferior, sem prometer data)', () => {
  it('com tudo já Dominado, só resta o intervalo entre as provas', () => {
    expect(estimatedMinDaysToOpen(base().factStates, NOW)).toBe(PARAMS.gate.proofMinDaysApart)
  })
  it('um fato Aprendendo (9 dias até Dominado) pesa mais que um Fluente', () => {
    const slow = [...states(ADD, 66), ...states(SUB, 121)]
    const learning = slow.map((s, i) => (i === 0 ? { ...s, status: 'aprendendo' as const } : s))
    // 65/66 já são dominados (≥ 90%), então um Aprendendo isolado não atrasa; todos Aprendendo atrasam
    expect(estimatedMinDaysToOpen(learning, NOW)).toBeGreaterThanOrEqual(
      PARAMS.gate.proofMinDaysApart,
    )
    const allLearning = slow.map((s) => ({ ...s, status: 'aprendendo' as const, nextReview: NOW }))
    expect(estimatedMinDaysToOpen(allLearning, NOW)).toBe(9 + PARAMS.gate.proofMinDaysApart)
  })
})
