import world1 from '@content/lessons/world-1.json'
import world2 from '@content/lessons/world-2.json'
import type { Lesson } from '@content/schema/lesson'

/** Lições dos Mundos 1 e 2. O JSON é validado no build por `npm run validate:content` (schema Zod + regras de voz). */
const LESSONS: readonly Lesson[] = [...world1.lessons, ...world2.lessons] as Lesson[]

export const lessonFor = (phaseId: string): Lesson | undefined =>
  LESSONS.find((l) => l.phase === phaseId)
