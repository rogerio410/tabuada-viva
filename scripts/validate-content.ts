// Valida src/content/** : schema Zod + checklist determinístico (itens A–E de docs/pedagogia/checklist-conteudo.md).
// Sai com código 1 se houver erro; avisos não reprovam.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { lessonBatchSchema, type Lesson } from '../src/content/schema/lesson.ts'
import { storyBatchSchema } from '../src/content/schema/problem.ts'
import { worldSchema } from '../src/content/schema/world.ts'
import { validateLesson, validateLessonCoverage } from '../src/content/validate/lesson-validate.ts'
import {
  validateBatch,
  type Issue,
  type ValidationContext,
} from '../src/content/validate/validate.ts'

const root = new URL('../src/content/', import.meta.url).pathname
const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'))
const jsonFiles = (dir: string) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => join(root, dir, f))

let errors = 0
let warnings = 0
const fail = (where: string, message: string) => {
  errors++
  console.error(`✗ ${where}: ${message}`)
}

const worlds = jsonFiles('phases').flatMap((f) => {
  const r = worldSchema.safeParse(readJson(f))
  if (r.success) return [r.data]
  fail(f, r.error.message)
  return []
})

const allowed = readJson(join(root, 'vocab/palavras-2ano.json')) as {
  palavras: string[]
  personagens: string[]
}
const forbidden = readJson(join(root, 'vocab/palavras-proibidas.json')) as { palavras: string[] }
const ctx: ValidationContext = {
  worlds,
  allowedWords: new Set([...allowed.palavras, ...allowed.personagens]),
  forbiddenWords: forbidden.palavras,
}

const seenIds = new Map<string, string>()
let problemCount = 0
for (const file of jsonFiles('stories')) {
  const parsed = storyBatchSchema.safeParse(readJson(file))
  if (!parsed.success) {
    fail(file, parsed.error.message)
    continue
  }
  const { batch, problems } = parsed.data
  problemCount += problems.length
  for (const p of problems) {
    const other = seenIds.get(p.id)
    if (other) fail(file, `id ${p.id} já existe em ${other}`)
    seenIds.set(p.id, file)
  }
  const issues: Issue[] = validateBatch(problems, ctx)
  for (const i of issues) {
    if (i.severity === 'error') fail(`${batch.id}/${i.problemId}`, `[${i.rule}] ${i.message}`)
    else {
      warnings++
      console.warn(`! ${batch.id}/${i.problemId}: [${i.rule}] ${i.message}`)
    }
  }
}

// Lições (Sprint 3c): vocabulário próprio = vocabulário das histórias + palavras de ensino aprovadas.
const lessonVocab = readJson(join(root, 'vocab/palavras-licoes.json')) as { palavras: string[] }
const lessonCtx = {
  worlds,
  allowedWords: new Set([...ctx.allowedWords, ...lessonVocab.palavras]),
  forbiddenWords: forbidden.palavras,
}
const lessons: Lesson[] = []
for (const file of jsonFiles('lessons')) {
  const parsed = lessonBatchSchema.safeParse(readJson(file))
  if (!parsed.success) {
    fail(file, parsed.error.message)
    continue
  }
  lessons.push(...parsed.data.lessons)
  for (const l of parsed.data.lessons)
    for (const i of validateLesson(l, lessonCtx))
      fail(`${parsed.data.batch.id}/${i.problemId}`, `[${i.rule}] ${i.message}`)
}
for (const i of validateLessonCoverage(lessons, worlds))
  fail(`lições/${i.problemId}`, `[${i.rule}] ${i.message}`)

const phaseCount = worlds.reduce((n, w) => n + w.phases.length, 0)
console.log(
  `validate:content — ${problemCount} histórias, ${lessons.length} lições, ${phaseCount} fases catalogadas, ${errors} erros, ${warnings} avisos`,
)
process.exit(errors > 0 ? 1 : 0)
