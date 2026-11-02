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

  /** Fatos já dominados no aquecimento da sessão (L195). */
  warmupFacts: 3,
  /** Itens da prática guiada na 1ª sessão de uma fase (L168). */
  guidedPracticeItems: { min: 6, max: 8 },
  /** Proporção-alvo de itens conhecidos x novos/frágeis na sessão (L201). */
  knownToNewRatio: { known: 0.7, new: 0.3 },
  /** Dias de calendário diferentes com acerto rápido para chegar a Fluente (D1). */
  fluentDistinctDays: 2,
  /** Acréscimo ao limiar rápido por dígito extra na resposta (D2). */
  fastAnswerExtraMsPerDigit: 1000,
  /** Acréscimo ao limiar rápido em fatos de divisão (D2). */
  fastAnswerDivisionExtraMs: 1000,
  /** Acerto mínimo da fase para 1, 2 e 3 estrelas; 2 estrelas liberam a próxima fase (D5). */
  starThresholds: { one: 0.6, two: 0.8, three: 0.95 },
  /** Tamanho do PIN do adulto (L275). */
  pinLength: 4,

  /** Critérios do Portão da Multiplicação (docs/gdd/portao.md, G1–G6). */
  gate: {
    /** G1: fração dos fatos de adição em Dominado (todos em Fluente ou acima). */
    additionMasteredRatio: 0.9,
    /** G2: o mesmo para os fatos de subtração até 20. */
    subtractionMasteredRatio: 0.9,
    /** G3: acerto mínimo nos triângulos completados. */
    familyAccuracy: 0.9,
    /** G4: acerto mínimo na escolha da operação e no cálculo dos problemas aditivos. */
    additiveProblemAccuracy: 0.85,
    /** G5: taxa de apoio estritamente abaixo disto, na janela. */
    supportRateBelow: 0.1,
    /** G5: janela em semanas. */
    supportWindowWeeks: 2,
    /** G6: itens da Prova do Portão. */
    proofItems: 40,
    /** G6: acerto mínimo na prova. */
    proofAccuracy: 0.95,
    /** G6: provas válidas exigidas. */
    proofsRequired: 2,
    /** G6: dias mínimos entre a 1ª prova aprovada e a 2ª. */
    proofMinDaysApart: 7,
  },
} as const
