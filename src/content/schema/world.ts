import { z } from 'zod'
import { phaseSchema } from './phase.ts'

export const worldSchema = z
  .object({
    id: z.number().int().min(1).max(9),
    name: z.string().min(1),
    phases: z.array(phaseSchema).min(1),
  })
  .superRefine((w, ctx) => {
    w.phases.forEach((p, i) => {
      if (!p.id.startsWith(`W${w.id}-`))
        ctx.addIssue({
          code: 'custom',
          path: ['phases', i, 'id'],
          message: `fase ${p.id} fora do mundo ${w.id}`,
        })
    })
  })

export type World = z.infer<typeof worldSchema>

/**
 * Faixa numérica por mundo (checklist B). `maxOperand`: maior número no enunciado;
 * `maxResult`: maior resposta. Em × e ÷ os fatores ficam em 0–10 (W5–W9).
 */
export const WORLD_RANGES: Record<number, { maxOperand: number; maxResult: number }> = {
  1: { maxOperand: 10, maxResult: 10 },
  2: { maxOperand: 10, maxResult: 10 },
  3: { maxOperand: 20, maxResult: 20 },
  4: { maxOperand: 20, maxResult: 20 },
  5: { maxOperand: 100, maxResult: 100 },
  6: { maxOperand: 100, maxResult: 100 },
  7: { maxOperand: 100, maxResult: 100 },
  8: { maxOperand: 100, maxResult: 100 },
  9: { maxOperand: 100, maxResult: 100 },
}
