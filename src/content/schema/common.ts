import { z } from 'zod'
import { parseFactId } from '../../domain/facts/fact-id.ts'

export const CONTEXTS = ['casa', 'rua', 'escola', 'compras', 'festa'] as const
export const PROBLEM_TYPES = [
  'juntar',
  'acrescentar',
  'retirar',
  'comparar',
  'completar',
  'grupos iguais',
  'a cada',
  'retangular',
  'repartir',
  'medir',
] as const

export const contextSchema = z.enum(CONTEXTS)
export const problemTypeSchema = z.enum(PROBLEM_TYPES)

/** `W<mundo>-P<fase>`, mundos 1 a 9. */
export const phaseIdSchema = z.string().regex(/^W[1-9]-P\d{2}$/, 'esperado W<n>-P<nn>')

export const factIdSchema = z
  .string()
  .refine(
    (id) => parseFactId(id) !== null,
    'id de fato inválido (ex.: add:3+4, sub:13-8, mul:3x4, div:12/3)',
  )

export type Context = z.infer<typeof contextSchema>
export type ProblemType = z.infer<typeof problemTypeSchema>

/** Ordem total das fases: mundo, depois fase. */
export function phaseOrder(id: string): number {
  const m = /^W(\d)-P(\d{2})$/.exec(id)
  return m ? Number(m[1]) * 100 + Number(m[2]) : -1
}
