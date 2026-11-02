import { z } from 'zod'
import { contextSchema, factIdSchema, phaseIdSchema, problemTypeSchema } from './common.ts'

export const problemSchema = z.object({
  /** `<fase>-H<nn>`, único e estável. */
  id: z.string().regex(/^W[1-9]-P\d{2}-H\d{2,3}$/, 'esperado W<n>-P<nn>-H<nn>'),
  phase: phaseIdSchema,
  /** 2 a 4 frases; a última é a pergunta (L30). */
  text: z.string().min(1),
  context: contextSchema,
  type: problemTypeSchema,
  /** Fato que resolve a história. */
  fact: factIdSchema,
  /** Do fato até a soma (D11); vazio quando o fato já é uma adição. */
  rootChain: z.array(factIdSchema),
  /** Números do enunciado, na ordem em que aparecem no texto. */
  numbers: z.array(z.number().int().nonnegative()).min(1),
  answer: z.number().int().nonnegative(),
  /** Alternativas erradas plausíveis (nunca iguais à resposta). */
  distractors: z.array(z.number().int().nonnegative()).min(2),
  /** Soma repetida que origina o produto, ex.: [4, 4, 4]; obrigatória em ×. */
  repeatedSum: z.array(z.number().int().nonnegative()).optional(),
  /** Só em W8-P07 em diante. */
  remainder: z.number().int().positive().optional(),
})

export const batchMetaSchema = z.object({
  id: z.string().min(1),
  origin: z.enum(['ia', 'humano']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewer: z.string().nullable(),
  /** Amostragem humana de ~10% do lote (CLAUDE.md). */
  humanSample: z.enum(['pendente', 'aprovado', 'aprovado com ajustes', 'reprovado']),
})

export const storyBatchSchema = z.object({
  batch: batchMetaSchema,
  problems: z.array(problemSchema).min(1),
})

export type Problem = z.infer<typeof problemSchema>
export type StoryBatch = z.infer<typeof storyBatchSchema>
