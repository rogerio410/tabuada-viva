import { describe, expect, it } from 'vitest'
import { factId, parseFactId, rootChain } from './fact-id'

describe('parseFactId', () => {
  it('lê os quatro formatos e calcula o resultado', () => {
    expect(parseFactId('add:3+4')).toEqual({ id: 'add:3+4', op: 'add', a: 3, b: 4, result: 7 })
    expect(parseFactId('sub:13-8')).toEqual({ id: 'sub:13-8', op: 'sub', a: 13, b: 8, result: 5 })
    expect(parseFactId('mul:3x4')).toEqual({ id: 'mul:3x4', op: 'mul', a: 3, b: 4, result: 12 })
    expect(parseFactId('div:12/3')).toEqual({ id: 'div:12/3', op: 'div', a: 12, b: 3, result: 4 })
  })

  it('exige a forma canônica: par não ordenado a ≤ b em + e × (D10)', () => {
    expect(parseFactId('add:4+3')).toBeNull()
    expect(parseFactId('mul:4x3')).toBeNull()
  })

  it('rejeita subtração negativa, divisão inexata, divisor 0 e lixo', () => {
    expect(parseFactId('sub:3-8')).toBeNull()
    expect(parseFactId('div:13/3')).toBeNull()
    expect(parseFactId('div:5/0')).toBeNull()
    expect(parseFactId('add:3+')).toBeNull()
    expect(parseFactId('add:03+4')).toBeNull()
    expect(parseFactId('foo:1+2')).toBeNull()
  })

  it('aceita as regras (+0, −0, n−n, ×0, ×1, ÷1, n÷n, 0÷n)', () => {
    for (const id of [
      'add:0+7',
      'sub:7-0',
      'sub:7-7',
      'mul:0x7',
      'mul:1x7',
      'div:7/1',
      'div:7/7',
      'div:0/7',
    ])
      expect(parseFactId(id), id).not.toBeNull()
  })
})

describe('factId', () => {
  it('normaliza a ordem de + e ×', () => {
    expect(factId('add', 4, 3)).toBe('add:3+4')
    expect(factId('mul', 4, 3)).toBe('mul:3x4')
    expect(factId('sub', 13, 8)).toBe('sub:13-8')
    expect(factId('div', 12, 3)).toBe('div:12/3')
  })
})

describe('rootChain (D11: todo fato aponta para a adição)', () => {
  it('adição não tem raiz', () => {
    expect(rootChain('add:3+4')).toEqual([])
  })

  it('subtração volta à adição inversa', () => {
    expect(rootChain('sub:13-8')).toEqual(['add:5+8'])
    expect(rootChain('sub:9-4')).toEqual(['add:4+5'])
    expect(rootChain('sub:5-5')).toEqual(['add:0+5'])
    expect(rootChain('sub:5-0')).toEqual(['add:0+5'])
  })

  it('multiplicação vira soma repetida da maior parcela', () => {
    expect(rootChain('mul:2x4')).toEqual(['add:4+4'])
    expect(rootChain('mul:3x4')).toEqual(['add:4+4'])
    expect(rootChain('mul:1x6')).toEqual(['add:0+6'])
    expect(rootChain('mul:0x6')).toEqual(['add:0+0'])
  })

  it('divisão desce um degrau por vez: ÷ → × irmão → soma repetida', () => {
    expect(rootChain('div:12/3')).toEqual(['mul:3x4', 'add:4+4'])
    expect(rootChain('div:14/2')).toEqual(['mul:2x7', 'add:7+7'])
    expect(rootChain('div:7/1')).toEqual(['mul:1x7', 'add:0+7'])
    expect(rootChain('div:0/5')).toEqual(['mul:0x5', 'add:0+0'])
  })

  it('devolve null para id inválido', () => {
    expect(rootChain('nada')).toBeNull()
  })
})
