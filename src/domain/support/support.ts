import type { SupportKind } from '../ports/types'

/** Só o que importa de uma resposta para decidir apoio. */
export interface WithSupport {
  supportsUsed: readonly SupportKind[]
}

/**
 * Única definição de "sem apoio": nenhum apoio foi aberto antes de responder. Alimenta as transições (apoio não
 * promove), o acerto da sessão (D4) e o critério G5 do Portão. O apoio nunca é proibido, só registrado.
 */
export const isUnsupported = (a: WithSupport): boolean => a.supportsUsed.length === 0

/** Fração de respostas com apoio; null quando não há respostas (sem evidência, não zero). */
export function supportRate(attempts: readonly WithSupport[]): number | null {
  if (attempts.length === 0) return null
  return attempts.filter((a) => !isUnsupported(a)).length / attempts.length
}
