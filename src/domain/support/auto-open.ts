import type { FactStatus, SupportKind } from '../ports/types'

/**
 * Apoios que a tela abre sozinha ao mostrar o fato (mecanica-aprendizagem.md, "Apoios e a retirada"): em Aprendendo,
 * Mãozinhas e quadro de dez; em Praticando e acima só pelo botão de ajuda, que fica sempre visível.
 * Abrir sozinho conta como apoio usado (a Attempt registra), então nunca promove a Fluente.
 */
export function autoOpenSupports(status: FactStatus): SupportKind[] {
  return status === 'novo' || status === 'aprendendo' ? ['dedos', 'quadro-de-dez'] : []
}
