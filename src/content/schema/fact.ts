import { z } from 'zod'
import { factIdSchema } from './common.ts'

/** Lista de fatos que uma fase apresenta (ids canônicos; ver src/domain/facts). */
export const newFactsSchema = z.array(factIdSchema)
export { factIdSchema }
