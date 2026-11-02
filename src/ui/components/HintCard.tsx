/** Dica visual depois de um erro: a soma com bolinhas (cada grupo, depois o total). Sem frase nova. */
export function HintCard({ a, b }: { a: number; b: number }) {
  const dots = (n: number, color: string) =>
    Array.from({ length: n }, (_, i) => (
      <span key={i} className={`inline-block h-5 w-5 rounded-full ${color}`} aria-hidden="true" />
    ))
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4" data-testid="hint">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {dots(a, 'bg-caju')}
        <span className="mx-1 text-2xl font-extrabold" aria-hidden="true">
          +
        </span>
        {dots(b, 'bg-poti-deep')}
      </div>
      <p className="m-0 text-[40px] font-extrabold leading-none">
        {a} + {b} = {a + b}
      </p>
    </div>
  )
}
