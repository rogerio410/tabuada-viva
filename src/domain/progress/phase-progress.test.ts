import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import {
  completedSessions,
  evaluatePhase,
  phaseAccuracy,
  phaseStatuses,
  starsFor,
  type PhaseAttempt,
  type PhaseSession,
} from './phase-progress'

const ORDER = ['P1', 'P2', 'P3']
let n = 0
const day = (d: number) => new Date(2026, 10, 2 + d, 10, 0, 0)

/** Sessão encerrada na fase, com `right` acertos e `wrong` erros. */
function played(phaseId: string, right: number, wrong: number, d = n++) {
  const id = `s${n++}`
  const session: PhaseSession = {
    id,
    phaseId,
    startedAt: day(d),
    endedAt: day(d),
    accuracy: right / (right + wrong),
  }
  const attempts: PhaseAttempt[] = [
    ...Array.from({ length: right }, () => ({ sessionId: id, phaseId, correct: true })),
    ...Array.from({ length: wrong }, () => ({ sessionId: id, phaseId, correct: false })),
  ]
  return { session, attempts }
}

describe('starsFor (D5)', () => {
  it('usa os limiares de PARAMS.starThresholds', () => {
    const t = PARAMS.starThresholds
    expect(starsFor(null)).toBe(0)
    expect(starsFor(t.one - 0.01)).toBe(0)
    expect(starsFor(t.one)).toBe(1)
    expect(starsFor(t.two - 0.01)).toBe(1)
    expect(starsFor(t.two)).toBe(2)
    expect(starsFor(t.three - 0.01)).toBe(2)
    expect(starsFor(t.three)).toBe(3)
    expect(starsFor(1)).toBe(3)
  })
})

describe('completedSessions', () => {
  it('só conta sessões encerradas da fase, em ordem cronológica', () => {
    const a = played('P1', 5, 0, 2).session
    const b = played('P1', 5, 0, 1).session
    const open: PhaseSession = { ...played('P1', 1, 0).session, endedAt: null }
    const other = played('P2', 5, 0).session
    expect(completedSessions([a, b, open, other], 'P1').map((s) => s.id)).toEqual([b.id, a.id])
  })
})

describe('phaseAccuracy', () => {
  it('acerto simples (acertos ÷ respostas) nas últimas sessões da fase; apoio não entra na conta', () => {
    const s1 = played('P1', 5, 5) // 50%: sai da janela
    const s2 = played('P1', 9, 1)
    const s3 = played('P1', 9, 1)
    const s4 = played('P1', 9, 1)
    const sessions = [s1, s2, s3, s4].map((s) => s.session)
    const attempts = [s1, s2, s3, s4].flatMap((s) => s.attempts)
    expect(PARAMS.phaseSessions.max).toBe(3)
    expect(phaseAccuracy(sessions, attempts, 'P1')).toBeCloseTo(0.9)
  })

  it('sem sessões encerradas: null', () => {
    expect(phaseAccuracy([], [], 'P1')).toBeNull()
  })

  it('ignora respostas de outra fase', () => {
    const a = played('P1', 8, 2)
    const b = played('P2', 0, 10)
    expect(phaseAccuracy([a.session, b.session], [...a.attempts, ...b.attempts], 'P1')).toBeCloseTo(
      0.8,
    )
  })
})

describe('evaluatePhase', () => {
  it('2 estrelas só avançam depois do mínimo de sessões; 1 estrela não avança', () => {
    const s1 = played('P1', 17, 3) // 85%
    const s2 = played('P1', 17, 3)
    expect(evaluatePhase([s1.session], s1.attempts, 'P1', 0)).toMatchObject({
      stars: 2,
      passed: false,
    })
    const two = evaluatePhase([s1.session, s2.session], [...s1.attempts, ...s2.attempts], 'P1', 0)
    expect(two.stars).toBe(2)
    expect(two.passed).toBe(false) // sem o sinal de acelerar são 3 sessões
    const s3 = played('P1', 17, 3)
    const three = evaluatePhase(
      [s1.session, s2.session, s3.session],
      [...s1.attempts, ...s2.attempts, ...s3.attempts],
      'P1',
      0,
    )
    expect(three).toMatchObject({ stars: 2, passed: true })
    const low = played('P1', 7, 3) // 70%
    expect(evaluatePhase([low.session], low.attempts, 'P1', 0).stars).toBe(1)
  })

  it('vale o melhor resultado: estrelas nunca diminuem', () => {
    const bad = played('P1', 5, 5)
    expect(evaluatePhase([bad.session], bad.attempts, 'P1', 3).stars).toBe(3)
  })

  it('com só 2 sessões ainda não há sinal de acelerar (D25): o mínimo não vale', () => {
    const ss = [played('P1', 20, 0), played('P1', 20, 0)]
    const r = evaluatePhase(
      ss.map((s) => s.session),
      ss.flatMap((s) => s.attempts),
      'P1',
      0,
    )
    expect(r.passed).toBe(false)
  })
})

describe('phaseStatuses', () => {
  const pass = (phaseId: string) => {
    const ss = [played(phaseId, 20, 0), played(phaseId, 20, 0), played(phaseId, 20, 0)]
    return {
      sessions: ss.map((s) => s.session),
      attempts: ss.flatMap((s) => s.attempts),
    }
  }

  it('perfil novo: só a primeira fase está liberada', () => {
    expect(phaseStatuses(ORDER, [], {})).toEqual([
      { id: 'P1', state: 'current', stars: 0 },
      { id: 'P2', state: 'locked', stars: 0 },
      { id: 'P3', state: 'locked', stars: 0 },
    ])
  })

  it('fase aprovada abre a próxima; as feitas mostram as estrelas', () => {
    const p1 = pass('P1')
    expect(phaseStatuses(ORDER, p1.sessions, { P1: 3 })).toEqual([
      { id: 'P1', state: 'done', stars: 3 },
      { id: 'P2', state: 'current', stars: 0 },
      { id: 'P3', state: 'locked', stars: 0 },
    ])
  })

  it('estrelas sem sessões suficientes não abrem a próxima', () => {
    expect(phaseStatuses(ORDER, [], { P1: 3 })[1]!.state).toBe('locked')
  })
})
