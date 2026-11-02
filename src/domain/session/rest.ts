import { PARAMS } from '../config/params'

/**
 * O Calú convida a descansar a partir do mínimo da sessão (D12). É só convite: a criança pode continuar, e o
 * tempo nunca aparece na tela. `now` vem do `Clock` injetado.
 */
export function shouldSuggestRest(startedAt: Date, now: Date): boolean {
  return now.getTime() - startedAt.getTime() >= PARAMS.sessionMinutes.min * 60_000
}
