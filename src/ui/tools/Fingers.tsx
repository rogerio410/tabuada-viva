import { useState } from 'react'

const FINGER =
  'h-14 w-14 rounded-2xl border-2 text-2xl font-extrabold select-none touch-manipulation transition-colors'

/** Mãozinhas: duas mãos, cada dedo abre e fecha com um toque. Mostra o total de dedos abertos. */
export function Fingers({ onUse }: { onUse: () => void }) {
  const [open, setOpen] = useState<boolean[]>(() => Array<boolean>(10).fill(false))
  const total = open.filter(Boolean).length
  const toggle = (i: number) => {
    onUse()
    setOpen((o) => o.map((v, j) => (j === i ? !v : v)))
  }
  return (
    <div className="flex flex-col gap-3" data-testid="tool-dedos">
      {[0, 1].map((hand) => (
        <div key={hand} className="flex justify-between">
          {[0, 1, 2, 3, 4].map((f) => {
            const i = hand * 5 + f
            return (
              <button
                key={i}
                type="button"
                aria-pressed={open[i]}
                aria-label={`Dedo ${i + 1}`}
                className={`${FINGER} ${open[i] ? 'border-caju bg-caju text-ink' : 'border-ink/70 bg-white text-ink/70'}`}
                onClick={() => toggle(i)}
              >
                {open[i] ? '●' : '○'}
              </button>
            )
          })}
        </div>
      ))}
      <p className="m-0 text-center text-xl font-bold" aria-live="polite">
        {total} {total === 1 ? 'dedo aberto' : 'dedos abertos'}
      </p>
    </div>
  )
}
