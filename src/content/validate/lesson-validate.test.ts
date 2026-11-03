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

describe('regras de ensino (copiar a tela, viés do cartão do meio)', () => {
  const ask = (expr: string, answer: number): Lesson['steps'][number] => ({
    type: 'ask',
    expr,
    answer,
  })
  const strip = (items: string[], correct = 0): Lesson['steps'][number] => ({
    type: 'choose',
    prompt: 'Quanto é?',
    strip: items,
    options: ['1', '3', '5'],
    correct,
  })

  it('reprova pergunta que repete uma conta já respondida ou já mostrada com o resultado', () => {
    // a mesma conta duas vezes (também na ordem trocada)
    expect(rules(withStep(ask('3 + 2', 5), 2))).toContain('L.copia')
    expect(rules(withStep(ask('2 + 3', 5), 2))).toContain('L.copia')
    // conta que a tira já mostrou com resultado, antes da pergunta
    const shown = withStep(strip(['1 + 0 = 1', '6 + 1 = 7', '?']), 3)
    expect(rules({ ...shown, steps: [...shown.steps, ask('6 + 1', 7)] })).toContain('L.copia')
  })

  it('aceita a conta que era o "?" da tira e a conta que só aparece depois da pergunta', () => {
    const l: Lesson = {
      ...ok,
      steps: [
        ...ok.steps.slice(0, 1),
        ask('4 + 4', 8),
        strip(['1 + 1 = 2', '4 + 4 = ?'], 1),
        ...ok.steps.slice(3),
      ],
    }
    expect(rules(l)).not.toContain('L.copia')
  })

  it('"a + ? = c" conta como a mesma conta que a soma', () => {
    expect(rules(withStep(ask('3 + ? = 5', 2), 2))).toContain('L.copia')
  })

  it('reprova lote com o cartão certo quase sempre no meio', () => {
    const mk = (correct: number): Lesson => ({
      ...ok,
      steps: ok.steps.map((s) =>
        s.type === 'choose' ? { ...s, correct: correct as 0 | 1 | 2 } : s,
      ),
    })
    const biased = [mk(1), mk(1), mk(1), mk(0)].map((l, i) => ({ ...l, phase: `W1-P0${i + 1}` }))
    const issues = validateLessonCoverage(biased, ctx.worlds)
    expect(issues.some((i) => i.rule === 'L.vies')).toBe(true)
    const varied = [mk(0), mk(2), mk(1), mk(2)].map((l, i) => ({ ...l, phase: `W1-P0${i + 1}` }))
    expect(validateLessonCoverage(varied, ctx.worlds).some((i) => i.rule === 'L.vies')).toBe(false)
  })

  it('passo "move" não passa mais objetos do que há', () => {
    expect(rules(withStep({ type: 'move', from: 0, to: 4, object: 'ficha' }))).toContain('L.move')
    expect(rules(withStep({ type: 'move', from: 6, to: 4, object: 'ficha' }))).not.toContain(
      'L.move',
    )
  })
})
