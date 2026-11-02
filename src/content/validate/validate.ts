import { parseFactId, rootChain } from '../../domain/facts/fact-id.ts'
import { phaseOrder, type Problem, type ProblemType } from '../schema/index.ts'
import { WORLD_RANGES, type World } from '../schema/world.ts'
import {
  forbiddenHits,
  hasLinkOrContact,
  numberWords,
  sentences,
  unknownWords,
  wordCount,
} from './text.ts'

export interface Issue {
  severity: 'error' | 'warning'
  problemId: string
  rule: string
  message: string
}

export interface ValidationContext {
  worlds: World[]
  /** Palavras permitidas (minúsculas). */
  allowedWords: Set<string>
  /** Palavras e expressões proibidas (voz do Calú + segurança infantil). */
  forbiddenWords: string[]
}

export const LIMITS = {
  maxWordsPerSentence: 10,
  minSentences: 2,
  maxSentences: 4,
  /** Nenhum contexto/tipo passa de 30% do lote (checklist G). */
  maxShare: 0.3,
  /** Abaixo disto a regra de distribuição vira só aviso. */
  minBatchForShare: 10,
} as const

/** Operação aceita por tipo de problema. */
const TYPE_OPS: Record<ProblemType, Array<'add' | 'sub' | 'mul' | 'div'>> = {
  juntar: ['add'],
  acrescentar: ['add'],
  retirar: ['sub'],
  comparar: ['sub'],
  completar: ['add', 'sub'],
  'grupos iguais': ['mul'],
  'a cada': ['mul'],
  retangular: ['mul'],
  repartir: ['div'],
  medir: ['add', 'sub', 'mul', 'div'],
}

/** Fatos já apresentados até a fase (inclusive); null se a fase não está no catálogo. */
function presentedFacts(worlds: World[], phase: string): Set<string> | null {
  const all = worlds.flatMap((w) => w.phases)
  if (!all.some((p) => p.id === phase)) return null
  const limit = phaseOrder(phase)
  return new Set(all.filter((p) => phaseOrder(p.id) <= limit).flatMap((p) => p.newFacts))
}

