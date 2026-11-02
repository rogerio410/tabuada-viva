import { describe, expect, it } from 'vitest'
import { problemSchema, type Problem } from '../schema/problem.ts'
import { worldSchema } from '../schema/world.ts'
import { forbiddenHits, numberWords, sentences, unknownWords } from './text.ts'
import { validateBatch, validateProblem, type ValidationContext } from './validate.ts'

const world1 = worldSchema.parse({
  id: 1,
  name: 'Casa do Calú',
  phases: [
    { id: 'W1-P01', name: 'a', newFacts: ['add:0+1', 'add:1+6', 'add:3+7'] },
    { id: 'W1-P02', name: 'b', newFacts: ['add:2+2'] },
  ],
})

const ctx: ValidationContext = {
  worlds: [world1],
  allowedWords: new Set(
    'o a de tem bolinha bolinhas ganha mais quantas agora calú ele na mesa quantos ainda cabem leva passageiros já nele ônibus'.split(
      ' ',
    ),
  ),
  forbiddenWords: ['rápido', 'você errou', 'medo'],
}

const base: Problem = {
  id: 'W1-P01-H01',
  phase: 'W1-P01',
  text: 'O Calú tem 1 bolinha. Ele ganha mais 6 bolinhas. Quantas bolinhas o Calú tem agora?',
  context: 'casa',
  type: 'acrescentar',
  fact: 'add:1+6',
  rootChain: [],
  numbers: [1, 6],
  answer: 7,
  distractors: [6, 8],
}

const rules = (p: Problem, c = ctx) =>
  validateProblem(p, c)
    .filter((i) => i.severity === 'error')
    .map((i) => i.rule)

describe('validateProblem', () => {
  it('aceita uma história correta', () => {
    expect(validateProblem(base, ctx)).toEqual([])
  })

  it('reprova conta errada', () => {
    expect(rules({ ...base, answer: 8, distractors: [6, 7] })).toContain('B.conta')
  })

  it('reprova números do texto que não vêm do fato', () => {
    expect(rules({ ...base, text: base.text.replace('6', '5'), numbers: [1, 5] })).toContain(
      'B.numeros',
    )
  })

  it('reprova numbers que não batem com os algarismos do texto', () => {
    expect(rules({ ...base, numbers: [6, 1] })).toContain('B.numeros')
  })

  it('reprova números fora da faixa do mundo', () => {
    const p = {
      ...base,
      fact: 'add:6+7',
      numbers: [6, 7],
      answer: 13,
      text: 'O Calú tem 6 bolinhas. Ele ganha mais 7 bolinhas. Quantas bolinhas o Calú tem agora?',
    }
    expect(rules(p)).toContain('B.faixa')
  })

  it('reprova distrator igual à resposta, repetido ou fora da faixa', () => {
    expect(rules({ ...base, distractors: [7, 8] })).toContain('B.distratores')
    expect(rules({ ...base, distractors: [8, 8] })).toContain('B.distratores')
    expect(rules({ ...base, distractors: [8, 30] })).toContain('B.distratores')
  })

  it('reprova fato ainda não apresentado', () => {
    expect(
      rules({
        ...base,
        phase: 'W1-P01',
        fact: 'add:2+2',
        numbers: [2, 2],
        answer: 4,
        text: 'O Calú tem 2 bolinhas. Ele ganha mais 2 bolinhas. Quantas bolinhas o Calú tem agora?',
        distractors: [3, 5],
      }),
    ).toContain('B.apresentados')
  })

  it('avisa (sem reprovar) quando a fase não está no catálogo', () => {
    const issues = validateProblem({ ...base, phase: 'W3-P01', id: 'W3-P01-H01' }, ctx)
    expect(issues.some((i) => i.severity === 'warning' && i.rule === 'B.apresentados')).toBe(true)
  })

  it('exige cadeia de fatos raiz correta em −, × e ÷ (D11)', () => {
    const sub = {
      ...base,
      id: 'W1-P01-H02',
      type: 'retirar' as const,
      fact: 'sub:9-4',
      numbers: [9, 4],
      answer: 5,
      distractors: [4, 6],
      text: 'O Calú tem 9 bolinhas. Ele dá 4 bolinhas. Quantas bolinhas o Calú tem agora?',
    }
    expect(rules({ ...sub, rootChain: [] })).toContain('A.raiz')
    expect(rules({ ...sub, rootChain: ['add:4+5'] })).not.toContain('A.raiz')
  })

  it('exige soma repetida em × e que ela bata com o produto', () => {
    const mul = {
      ...base,
      type: 'grupos iguais' as const,
      fact: 'mul:2x4',
      rootChain: ['add:4+4'],
      numbers: [4, 2],
      answer: 8,
      distractors: [6, 12],
      text: 'Cada cesta tem 4 bolinhas. O Calú tem 2 cestas. Quantas bolinhas ele tem?',
    }
    expect(rules(mul)).toContain('A.soma')
    expect(rules({ ...mul, repeatedSum: [4, 4, 4] })).toContain('A.soma')
    expect(rules({ ...mul, repeatedSum: [4, 4] })).not.toContain('A.soma')
  })

  it('"completar" em adição pergunta a parcela que falta', () => {
    const p = {
      ...base,
      type: 'completar' as const,
      fact: 'add:3+7',
      numbers: [10, 3],
      answer: 7,
      distractors: [6, 8],
      text: 'O ônibus leva 10 passageiros. Já tem 3 passageiros nele. Quantos passageiros ainda cabem?',
    }
    expect(validateProblem(p, ctx)).toEqual([])
    expect(rules({ ...p, answer: 10, distractors: [6, 8] })).toContain('B.conta')
  })

  it('reprova tipo incompatível com a operação', () => {
    expect(rules({ ...base, type: 'repartir' })).toContain('A.tipo')
  })

  it('reprova palavra proibida, número por extenso, frase longa e vocabulário fora da lista', () => {
    expect(
      rules({
        ...base,
        text: 'O Calú tem 1 bolinha. Ele ganha mais 6 bolinhas com medo. Quantas bolinhas o Calú tem agora?',
      }),
    ).toContain('C.proibidas')
    expect(
      rules({
        ...base,
        text: 'O Calú tem 1 bolinha. Ele ganha mais seis bolinhas 6. Quantas bolinhas o Calú tem agora?',
      }),
    ).toContain('C.algarismo')
    expect(
      rules({
        ...base,
        text: 'O Calú tem 1 bolinha ele ganha mais 6 bolinhas e depois mais bolinhas na mesa agora. Quantas bolinhas o Calú tem?',
      }),
    ).toContain('C.tamanho')
    expect(rules({ ...base, text: base.text.replace('bolinha.', 'xícara.') })).toContain(
      'C.vocabulario',
    )
  })

  it('reprova número de frases fora de 2–4 e pergunta mal posicionada', () => {
    expect(
      rules({ ...base, text: 'Quantas bolinhas o Calú tem agora 1 6?', numbers: [1, 6] }),
    ).toContain('C.frases')
    expect(
      rules({
        ...base,
        text: 'O Calú tem 1 bolinha? Ele ganha mais 6 bolinhas. Quantas bolinhas ele tem agora.',
      }),
    ).toContain('C.pergunta')
  })

  it('reprova URL, e-mail e telefone', () => {
    expect(rules({ ...base, text: base.text + ' www.exemplo.com' })).toContain('C.contato')
  })

  it('resto só de W8-P07 em diante', () => {
    expect(rules({ ...base, remainder: 1 })).toContain('B.resto')
  })
})

