import { z } from 'zod'
import { phaseIdSchema } from './common.ts'
import { batchMetaSchema } from './problem.ts'

/** Objetos do universo da criança que as lições desenham (arte provisória, IDs `OBJ-*`). */
export const LESSON_OBJECTS = [
  'carrinho',
  'bolinha',
  'ovo',
  'banana',
  'laranja',
  'chinelo',
  'ficha',
  'copo',
  'balao',
  'passageiro',
  'moeda',
  'carta',
  'pao',
  'figurinha',
] as const
export const lessonObjectSchema = z.enum(LESSON_OBJECTS)

const text = z.string().min(1)
const count = z.number().int().min(0).max(20)

/** Um grupo de objetos na tela (ex.: 3 carrinhos). */
const groupSchema = z.object({ n: count, object: lessonObjectSchema })

/**
 * Passos de uma lição (docs/pedagogia/ensino-por-fase.md). Reutilizáveis nos Mundos 3 a 9.
 * `ask` e `choose` NÃO geram Attempt; a criança tenta de novo sem punição.
 */
export const lessonStepSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('say'), text }),
  z.object({ type: z.literal('show'), groups: z.array(groupSchema).min(1).max(2) }),
  z.object({ type: z.literal('domino'), left: count.max(6), right: count.max(6) }),
  z.object({ type: z.literal('join') }),
  z.object({ type: z.literal('remove'), from: count, take: count, object: lessonObjectSchema }),
  z.object({ type: z.literal('tenframe'), fill: count.max(10) }),
  z.object({
    type: z.literal('numline'),
    start: count,
    hops: z.number().int().min(1).max(10),
    back: z.boolean().optional(),
  }),
  z.object({ type: z.literal('swap'), a: count, b: count }),
  z.object({ type: z.literal('family'), a: count, b: count }),
  z.object({
    type: z.literal('ask'),
    /** `3 + 2`, `5 − 2` ou `3 + ? = 10`. */
    expr: text,
    answer: z.number().int().min(0).max(20),
    prompt: text.optional(),
  }),
  z.object({
    type: z.literal('choose'),
    prompt: text,
    /** Tira de contas ou números mostrada acima dos cartões (a conta que falta vem como `?`). */
    strip: z.array(text).optional(),
    options: z.array(text).length(3),
    correct: z.number().int().min(0).max(2),
  }),
  z.object({ type: z.literal('name'), text }),
])
export type LessonStep = z.infer<typeof lessonStepSchema>

export const lessonSchema = z.object({
  phase: phaseIdSchema,
  /** Nome curto do truque (aparece em "Ver o truque"). */
  strategy: text,
  steps: z.array(lessonStepSchema).min(2),
})
export type Lesson = z.infer<typeof lessonSchema>

/** Lote de lições: mesmas regras de revisão humana das histórias (batchMetaSchema). */
export const lessonBatchSchema = z.object({
  batch: batchMetaSchema,
  lessons: z.array(lessonSchema).min(1),
})
export type LessonBatch = z.infer<typeof lessonBatchSchema>
