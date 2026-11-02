import { parseFactId, rootChain, type Op } from '../facts/fact-id'
import type { ErrorType } from '../ports/types'

/** O que foi perguntado: um fato avulso ou uma história em que a criança escolhe a operação. */
export type ErrorItem =
  { kind: 'fact'; factId: string } | { kind: 'story'; expectedOp: Op; chosenOp: Op }

export interface HintPlan {
  errorType: ErrorType
  factId: string | null
  /** Degraus da cadeia, do mais próximo à soma de origem (D11). O TEXTO da dica é 100% revisão humana. */
  steps: string[]
}

const isCount = (n: number) => Number.isFinite(n) && Number.isInteger(n) && n >= 0

/**
 * Classifica o erro de uma resposta (docs/gdd/tipos-de-erro-e-dicas.md). Nunca lança: resposta fora do
 * formato, fato inválido ou padrão desconhecido viram `other`. `slow_counting` não é erro (D3, não implementado
 * neste sprint) e `swapped_subtraction` só vale em história (Sprint 3), então não são devolvidos aqui;
 * `money_change_error` fica para o Sprint 5.
 */
export function classifyError(item: ErrorItem, answer: number): ErrorType {
  if (item.kind === 'story') return item.chosenOp !== item.expectedOp ? 'wrong_operation' : 'other'
  const fact = parseFactId(item.factId)
  if (!fact || !isCount(answer) || answer === fact.result) return 'other'
  const { a, b } = fact

  if (fact.op === 'mul') {
    if (answer === a + b) return 'added_instead_of_multiplied'
    const neighbours = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b]
    if (neighbours.includes(answer)) return 'off_by_one_group'
  }
  if (fact.op === 'div') {
    if (answer === a * b) return 'multiplied_instead_of_divided'
    // outro divisor da família: o dividendo dividido por um divisor diferente do pedido
    for (let d = 1; d <= 10; d++)
      if (d !== b && a % d === 0 && a / d === answer) return 'used_wrong_divisor'
  }
  return 'other'
}

/** Plano da dica: os degraus da cadeia de fatos raiz; adição volta ao próprio fato; história não tem degraus. */
export function hintPlan(item: ErrorItem, errorType: ErrorType): HintPlan {
  if (item.kind === 'story') return { errorType, factId: null, steps: [] }
  const chain = rootChain(item.factId) ?? []
  return { errorType, factId: item.factId, steps: chain.length ? chain : [item.factId] }
}
