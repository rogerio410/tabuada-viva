import { useState } from 'react'

/** Quadro de dez (2 × 5): tocar põe ou tira uma ficha. A linha de cima enche primeiro (5-e-mais fica visível). */
export function TenFrame({ onUse }: { onUse: () => void }) {
  const [filled, setFilled] = useState<boolean[]>(() => Array<boolean>(10).fill(false))
  const count = filled.filter(Boolean).length
  const toggle = (i: number) => {
    onUse()
    setFilled((f) => f.map((v, j) => (j === i ? !v : v)))
  }
  return (
    <div className="flex flex-col gap-3" data-testid="tool-quadro-de-dez">
      <div className="grid grid-cols-5 gap-3">
        {filled.map((on, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            aria-label={`Casa ${i + 1}`}
            className={`h-14 w-14 rounded-2xl border-2 select-none touch-manipulation ${on ? 'border-poti-deep bg-poti-deep' : 'border-ink/70 bg-white'}`}
            onClick={() => toggle(i)}
          >
            {on && (
              <span className="text-2xl text-white" aria-hidden="true">
                ●
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="m-0 text-center text-xl font-bold" aria-live="polite">
        {count} {count === 1 ? 'ficha' : 'fichas'}
      </p>
    </div>
  )
}
