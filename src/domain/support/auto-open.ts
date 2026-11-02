import type { FactStatus, SupportKind } from '../ports/types'

/**
 * Apoios que a tela abre sozinha ao mostrar o fato (mecanica-aprendizagem.md, "Apoios e a retirada"): em Aprendendo,
 * Mãozinhas e quadro de dez; em Praticando e acima só pelo botão de ajuda, que fica sempre visível.
 * Abrir sozinho é só uma oferta: o apoio só entra em `supportsUsed` quando a criança toca nele (ou abre pelo botão),
 * e nesse caso nunca promove a Fluente.
 */
export function autoOpenSupports(status: FactStatus): SupportKind[] {
  return status === 'novo' || status === 'aprendendo' ? ['dedos', 'quadro-de-dez'] : []
}