export function validateProblem(p: Problem, ctx: ValidationContext): Issue[] {
  const issues: Issue[] = []
  const err = (rule: string, message: string) =>
    issues.push({ severity: 'error', problemId: p.id, rule, message })
  const warn = (rule: string, message: string) =>
    issues.push({ severity: 'warning', problemId: p.id, rule, message })

  if (!p.id.startsWith(`${p.phase}-`)) err('A.id', `o id deve começar por ${p.phase}`)

  // --- A/B: fato, conta e raiz ---------------------------------------------------------
  const fact = parseFactId(p.fact)
  if (!fact) {
    err('A.fato', `fato inválido: ${p.fact}`)
    return issues
  }
  // "Completar" com adição pergunta a parcela que falta (3 + ? = 10): a resposta é um dos termos.
  const missingAddend = p.type === 'completar' && fact.op === 'add'
  if (missingAddend) {
    if (p.answer !== fact.a && p.answer !== fact.b)
      err(
        'B.conta',
        `${p.fact}: a parcela que falta é ${fact.a} ou ${fact.b}, mas a resposta é ${p.answer}`,
      )
  } else if (p.answer !== fact.result)
    err('B.conta', `${p.fact} = ${fact.result}, mas a resposta é ${p.answer}`)

  const expectedChain = rootChain(p.fact) ?? []
  if (JSON.stringify(p.rootChain) !== JSON.stringify(expectedChain))
    err(
      'A.raiz',
      `cadeia de fatos raiz deveria ser [${expectedChain.join(', ')}], veio [${p.rootChain.join(', ')}]`,
    )

  if (!TYPE_OPS[p.type].includes(fact.op))
    err('A.tipo', `tipo "${p.type}" não combina com a operação ${fact.op}`)

  const operands = [fact.a, fact.b]
  const textNums = [...p.text.matchAll(/\d+/g)].map((m) => Number(m[0]))
  if (JSON.stringify(textNums) !== JSON.stringify(p.numbers))
    err('B.numeros', `numbers [${p.numbers}] não bate com os algarismos do texto [${textNums}]`)
  if (p.numbers.includes(p.answer) && !operands.includes(p.answer))
    err('B.numeros', 'a resposta aparece no enunciado')
  if (p.type !== 'medir') {
    const used = [...p.numbers].sort((x, y) => x - y)
    let wanted = [...operands].sort((x, y) => x - y)
    if (missingAddend) {
      // o enunciado traz o total e a parcela que não é a resposta
      const known = p.answer === fact.a ? fact.b : fact.a
      wanted = [known, fact.result].sort((x, y) => x - y)
    }
    if (JSON.stringify(used) !== JSON.stringify(wanted))
      err('B.numeros', `os números do texto [${p.numbers}] não vêm do fato ${p.fact}`)
  }

  // Faixa do mundo
  const world = Number(p.phase[1])
  const range = WORLD_RANGES[world]
  if (range) {
    if (p.numbers.some((n) => n > range.maxOperand) || p.answer > range.maxResult)
      err(
        'B.faixa',
        `números fora da faixa do mundo ${world} (operandos ≤ ${range.maxOperand}, resposta ≤ ${range.maxResult})`,
      )
  }
  if (fact.op === 'mul' && (fact.a > 10 || fact.b > 10))
    err('B.faixa', 'fatores de × devem ficar em 0–10')
  if (fact.op === 'div' && (fact.b > 10 || fact.result > 10))
    err('B.faixa', 'divisor e quociente devem ficar em 0–10')

  // Soma repetida em ×
  if (fact.op === 'mul' && fact.a >= 2) {
    const sum = p.repeatedSum
    const parcel = fact.b
    if (!sum) err('A.soma', 'multiplicação exige a soma repetida de origem (repeatedSum)')
    else if (sum.length !== fact.a || sum.some((n) => n !== parcel))
      err('A.soma', `repeatedSum deveria ser ${fact.a} parcelas de ${parcel}`)
  }
  if (p.remainder !== undefined) {
    if (phaseOrder(p.phase) < phaseOrder('W8-P07'))
      err('B.resto', 'problema com resto só de W8-P07 em diante')
  }

  // Fatos apresentados
  const presented = presentedFacts(ctx.worlds, p.phase)
  if (!presented)
    warn(
      'B.apresentados',
      `fase ${p.phase} fora do catálogo: checagem de fatos apresentados pulada`,
    )
  else {
    for (const f of [p.fact, ...p.rootChain.filter((r) => r.startsWith('add:'))])
      if (!presented.has(f) && parseFactId(f)?.op !== 'mul')
        err('B.apresentados', `${f} ainda não foi apresentado até ${p.phase}`)
  }

  // Distratores
  const d = p.distractors
  if (new Set(d).size !== d.length) err('B.distratores', 'distratores repetidos')
  if (d.includes(p.answer)) err('B.distratores', 'um distrator é igual à resposta certa')
  if (range && d.some((n) => n > range.maxResult))
    err('B.distratores', 'distrator fora da faixa do mundo')

  // --- C/D/E: texto ----------------------------------------------------------------------
  const sents = sentences(p.text)
  if (sents.length < LIMITS.minSentences || sents.length > LIMITS.maxSentences)
    err(
      'C.frases',
      `a história deve ter ${LIMITS.minSentences} a ${LIMITS.maxSentences} frases (tem ${sents.length})`,
    )
  for (const s of sents)
    if (wordCount(s) > LIMITS.maxWordsPerSentence)
      err(
        'C.tamanho',
        `frase com ${wordCount(s)} palavras (máx. ${LIMITS.maxWordsPerSentence}): "${s}"`,
      )
  const last = sents.at(-1) ?? ''
  if (!last.endsWith('?') || (p.text.match(/\?/g) ?? []).length !== 1)
    err('C.pergunta', 'a última frase (e só ela) deve ser a pergunta')
  const words = numberWords(p.text)
  if (words.length) err('C.algarismo', `número por extenso: ${words.join(', ')}`)
  const hits = forbiddenHits(p.text, ctx.forbiddenWords)
  if (hits.length) err('C.proibidas', `palavras proibidas: ${hits.join(', ')}`)
  if (hasLinkOrContact(p.text)) err('C.contato', 'texto com URL, e-mail ou telefone')
  const unknown = unknownWords(p.text, ctx.allowedWords)
  if (unknown.length) err('C.vocabulario', `fora da lista de 2º ano: ${unknown.join(', ')}`)

  return issues
}

function shareIssues(problems: Problem[], key: 'context' | 'type'): Issue[] {
  const counts = new Map<string, number>()
  for (const p of problems) counts.set(p[key], (counts.get(p[key]) ?? 0) + 1)
  const out: Issue[] = []
  for (const [value, n] of counts) {
    if (n / problems.length > LIMITS.maxShare)
      out.push({
        severity: problems.length >= LIMITS.minBatchForShare ? 'error' : 'warning',
        problemId: '(lote)',
        rule: 'G.distribuicao',
        message: `${key} "${value}" tem ${n}/${problems.length} do lote (máx. ${LIMITS.maxShare * 100}%)`,
      })
  }
  return out
}

/** Valida um lote inteiro: cada história + IDs únicos + distribuição. */
export function validateBatch(problems: Problem[], ctx: ValidationContext): Issue[] {
  const issues = problems.flatMap((p) => validateProblem(p, ctx))
  const seen = new Set<string>()
  for (const p of problems) {
    if (seen.has(p.id))
      issues.push({ severity: 'error', problemId: p.id, rule: 'A.id', message: 'id duplicado' })
    seen.add(p.id)
  }
  issues.push(...shareIssues(problems, 'context'), ...shareIssues(problems, 'type'))
  return issues
}
