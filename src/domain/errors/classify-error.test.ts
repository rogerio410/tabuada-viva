import { describe, expect, it } from 'vitest'
import { classifyError, hintPlan, type ErrorItem } from './classify-error'

const fact = (factId: string): ErrorItem => ({ kind: 'fact', factId })
const story = (
  expectedOp: 'add' | 'sub' | 'mul' | 'div',
  chosenOp: 'add' | 'sub' | 'mul' | 'div',
): ErrorItem => ({
  kind: 'story',
  expectedOp,
  chosenOp,
})

describe('classifyError (por tabela: item, resposta -> tipo)', () => {
  const table: Array<[string, ErrorItem, number, string]> = [
    // × : somou em vez de multiplicar
    ['6 × 4 = 10', fact('mul:4x6'), 10, 'added_instead_of_multiplied'],
    ['3 × 7 = 10', fact('mul:3x7'), 10, 'added_instead_of_multiplied'],
    // × : errou um grupo
    ['6 × 6 = 30', fact('mul:6x6'), 30, 'off_by_one_group'],
    ['7 × 6 = 36 (era 42)', fact('mul:6x7'), 36, 'off_by_one_group'],
    ['7 × 6 = 48', fact('mul:6x7'), 48, 'off_by_one_group'],
    ['4 × 8 = 36', fact('mul:4x8'), 36, 'off_by_one_group'],
    // ÷ : multiplicou em vez de dividir
    ['12 ÷ 3 = 36', fact('div:12/3'), 36, 'multiplied_instead_of_divided'],
    ['20 ÷ 4 = 80', fact('div:20/4'), 80, 'multiplied_instead_of_divided'],
    // ÷ : outro divisor da família
    ['12 ÷ 3 = 6', fact('div:12/3'), 6, 'used_wrong_divisor'],
    ['12 ÷ 3 = 3', fact('div:12/3'), 3, 'used_wrong_divisor'],
    ['24 ÷ 6 = 12', fact('div:24/6'), 12, 'used_wrong_divisor'],
    // sem padrão reconhecido
    ['3 + 4 = 8', fact('add:3+4'), 8, 'other'],
    ['9 − 4 = 6', fact('sub:9-4'), 6, 'other'],
    ['6 × 4 = 3', fact('mul:4x6'), 3, 'other'],
    // história: escolheu a operação errada
    ['somou onde era repartir', story('div', 'add'), 5, 'wrong_operation'],
    ['subtraiu onde era juntar', story('add', 'sub'), 5, 'wrong_operation'],
  ]
  for (const [name, item, answer, expected] of table)
    it(`${name} -> ${expected}`, () => expect(classifyError(item, answer)).toBe(expected))

  it('história com a operação certa e conta errada não é erro de interpretação', () => {
    expect(classifyError(story('add', 'add'), 9)).toBe('other')
  })

  it('resposta em branco, negativa ou não inteira vira other, sem lançar', () => {
    for (const bad of [NaN, -3, 2.5, Infinity])
      expect(classifyError(fact('mul:3x4'), bad)).toBe('other')
  })

  it('fato inválido vira other, sem lançar', () => {
    expect(classifyError(fact('nada'), 4)).toBe('other')
  })

  it('quando a resposta é a + b e também um grupo a mais ou a menos, vale a soma (vem primeiro)', () => {
    // 3 × 3 = 6 (a + b); 3 × 4 = 12, 2 × 3 = 6: aqui 6 = 2 × 3 = (a-1) × b, mas é também 3 + 3
    expect(classifyError(fact('mul:3x3'), 6)).toBe('added_instead_of_multiplied')
  })

  it('swapped_subtraction não é detectado neste sprint (cai em other)', () => {
    expect(classifyError(fact('sub:8-5'), 13)).toBe('other') // 8 + 5
  })
})

describe('hintPlan: a dica desce a cadeia até a soma (D11)', () => {
  it('multiplicação: soma repetida', () => {
    expect(hintPlan(fact('mul:3x4'), 'added_instead_of_multiplied')).toEqual({
      errorType: 'added_instead_of_multiplied',
      factId: 'mul:3x4',
      steps: ['add:4+4'],
    })
  })
  it('divisão: × irmão e depois a soma', () => {
    expect(hintPlan(fact('div:12/3'), 'multiplied_instead_of_divided').steps).toEqual([
      'mul:3x4',
      'add:4+4',
    ])
  })
  it('subtração: adição inversa', () => {
    expect(hintPlan(fact('sub:13-8'), 'other').steps).toEqual(['add:5+8'])
  })
  it('adição não tem degrau: o passo é o próprio fato', () => {
    expect(hintPlan(fact('add:3+4'), 'other').steps).toEqual(['add:3+4'])
  })
  it('história sem fato: sem passos (a releitura é da UI)', () => {
    expect(hintPlan(story('div', 'add'), 'wrong_operation').steps).toEqual([])
  })
})