describe('validateBatch', () => {
  it('reprova id duplicado', () => {
    expect(
      validateBatch([base, base], ctx).some(
        (i) => i.rule === 'A.id' && i.message === 'id duplicado',
      ),
    ).toBe(true)
  })

  it('em lote grande, um contexto acima de 30% reprova; em lote pequeno só avisa', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      ...base,
      id: `W1-P01-H${String(i + 1).padStart(2, '0')}`,
    }))
    expect(
      validateBatch(many, ctx).some((i) => i.rule === 'G.distribuicao' && i.severity === 'error'),
    ).toBe(true)
    const few = validateBatch([base, { ...base, id: 'W1-P01-H02' }], ctx)
    expect(few.some((i) => i.rule === 'G.distribuicao' && i.severity === 'warning')).toBe(true)
    expect(few.some((i) => i.severity === 'error')).toBe(false)
  })
})

describe('schema', () => {
  it('rejeita contexto, tipo e fato inválidos', () => {
    expect(problemSchema.safeParse({ ...base, context: 'lua' }).success).toBe(false)
    expect(problemSchema.safeParse({ ...base, type: 'dançar' }).success).toBe(false)
    expect(problemSchema.safeParse({ ...base, fact: 'add:7+1' }).success).toBe(false)
    expect(problemSchema.safeParse({ ...base, id: 'x' }).success).toBe(false)
    expect(problemSchema.safeParse(base).success).toBe(true)
  })
})

describe('text helpers', () => {
  it('separa frases e acha problemas', () => {
    expect(sentences('Oi. Tudo bem? Sim!')).toEqual(['Oi.', 'Tudo bem?', 'Sim!'])
    expect(numberWords('Tem dois e 3')).toEqual(['dois'])
    expect(forbiddenHits('Você errou de novo', ['você errou'])).toEqual(['você errou'])
    expect(forbiddenHits('Foi um erro grande', ['rápido'])).toEqual([])
    expect(unknownWords('O gato', new Set(['o']))).toEqual(['gato'])
  })
})
