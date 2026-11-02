import { describe, expect, it } from 'vitest'
import { PARAMS } from './params'

describe('PARAMS (invariantes)', () => {
  it('estrelas crescem e 2 estrelas = 80% (libera a próxima fase)', () => {
    const { one, two, three } = PARAMS.starThresholds
    expect(one).toBeLessThan(two)
    expect(two).toBeLessThan(three)
    expect(two).toBe(0.8)
  })

  it('proporção conhecidos/novos soma 1', () => {
    const { known, new: novel } = PARAMS.knownToNewRatio
    expect(known + novel).toBeCloseTo(1)
  })

  it('valores aprovados do Portão (D6–D8, portao.md)', () => {
    expect(PARAMS.gate).toEqual({
      additionMasteredRatio: 0.9,
      subtractionMasteredRatio: 0.9,
      familyAccuracy: 0.9,
      additiveProblemAccuracy: 0.85,
      supportRateBelow: 0.1,
      supportWindowWeeks: 2,
      proofItems: 40,
      proofAccuracy: 0.95,
      proofsRequired: 2,
      proofMinDaysApart: 7,
    })
  })

  it('valores aprovados da sessão e do limiar rápido', () => {
    expect(PARAMS.warmupFacts).toBe(3)
    expect(PARAMS.guidedPracticeItems).toEqual({ min: 6, max: 8 })
    expect(PARAMS.fluentDistinctDays).toBe(2)
    expect(PARAMS.fastAnswerExtraMsPerDigit).toBe(1000)
    expect(PARAMS.fastAnswerDivisionExtraMs).toBe(1000)
    expect(PARAMS.pinLength).toBe(4)
  })

  it('valores decididos por delegação (D24, D25)', () => {
    expect(PARAMS.slowCountingFactor).toBe(2)
    expect(PARAMS.slowCountingStreak).toBe(2)
    expect(PARAMS.phaseSessions).toEqual({ min: 2, max: 3 })
  })

  it('faixas têm min <= max', () => {
    expect(PARAMS.phaseSessions.min).toBeLessThanOrEqual(PARAMS.phaseSessions.max)
    expect(PARAMS.guidedPracticeItems.min).toBeLessThanOrEqual(PARAMS.guidedPracticeItems.max)
    expect(PARAMS.errorReturnAfterItems.min).toBeLessThanOrEqual(PARAMS.errorReturnAfterItems.max)
  })
})
