import { describe, expect, it } from 'vitest'
import type { Lesson } from '../schema/lesson.ts'
import type { World } from '../schema/world.ts'
import { validateLesson, validateLessonCoverage, type LessonContext } from './lesson-validate.ts'

const world = (phases: Array<{ id: string; grandChallenge?: boolean }>): World => ({
  id: 1,
  name: 'Casa',
  phases: phases.map((p) => ({
    id: p.id,
    name: p.id,
    newFacts: ['add:0+1'],
    grandChallenge: !!p.grandChallenge,
  })),
})

const ctx: LessonContext = {
  worlds: [world([{ id: 'W1-P01' }, { id: 'W1-P08', grandChallenge: true }])],
  allowedWords: new Set(
    'oi eu sou o calú vamos juntar quanto ficaram reparou somar não muda nada mais é a tira de'.split(
      ' ',
    ),
  ),
  forbiddenWords: ['errado', 'rápido', 'tempo'],
}

const ok: Lesson = {
  phase: 'W1-P01',
  strategy: 'Juntar',
  steps: [
    { type: 'say', text: 'Oi! Eu sou o Calú. Vamos juntar?' },
    { type: 'ask', expr: '3 + 2', answer: 5 },
    {
      type: 'choose',
      prompt: 'Quanto é?',
      strip: ['1 + 0 = 1', '2 + 0 = 2', '?'],
      options: ['1', '3', '5'],
      correct: 1,
    },
    { type: 'name', text: 'Reparou? Somar 0 não muda nada.' },
    { type: 'ask', expr: '0 + 4', answer: 4 },
  ],
}

const rules = (l: Lesson, c = ctx) => validateLesson(l, c).map((i) => i.rule)
const withStep = (step: Lesson['steps'][number], at = 1): Lesson => ({
  ...ok,
  steps: [...ok.steps.slice(0, at), step, ...ok.steps.slice(at)],
})

describe('validateLesson', () => {
  it('aceita uma lição correta', () => {
    expect(validateLesson(ok, ctx)).toEqual([])
  })

  it('reprova palavra proibida, fora do vocabulário, frase longa e número por extenso', () => {
    expect(rules(withStep({ type: 'say', text: 'Isso está errado.' }))).toContain('D.proibida')
    expect(rules(withStep({ type: 'say', text: 'Vamos pular.' }))).toContain('E.vocabulario')
    expect(
      rules(
        withStep({
          type: 'say',
          text: 'Oi eu sou o calú vamos juntar mais a tira de nada mais.',
        }),
      ),
    ).toContain('D.frase-longa')
    expect(rules(withStep({ type: 'say', text: 'Mais dois.' }))).toContain('D.numero-extenso')
  })

  it('confere a conta de uma pergunta guiada', () => {
    expect(rules(withStep({ type: 'ask', expr: '3 + 2', answer: 6 }))).toContain('L.conta')
    expect(rules(withStep({ type: 'ask', expr: '3 + ? = 10', answer: 7 }))).not.toContain('L.conta')
    expect(rules(withStep({ type: 'ask', expr: '3 + ? = 10', answer: 6 }))).toContain('L.conta')
    expect(rules(withStep({ type: 'ask', expr: '5 − 2', answer: 3 }))).not.toContain('L.conta')
    expect(rules(withStep({ type: 'ask', expr: 'três mais dois', answer: 5 }))).toContain('L.conta')
  })

  it('confere as contas da tira e o cartão certo', () => {
    const bad = withStep({
      type: 'choose',
      prompt: 'Quanto é?',
      strip: ['1 + 0 = 2', '?'],
      options: ['1', '2', '3'],
      correct: 0,
    })
    expect(rules(bad)).toContain('L.tira')
  })

  it('exige começar falando, terminar numa pergunta e ter padrão + nome (exceto Grande Desafio)', () => {
    expect(rules({ ...ok, steps: ok.steps.slice(1) })).toContain('L.estrutura')
    expect(rules({ ...ok, steps: ok.steps.slice(0, -1) })).toContain('L.estrutura')
    expect(rules({ ...ok, steps: ok.steps.filter((s) => s.type !== 'name') })).toContain('L.padrao')
    const gd: Lesson = {
      phase: 'W1-P08',
      strategy: 'Festa',
      steps: [
        { type: 'say', text: 'Vamos juntar!' },
        { type: 'say', text: 'Vamos juntar mais.' },
      ],
    }
    expect(validateLesson(gd, ctx)).toEqual([])
  })

  it('reprova fase que não existe no catálogo', () => {
    expect(rules({ ...ok, phase: 'W1-P05' })).toContain('L.fase')
  })
})

describe('validateLessonCoverage', () => {
  it('toda fase catalogada dos mundos com lição precisa de lição', () => {
    const issues = validateLessonCoverage([ok], ctx.worlds)
    expect(issues.map((i) => i.problemId)).toEqual(['W1-P08'])
  })

  it('não cobra mundos sem nenhuma lição', () => {
    expect(validateLessonCoverage([], ctx.worlds)).toEqual([])
  })

  it('reprova duas lições da mesma fase', () => {
    expect(validateLessonCoverage([ok, ok], ctx.worlds).some((i) => i.rule === 'L.duplicada')).toBe(
      true,
    )
  })
})
