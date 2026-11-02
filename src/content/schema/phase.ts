import { z } from 'zod'
import { newFactsSchema } from './fact.ts'
import { phaseIdSchema } from './common.ts'

export const phaseSchema = z.object({
  id: phaseIdSchema,
  name: z.string().min(1),
  /** Fatos que a fase apresenta (vazio em Grande Desafio). */
  newFacts: newFactsSchema,
  /** Grande Desafio do mundo: história sem fato novo. */
  grandChallenge: z.boolean().default(false),
})

export type Phase = z.infer<typeof phaseSchema>
