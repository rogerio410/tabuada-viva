/**
 * Parâmetros de segurança (não pedagógicos). Valores PROVISÓRIOS da D22 (`docs/gdd/decisoes-abertas.md`):
 * só valem como definitivos depois da aprovação do responsável. O servidor (supabase/migrations/0003_pin.sql)
 * usa os mesmos números; mudar aqui exige mudar lá.
 */
export const SECURITY = {
  pin: {
    /** Falhas seguidas que disparam um bloqueio. */
    maxFailures: 5,
    /** Primeiro bloqueio: 15 min. Cada novo ciclo de falhas dobra, até o teto. */
    baseLockMs: 15 * 60 * 1000,
    /** Teto do bloqueio: 24 h. */
    maxLockMs: 24 * 60 * 60 * 1000,
  },
} as const
