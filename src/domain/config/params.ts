/**
 * Parâmetros pedagógicos centralizados (fonte: docs/00-fonte/tabuada-viva.md, "Mecânica de aprendizagem").
 * Mudar qualquer valor exige aprovação humana. Ver docs/gdd/mecanica-aprendizagem.md.
 */
export const PARAMS = {
  /** Intervalos de revisão em dias, por estado. */
  reviewIntervalDays: { aprendendo: 0, praticando: 2, fluente: 5, dominado: 14 },
  /** Tempo máximo (ms) para uma resposta contar como rápida. */
  fastAnswerMs: 4000,
  /** Acertos seguidos sem apoio para Aprendendo → Praticando. */
  streakToPracticing: 3,
  /** Máximo de fatos novos por sessão. */
  maxNewFactsPerSession: 2,
  /** Meta de acerto por sessão. */
  targetAccuracy: { min: 0.8, max: 0.85 },
  /** Abaixo disto o motor reduz itens novos e devolve o apoio visual. */
  easeBelowAccuracy: 0.7,
  /** Acima disto por N sessões o motor acelera. */
  accelerateAboveAccuracy: 0.9,
  accelerateAfterSessions: 3,
  /** Duração-alvo da sessão (minutos). */
  sessionMinutes: { min: 10, max: 12 },
  /** Itens entre um erro e o retorno do fato na mesma sessão. */
  errorReturnAfterItems: { min: 2, max: 3 },
} as const
