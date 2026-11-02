/** Tipos de domínio persistidos pelos repositórios (fonte: "Modelo de dados", L343–357). */

export type ChildId = string
/** Fato: `add:3+4` (a ≤ b), `sub:13-8`, `mul:3x4` (a ≤ b), `div:12/3`. Catálogo no Sprint 1. */
export type FactId = string
export type ItemId = string
export type SessionId = string

export type FactStatus = 'novo' | 'aprendendo' | 'praticando' | 'fluente' | 'dominado'

export interface FactState {
  childId: ChildId
  factId: FactId
  status: FactStatus
  /** Próxima revisão; null enquanto Novo. */
  nextReview: Date | null
  /** Acertos seguidos sem apoio (zera por erro; ver mecanica-aprendizagem.md). */
  streak: number
  /** Dias de calendário (YYYY-MM-DD) com acerto rápido sem apoio, para Fluente (D1). */
  fastDays: string[]
  correct: number
  wrong: number
  medianMs: number | null
}

/** Enum de tipos de erro (docs/gdd/tipos-de-erro-e-dicas.md). `slow_counting` não é erro. */
export type ErrorType =
  | 'added_instead_of_multiplied'
  | 'off_by_one_group'
  | 'swapped_subtraction'
  | 'wrong_operation'
  | 'multiplied_instead_of_divided'
  | 'used_wrong_divisor'
  | 'money_change_error'
  | 'other'

export type SupportKind = 'dedos' | 'quadro-de-dez' | 'reta' | 'contas' | 'grupos' | 'tabela'

/** Tipo do item: fato avulso, família de fatos, história ou prova do Portão (critérios G3 a G6). */
export type AttemptKind = 'fact' | 'family' | 'story' | 'proof'

export interface Attempt {
  childId: ChildId
  sessionId: SessionId
  itemId: ItemId
  /** Fato avaliado; null em itens de história sem fato único. */
  factId: FactId | null
  answer: number
  correct: boolean
  /** Do aparecimento da conta ao primeiro toque (D2). Nunca mostrado à criança. */
  timeMs: number
  /** Apoios abertos; vazio = sem apoio. Apoio nunca promove a Fluente. */
  supportsUsed: SupportKind[]
  errorType: ErrorType | null
  /** Fase em que a resposta foi dada (`W<n>-P<nn>`); null fora das fases (ex.: Prova do Portão). */
  phaseId: string | null
  kind: AttemptKind
  createdAt: Date
}

export interface Session {
  id: SessionId
  childId: ChildId
  startedAt: Date
  endedAt: Date | null
  itemCount: number
  /** Acertos sem apoio ÷ respostas (D4); null até haver respostas. */
  accuracy: number | null
}

export interface Wallet {
  childId: ChildId
  cajus: number
  /** Cajus guardados no cofrinho. */
  piggyBank: number
  /** Melhor número de estrelas (0–3) por fase (`W<n>-P<nn>`). */
  stars: Record<string, 0 | 1 | 2 | 3>
  /** IDs de figurinhas do álbum. */
  stickers: string[]
}
