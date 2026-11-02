import { describe, expect, it } from 'vitest'
import { PARAMS } from '../config/params'
import { shouldSuggestRest } from './rest'

const start = new Date(2026, 10, 2, 10, 0, 0)
const after = (min: number) => new Date(start.getTime() + min * 60_000)

describe('shouldSuggestRest', () => {
  it('não sugere antes do mínimo da sessão', () => {
    expect(shouldSuggestRest(start, after(PARAMS.sessionMinutes.min - 1))).toBe(false)
  })

  it('sugere a partir do mínimo, e continua sugerindo (a criança pode seguir)', () => {
    expect(shouldSuggestRest(start, after(PARAMS.sessionMinutes.min))).toBe(true)
    expect(shouldSuggestRest(start, after(PARAMS.sessionMinutes.max + 5))).toBe(true)
  })

  it('relógio que anda para trás não sugere', () => {
    expect(shouldSuggestRest(start, after(-5))).toBe(false)
  })
})
