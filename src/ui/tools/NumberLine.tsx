import { useState } from 'react'

const MAX = 20
const STEP = 15

/**
 * Reta numérica 0–20. O ponto de partida é o primeiro número da conta; o botão dá um pulo por toque
 * (alternativa por toque a qualquer arrastar) e "Recomeçar" volta ao início.
 */
export function NumberLine({
  start,
  back = false,
  onUse,
  onHop,
}: {
  start: number
  /** Subtração: os pulos vão para trás a partir do primeiro número. */
  back?: boolean
  onUse: () => void
  /** Chamado com o total de pulos depois de cada pulo (lições). */
  onHop?: (hops: number) => void
}) {
  const [hops, setHops] = useState(0)
  const at = back ? Math.max(0, start - hops) : Math.min(MAX, start + hops)
  const width = MAX * STEP + 20
  return (
    <div className="flex flex-col gap-3" data-testid="tool-reta">
      <svg
        viewBox={`0 0 ${width} 56`}
        className="w-full"
        role="img"
        aria-label={`Reta numérica: parado no ${at}`}
      >
        <line x1="10" y1="34" x2={width - 10} y2="34" stroke="#2b2118" strokeWidth="2" />
        {Array.from({ length: MAX + 1 }, (_, n) => (
          <g key={n}>
            <line
              x1={10 + n * STEP}
              y1="30"
              x2={10 + n * STEP}
              y2="38"
              stroke="#2b2118"
              strokeWidth="1.5"
            />
            {n % 5 === 0 && (
              <text x={10 + n * STEP} y="52" textAnchor="middle" fontSize="11" fill="#2b2118">
                {n}
              </text>
            )}
          </g>
        ))}
        <circle cx={10 + start * STEP} cy="34" r="4" fill="#1f6496" />
        <circle cx={10 + at * STEP} cy="34" r="6" fill="#e8731a" />
      </svg>
      <div className="flex gap-3">
        <button
          type="button"
          data-testid="step-action"
          className="min-h-[56px] flex-1 rounded-2xl bg-poti-deep px-4 text-xl font-extrabold text-white select-none touch-manipulation disabled:bg-ink/15 disabled:text-[#5e5247]"
          disabled={back ? at <= 0 : at >= MAX}
          onClick={() => {
            onUse()
            setHops((h) => h + 1)
            onHop?.(hops + 1)
          }}
        >
          {back ? 'Pular −1' : 'Pular +1'}
        </button>
        <button
          type="button"
          className="min-h-[56px] flex-1 rounded-2xl border-2 border-ink/70 bg-white px-4 text-xl font-extrabold text-ink select-none touch-manipulation"
          onClick={() => setHops(0)}
        >
          Recomeçar
        </button>
      </div>
      <p className="m-0 text-center text-xl font-bold" aria-live="polite">
        {hops} {hops === 1 ? 'pulo' : 'pulos'}, parou no {at}
      </p>
    </div>
  )
}
