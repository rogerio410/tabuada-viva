/**
 * Dica visual depois de um erro, sem frase nova. Adição: os dois grupos e o total. Subtração: a adição inversa
 * (b + r = a), porque tirar é a soma ao contrário. `compact` (telas apertadas, como a pergunta da lição) usa
 * bolinhas e número menores. O texto da dica de subtração é de revisão 100% humana.
 */
export function HintCard({
  op,
  a,
  b,
  compact = false,
}: {
  op: 'add' | 'sub'
  a: number
  b: number
  compact?: boolean
}) {
  const dots = (n: number, color: string) =>
    Array.from({ length: n }, (_, i) => (
      <span
        key={i}
        className={`inline-block rounded-full ${compact ? 'h-4 w-4' : 'h-5 w-5'} ${color}`}
        aria-hidden="true"
      />
    ))
  // adição a + b = total; subtração a − b = r  →  b + r = a
  const [x, y, total] = op === 'add' ? [a, b, a + b] : [b, a - b, a]
  return (
    <div
      className={`flex flex-col items-center rounded-2xl bg-white ${compact ? 'gap-1 p-2' : 'gap-3 p-4'}`}
      data-testid="hint"
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {dots(x, 'bg-caju')}
        <span className="mx-1 text-2xl font-extrabold" aria-hidden="true">
          +
        </span>
        {dots(y, 'bg-poti-deep')}
      </div>
      <p className={`m-0 font-extrabold leading-none ${compact ? 'text-[32px]' : 'text-[40px]'}`}>
        {x} + {y} = {total}
      </p>
    </div>
  )
}
