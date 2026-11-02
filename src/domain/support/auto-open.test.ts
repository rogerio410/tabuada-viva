import { describe, expect, it } from 'vitest'
import { autoOpenSupports } from './auto-open'

describe('autoOpenSupports', () => {
  it('Aprendendo (e Novo) abre Mãozinhas e quadro de dez sozinhos', () => {
    expect(autoOpenSupports('aprendendo')).toEqual(['dedos', 'quadro-de-dez'])
    expect(autoOpenSupports('novo')).toEqual(['dedos', 'quadro-de-dez'])
  })

  it('Praticando, Fluente e Dominado só pelo botão de ajuda', () => {
    for (const s of ['praticando', 'fluente', 'dominado'] as const) {
      expect(autoOpenSupports(s)).toEqual([])
    }
  })
})
