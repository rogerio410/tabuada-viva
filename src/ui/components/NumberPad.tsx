interface NumberPadProps {
  canConfirm: boolean
  disabled?: boolean
  onDigit: (digit: string) => void
  onBackspace: () => void
  onConfirm: () => void
}

const KEY =
  'min-h-[56px] min-w-[56px] rounded-2xl bg-white text-[28px] font-extrabold text-ink shadow-[0_2px_0_rgba(43,33,24,0.25)] border-2 border-ink/60 active:translate-y-px select-none touch-manipulation disabled:opacity-40'

/** Teclado próprio 3×4 (1–9, apagar, 0, confirmar). Sem tecla de limpar tudo e sem repetir ao segurar. */
export function NumberPad({
  canConfirm,
  disabled,
  onDigit,
  onBackspace,
  onConfirm,
}: NumberPadProps) {
  return (
    <div className="grid grid-cols-3 gap-3" role="group" aria-label="Teclado de números">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button
          key={d}
          type="button"
          className={KEY}
          disabled={disabled}
          onClick={() => onDigit(d)}
        >
          {d}
        </button>
      ))}
      <button
        type="button"
        className={KEY}
        disabled={disabled}
        aria-label="Apagar"
        onClick={onBackspace}
      >
        ⌫
      </button>
      <button type="button" className={KEY} disabled={disabled} onClick={() => onDigit('0')}>
        0
      </button>
      <button
        type="button"
        className={`${KEY} !border-green-deep !bg-green-deep !text-white`}
        disabled={disabled || !canConfirm}
        aria-label="Confirmar"
        onClick={onConfirm}
      >
        ✓
      </button>
    </div>
  )
}
