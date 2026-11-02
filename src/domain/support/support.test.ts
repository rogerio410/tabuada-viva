import { describe, expect, it } from 'vitest'
import { isUnsupported, supportRate } from './support'

const a = (supportsUsed: string[], over: object = {}) => ({
  supportsUsed: supportsUsed as never[],
  correct: true,
  ...over,
})

describe('isUnsupported (única definição de "sem apoio")', () => {
  it('sem nenhum apoio aberto', () => expect(isUnsupported(a([]))).toBe(true))
  it('qualquer apoio aberto', () => {
    for (const s of ['dedos', 'quadro-de-dez', 'reta', 'contas', 'grupos', 'tabela'])
      expect(isUnsupported(a([s])), s).toBe(false)
  })
  it('vários apoios', () => expect(isUnsupported(a(['dedos', 'reta']))).toBe(false))
})

describe('supportRate', () => {
  it('fração de respostas com apoio', () => {
    expect(supportRate([a([]), a(['dedos']), a([]), a([])])).toBe(0.25)
  })
  it('sem respostas devolve null (sem evidência, não 0)', () => {
    expect(supportRate([])).toBeNull()
  })
})
