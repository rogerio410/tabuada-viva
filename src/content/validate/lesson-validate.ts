import type { Lesson, LessonStep } from '../schema/lesson.ts'
import type { World } from '../schema/world.ts'
import type { Issue } from './validate.ts'
import {
  forbiddenHits,
  hasLinkOrContact,
  numberWords,
  sentences,
  unknownWords,
  wordCount,
} from './text.ts'

export interface LessonContext {
  worlds: World[]
  /** Vocabulário das lições (lista própria, aprovada pelo responsável). */
  allowedWords: Set<string>
  forbiddenWords: string[]
}

const MAX_WORDS = 10
const ARITH = /^(\d+) ([+−-]) (\d+) = (\d+)$/
const SIMPLE = /^(\d+) ([+−-]) (\d+)$/
const MISSING = /^(\d+) \+ \? = (\d+)$/

const op = (a: number, sign: string, b: number) => (sign === '+' ? a + b : a - b)

/** Resultado de uma expressão de `ask` (`3 + 2`, `5 − 2`, `3 + ? = 10`); null se não entendida. */
export function evalExpr(expr: string): number | null {
  const s = SIMPLE.exec(expr)
  if (s) return op(Number(s[1]), s[2]!, Number(s[3]))
  const m = MISSING.exec(expr)
  if (m) return Number(m[2]) - Number(m[1])
  return null
}

/** Textos que a criança lê num passo (para as regras de voz). */
function textsOf(step: LessonStep): string[] {
  switch (step.type) {
    case 'say':
    case 'name':
      return [step.text]
    case 'ask':
      return step.prompt ? [step.prompt] : []
    case 'choose':
      return [step.prompt, ...step.options.filter((o) => /\p{L}/u.test(o))]
    default:
      return []
  }
}

export function validateLesson(lesson: Lesson, ctx: LessonContext): Issue[] {
  const out: Issue[] = []
  const err = (rule: string, message: string) =>
    out.push({ severity: 'error', problemId: lesson.phase, rule, message })

  const phase = ctx.worlds.flatMap((w) => w.phases).find((p) => p.id === lesson.phase)
  if (!phase) err('L.fase', `fase ${lesson.phase} fora do catálogo`)

  for (const [i, step] of lesson.steps.entries()) {
    const at = `passo ${i + 1} (${step.type})`
    for (const t of textsOf(step)) {
      for (const s of sentences(t))
        if (wordCount(s) > MAX_WORDS)
          err('D.frase-longa', `${at}: mais de ${MAX_WORDS} palavras: "${s}"`)
      const hits = forbiddenHits(t, ctx.forbiddenWords)
      if (hits.length) err('D.proibida', `${at}: palavra proibida: ${hits.join(', ')}`)
      const nums = numberWords(t)
      if (nums.length) err('D.numero-extenso', `${at}: número por extenso: ${nums.join(', ')}`)
      const unk = unknownWords(t, ctx.allowedWords)
      if (unk.length)
        err('E.vocabulario', `${at}: fora do vocabulário das lições: ${unk.join(', ')}`)
      if (hasLinkOrContact(t)) err('D.contato', `${at}: link ou contato`)
    }
    if (step.type === 'ask') {
      const r = evalExpr(step.expr)
      if (r === null) err('L.conta', `${at}: expressão não entendida: "${step.expr}"`)
      else if (r !== step.answer) err('L.conta', `${at}: ${step.expr} é ${r}, não ${step.answer}`)
    }
    if (step.type === 'choose')
      for (const item of step.strip ?? []) {
        const m = ARITH.exec(item)
        if (m && op(Number(m[1]), m[2]!, Number(m[3])) !== Number(m[4]))
          err('L.tira', `${at}: conta errada na tira: "${item}"`)
      }
    if (step.type === 'numline' && step.back && step.start - step.hops < 0)
      err('L.reta', `${at}: a reta passa de 0`)
    if (step.type === 'numline' && !step.back && step.start + step.hops > 20)
      err('L.reta', `${at}: a reta passa de 20`)
    if (step.type === 'remove' && step.take > step.from)
      err('L.remove', `${at}: tira mais do que tem`)
  }

  // Estrutura: começa falando; fases com fato novo terminam numa pergunta e descobrem um padrão.
  if (lesson.steps[0]?.type !== 'say')
    err('L.estrutura', 'a lição deve começar com uma fala do Calú')
  if (phase && !phase.grandChallenge) {
    if (lesson.steps.at(-1)?.type !== 'ask')
      err('L.estrutura', 'a lição deve terminar numa pergunta (passo abstrato)')
    const choose = lesson.steps.findIndex((s) => s.type === 'choose')
    const name = lesson.steps.findIndex((s) => s.type === 'name')
    if (choose < 0 || name < choose)
      err('L.padrao', 'falta o padrão do dia: um passo `choose` e depois `name`')
  }
  return out
}

/** Todo mundo que tem lição precisa de lição em todas as fases catalogadas, uma por fase. */
export function validateLessonCoverage(lessons: Lesson[], worlds: World[]): Issue[] {
  const out: Issue[] = []
  const seen = new Set<string>()
  for (const l of lessons) {
    if (seen.has(l.phase))
      out.push({
        severity: 'error',
        problemId: l.phase,
        rule: 'L.duplicada',
        message: 'duas lições da mesma fase',
      })
    seen.add(l.phase)
  }
  const worldIds = new Set(lessons.map((l) => Number(/^W(\d)/.exec(l.phase)?.[1])))
  for (const w of worlds)
    if (worldIds.has(w.id))
      for (const p of w.phases)
        if (!seen.has(p.id))
          out.push({
            severity: 'error',
            problemId: p.id,
            rule: 'L.faltando',
            message: 'fase sem lição',
          })
  return out
}
