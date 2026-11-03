import type { LessonObject } from '@content/schema/lesson'

/** Nome falado de cada objeto (singular, plural), para o texto alternativo. */
export const OBJECT_NAMES: Record<LessonObject, [string, string]> = {
  carrinho: ['carrinho', 'carrinhos'],
  bolinha: ['bolinha', 'bolinhas'],
  ovo: ['ovo', 'ovos'],
  banana: ['banana', 'bananas'],
  laranja: ['laranja', 'laranjas'],
  chinelo: ['chinelo', 'chinelos'],
  ficha: ['ficha', 'fichas'],
  copo: ['copo', 'copos'],
  balao: ['balão', 'balões'],
  passageiro: ['passageiro', 'passageiros'],
  moeda: ['moeda', 'moedas'],
  carta: ['carta', 'cartas'],
  pao: ['pão', 'pães'],
  figurinha: ['figurinha', 'figurinhas'],
}

const INK = '#2b2118'
const STROKE = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const }

function Shape({ kind }: { kind: LessonObject }) {
  switch (kind) {
    case 'carrinho':
      return (
        <>
          <rect x="3" y="12" width="26" height="10" rx="3" fill="#1f6496" {...STROKE} />
          <rect x="9" y="6" width="13" height="8" rx="2" fill="#7fb5de" {...STROKE} />
          <circle cx="10" cy="24" r="3.5" fill="#fff" {...STROKE} />
          <circle cx="23" cy="24" r="3.5" fill="#fff" {...STROKE} />
        </>
      )
    case 'bolinha':
      return <circle cx="16" cy="16" r="11" fill="#e8731a" {...STROKE} />
    case 'ovo':
      return <ellipse cx="16" cy="17" rx="9" ry="12" fill="#fff7e6" {...STROKE} />
    case 'banana':
      return <path d="M5 9c4 14 14 18 23 14-6 1-14-3-16-14z" fill="#f2c230" {...STROKE} />
    case 'laranja':
      return (
        <>
          <circle cx="16" cy="18" r="11" fill="#f08a24" {...STROKE} />
          <path d="M16 7c1-3 4-4 6-3-1 3-3 4-6 3z" fill="#2e9e5b" {...STROKE} />
        </>
      )
    case 'chinelo':
      return (
        <>
          <ellipse cx="16" cy="17" rx="8" ry="13" fill="#2e9e5b" {...STROKE} />
          <path d="M10 14c3-4 9-4 12 0" fill="none" {...STROKE} />
        </>
      )
    case 'ficha':
      return (
        <>
          <circle cx="16" cy="16" r="12" fill="#1f7a44" {...STROKE} />
          <circle cx="16" cy="16" r="6" fill="none" stroke="#fff" strokeWidth="2" />
        </>
      )
    case 'copo':
      return <path d="M7 5h18l-3 22H10z" fill="#bfe3f7" {...STROKE} />
    case 'balao':
      return (
        <>
          <ellipse cx="16" cy="13" rx="9" ry="11" fill="#d94f6b" {...STROKE} />
          <path d="M16 24c-2 3 2 4 0 7" fill="none" {...STROKE} />
        </>
      )
    case 'passageiro':
      return (
        <>
          <circle cx="16" cy="9" r="5" fill="#f0c9a0" {...STROKE} />
          <path d="M6 28c0-9 4-12 10-12s10 3 10 12z" fill="#1f6496" {...STROKE} />
        </>
      )
    case 'moeda':
      return (
        <>
          <circle cx="16" cy="16" r="12" fill="#f2c230" {...STROKE} />
          <circle cx="16" cy="16" r="7" fill="none" stroke={INK} strokeWidth="1.5" />
        </>
      )
    case 'carta':
      return (
        <>
          <rect x="6" y="3" width="20" height="26" rx="3" fill="#fff" {...STROKE} />
          <circle cx="16" cy="16" r="5" fill="#d94f6b" />
        </>
      )
    case 'pao':
      return (
        <path
          d="M4 20c0-9 6-13 12-13s12 4 12 13c0 3-3 4-12 4S4 23 4 20z"
          fill="#d9a05b"
          {...STROKE}
        />
      )
    case 'figurinha':
      return (
        <>
          <rect x="5" y="4" width="22" height="24" rx="3" fill="#fff" {...STROKE} />
          <path
            d="M16 9l2 4 4.5.6-3.3 3 .9 4.4L16 18.8 11.9 21l.9-4.4-3.3-3L14 13z"
            fill="#e8731a"
          />
        </>
      )
  }
}

/** Objeto do universo da criança (arte provisória em SVG, IDs OBJ-*). Decorativo: o texto alternativo fica no grupo. */
export function ObjectIcon({ kind, size = 40 }: { kind: LessonObject; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <Shape kind={kind} />
    </svg>
  )
}

/** Um grupo de objetos com texto alternativo ("3 carrinhos"). */
export function ObjectGroup({
  n,
  kind,
  size = 40,
}: {
  n: number
  kind: LessonObject
  size?: number
}) {
  const [one, many] = OBJECT_NAMES[kind]
  return (
    <div
      role="img"
      aria-label={`${n} ${n === 1 ? one : many}`}
      className="flex max-w-[150px] flex-wrap justify-center gap-1"
      data-testid="object-group"
      data-n={n}
    >
      {n === 0 ? (
        <span className="rounded-xl border-2 border-dashed border-ink/50 px-4 py-2 text-lg font-bold text-ink/70">
          vazio
        </span>
      ) : (
        Array.from({ length: n }, (_, i) => <ObjectIcon key={i} kind={kind} size={size} />)
      )}
    </div>
  )
}
