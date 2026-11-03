import { useState, type ReactNode } from 'react'
import type { LessonStep } from '@content/schema/lesson'
import { HintCard } from '../components/HintCard'
import { NumberPad } from '../components/NumberPad'
import { ObjectGroup, ObjectIcon, OBJECT_NAMES } from '../scenes/objects'
import { NumberLine } from '../tools/NumberLine'

type Of<T extends LessonStep['type']> = Extract<LessonStep, { type: T }>

/** Cada passo avisa `onDone()` quando a criança fez o que ele pede; o botão "Continuar" depende disso. */
export interface StepProps<T extends LessonStep['type']> {
  step: Of<T>
  onDone: () => void
  /** Mensagem do Calú que o passo quer mostrar no balão (ex.: depois de uma resposta). */
  say: (text: string | null) => void
}

const ACTION =
  'min-h-[56px] min-w-[56px] rounded-2xl border-2 border-ink/70 bg-white px-5 text-xl font-extrabold text-ink select-none touch-manipulation disabled:bg-ink/15 disabled:text-[#5e5247]'
const PRIMARY = `${ACTION} !border-green-deep !bg-green-deep !text-white`

const Stage = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4">{children}</div>
)

/** `show`: grupos de objetos lado a lado; só olhar. */
export function ShowStep({ step }: Pick<StepProps<'show'>, 'step'>) {
  return (
    <Stage>
      <div className="flex items-center justify-center gap-4">
        {step.groups.map((g, i) => (
          <div key={i} className="flex items-center gap-4">
            {i > 0 && (
              <span className="text-4xl font-extrabold" aria-hidden="true">
                +
              </span>
            )}
            <ObjectGroup n={g.n} kind={g.object} />
          </div>
        ))}
      </div>
    </Stage>
  )
}

/** `join`: toca em "Juntar" e os grupos viram um só, com o total. */
export function JoinStep({
  step: _step,
  groups,
  onDone,
}: StepProps<'join'> & {
  groups: Array<{ n: number; object: Of<'show'>['groups'][number]['object'] }>
}) {
  const [joined, setJoined] = useState(false)
  const total = groups.reduce((n, g) => n + g.n, 0)
  return (
    <Stage>
      {joined ? (
        <>
          <ObjectGroup n={total} kind={groups[0]!.object} size={34} />
          <p className="m-0 text-5xl font-extrabold" data-testid="total">
            {total}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            {groups.map((g, i) => (
              <ObjectGroup key={i} n={g.n} kind={g.object} />
            ))}
          </div>
          <button
            type="button"
            className={PRIMARY}
            data-testid="step-action"
            onClick={() => {
              setJoined(true)
              onDone()
            }}
          >
            Juntar
          </button>
        </>
      )}
    </Stage>
  )
}

/** `domino`: as duas metades com pintinhas. */
export function DominoStep({ step }: Pick<StepProps<'domino'>, 'step'>) {
  const half = (n: number) => (
    <div className="grid h-24 w-24 grid-cols-3 content-center gap-1 p-2" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="h-5 w-5 rounded-full bg-ink" />
      ))}
    </div>
  )
  return (
    <Stage>
      <div
        role="img"
        aria-label={`Dominó com ${step.left} de um lado e ${step.right} do outro`}
        className="flex items-center rounded-2xl border-4 border-ink bg-white"
      >
        {half(step.left)}
        <span className="h-20 w-1 bg-ink" aria-hidden="true" />
        {half(step.right)}
      </div>
    </Stage>
  )
}

/** `remove`: toca nos objetos que saem; o que sobra aparece. */
export function RemoveStep({ step, onDone }: StepProps<'remove'>) {
  const [gone, setGone] = useState<Set<number>>(new Set())
  const done = gone.size >= step.take
  const [, many] = OBJECT_NAMES[step.object]
  return (
    <Stage>
      <div
        className="grid grid-cols-5 gap-3"
        role="group"
        aria-label={`Toque em ${step.take} ${many} para tirar`}
      >
        {Array.from({ length: step.from }, (_, i) => (
          <button
            key={i}
            type="button"
            data-testid="step-action"
            aria-label={`Tirar ${OBJECT_NAMES[step.object][0]} ${i + 1}`}
            disabled={gone.has(i) || done}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink/70 bg-white touch-manipulation disabled:border-dashed disabled:bg-transparent"
            onClick={() => {
              const next = new Set(gone).add(i)
              setGone(next)
              if (next.size >= step.take) onDone()
            }}
          >
            {!gone.has(i) && <ObjectIcon kind={step.object} size={36} />}
          </button>
        ))}
      </div>
      {done && (
        <p className="m-0 text-2xl font-extrabold" role="status" data-testid="left">
          Sobraram {step.from - step.take}
        </p>
      )}
    </Stage>
  )
}

/** `move`: passa 1 objeto do grupo da direita para o da esquerda (4|6 vira 5|5). */
export function MoveStep({ step, onDone }: StepProps<'move'>) {
  const [moved, setMoved] = useState(false)
  const [one] = OBJECT_NAMES[step.object]
  return (
    <Stage>
      <div className="flex items-center justify-center gap-4">
        <ObjectGroup n={step.to + (moved ? 1 : 0)} kind={step.object} />
        <span className="text-4xl font-extrabold" aria-hidden="true">
          +
        </span>
        <ObjectGroup n={step.from - (moved ? 1 : 0)} kind={step.object} />
      </div>
      <button
        type="button"
        className={PRIMARY}
        data-testid="step-action"
        disabled={moved}
        aria-label={`Passar 1 ${one} para o outro grupo`}
        onClick={() => {
          setMoved(true)
          onDone()
        }}
      >
        Passar 1
      </button>
    </Stage>
  )
}

/** `tenframe`: enche o quadro de dez até o alvo. */
export function TenFrameStep({ step, onDone }: StepProps<'tenframe'>) {
  const [on, setOn] = useState<Set<number>>(new Set())
  const done = on.size >= step.fill
  return (
    <Stage>
      <div
        className="grid grid-cols-5 gap-3"
        role="group"
        aria-label={`Quadro de 10: encha ${step.fill}`}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            type="button"
            data-testid="step-action"
            aria-pressed={on.has(i)}
            aria-label={`Casa ${i + 1}`}
            disabled={done && !on.has(i)}
            className={`h-14 w-14 rounded-2xl border-2 touch-manipulation ${on.has(i) ? 'border-poti-deep bg-poti-deep' : 'border-ink/70 bg-white'}`}
            onClick={() => {
              const next = new Set(on)
              if (next.has(i)) next.delete(i)
              else next.add(i)
              setOn(next)
              if (next.size >= step.fill) onDone()
            }}
          >
            {on.has(i) && (
              <span className="text-2xl text-white" aria-hidden="true">
                ●
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="m-0 text-2xl font-extrabold" aria-live="polite">
        {on.size} de {step.fill}
      </p>
    </Stage>
  )
}

/** `numline`: pulos na reta (para frente ou para trás) até o total do passo. */
export function NumlineStep({ step, onDone }: StepProps<'numline'>) {
  return (
    <Stage>
      <NumberLine
        start={step.start}
        back={step.back}
        onUse={() => undefined}
        onHop={(h) => h >= step.hops && onDone()}
      />
    </Stage>
  )
}

/** `swap`: as duas parcelas trocam de lugar e o total fica à vista. */
export function SwapStep({ step, onDone }: StepProps<'swap'>) {
  const [swapped, setSwapped] = useState(false)
  const [x, y] = swapped ? [step.b, step.a] : [step.a, step.b]
  return (
    <Stage>
      <p className="m-0 text-5xl font-extrabold" data-testid="swap-expr">
        {x} + {y} = {step.a + step.b}
      </p>
      <button
        type="button"
        className={PRIMARY}
        data-testid="step-action"
        disabled={swapped}
        onClick={() => {
          setSwapped(true)
          onDone()
        }}
      >
        Trocar de lugar
      </button>
    </Stage>
  )
}

/** `family`: o triângulo de 3 números e as 4 contas, uma por vez. */
export function FamilyStep({ step, onDone }: StepProps<'family'>) {
  const sum = step.a + step.b
  const cards = [
    { id: 'p', text: `${step.a} + ${step.b} = ${sum}` },
    ...(step.a !== step.b ? [{ id: 'q', text: `${step.b} + ${step.a} = ${sum}` }] : []),
    { id: 'r', text: `${sum} − ${step.a} = ${step.b}` },
    ...(step.a !== step.b ? [{ id: 's', text: `${sum} − ${step.b} = ${step.a}` }] : []),
  ]
  const [seen, setSeen] = useState<Set<string>>(new Set())
  return (
    <Stage>
      <svg
        width="150"
        height="120"
        viewBox="0 0 150 120"
        role="img"
        aria-label={`Triângulo da família: total ${sum} em cima; ${step.a} e ${step.b} embaixo`}
      >
        <path
          d="M75 8 L142 112 L8 112 Z"
          fill="#fff"
          stroke="#2b2118"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <text x="75" y="58" textAnchor="middle" fontSize="30" fontWeight="800" fill="#2b2118">
          {sum}
        </text>
        <text x="40" y="100" textAnchor="middle" fontSize="28" fontWeight="800" fill="#b04a00">
          {step.a}
        </text>
        <text x="110" y="100" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1f6496">
          {step.b}
        </text>
      </svg>
      <div className="grid w-full grid-cols-2 gap-3">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            data-testid="step-action"
            aria-pressed={seen.has(c.id)}
            className={`${ACTION} text-lg ${seen.has(c.id) ? '!bg-poti-deep !text-white !border-poti-deep' : ''}`}
            onClick={() => {
              const next = new Set(seen).add(c.id)
              setSeen(next)
              if (next.size >= cards.length) onDone()
            }}
          >
            {seen.has(c.id) ? c.text : c.text.replace(/= \d+$/, '= ?')}
          </button>
        ))}
      </div>
    </Stage>
  )
}

/** `ask`: pergunta guiada. Errar mostra a dica visual e deixa tentar de novo; nada é gravado. */
export function AskStep({ step, onDone, say }: StepProps<'ask'>) {
  const [digits, setDigits] = useState('')
  const [wrong, setWrong] = useState(false)
  const [right, setRight] = useState(false)
  const m = /^(\d+) ([+−-]) (\d+)$/.exec(step.expr)
  const missing = /^(\d+) \+ \? = (\d+)$/.exec(step.expr)
  const shown = step.expr.replace(' -', ' −')
  const label = missing ? `${shown.replace('?', '')}` : `${shown} =`

  const confirm = () => {
    if (digits === '' || right) return
    if (Number(digits) === step.answer) {
      setRight(true)
      setWrong(false)
      say('Mandou bem!')
      onDone()
    } else {
      setWrong(true)
      say('Quase! Olha comigo.')
      setDigits('')
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[44px] font-extrabold leading-none">
        <span data-testid="lesson-expr">
          {missing ? `${missing[1]} + ? = ${missing[2]}` : label}
        </span>
        <span
          data-testid="lesson-answer"
          role="status"
          aria-label={digits === '' ? 'Sua resposta: vazia' : `Sua resposta: ${digits}`}
          className="flex h-14 min-w-[72px] items-center justify-center rounded-2xl border-4 border-poti-deep bg-white px-3"
        >
          {right ? step.answer : digits === '' ? <span className="text-ink/30">?</span> : digits}
        </span>
      </div>
      {wrong && m && (
        <HintCard op={m[2] === '+' ? 'add' : 'sub'} a={Number(m[1])} b={Number(m[3])} />
      )}
      {wrong && missing && (
        <HintCard op="add" a={Number(missing[1])} b={Number(missing[2]) - Number(missing[1])} />
      )}
      <div className="mt-auto">
        <NumberPad
          canConfirm={digits !== ''}
          disabled={right}
          onDigit={(d) => setDigits((v) => (v.length >= 2 ? v : v === '0' ? d : v + d))}
          onBackspace={() => setDigits((v) => v.slice(0, -1))}
          onConfirm={confirm}
        />
      </div>
    </div>
  )
}

/** `choose`: tira de contas e 3 cartões. Errar deixa tentar de novo, sem punição. */
export function ChooseStep({ step, onDone, say }: StepProps<'choose'>) {
  const [picked, setPicked] = useState<number | null>(null)
  const [tried, setTried] = useState<Set<number>>(new Set())
  const right = picked === step.correct
  const wordy = step.options.some((o) => /\p{L}/u.test(o))
  const answer = step.options[step.correct]!
  return (
    <Stage>
      {step.strip && (
        <ol
          className="m-0 flex list-none flex-wrap justify-center gap-2 p-0 text-xl font-extrabold"
          aria-label="Tira de contas"
          data-testid="strip"
        >
          {step.strip.map((item, i) => {
            const open = /\?/.test(item)
            return (
              <li
                key={i}
                className={`rounded-xl border-2 px-3 py-1 ${open ? 'border-poti-deep bg-white' : 'border-ink/40 bg-white/60'}`}
              >
                {open && right ? item.replace('?', answer) : item}
              </li>
            )
          })}
        </ol>
      )}
      <div
        className={wordy ? 'flex w-full flex-col gap-3' : 'grid w-full grid-cols-3 gap-3'}
        role="group"
        aria-label="Cartões"
      >
        {step.options.map((o, i) => (
          <button
            key={i}
            type="button"
            data-testid="choice"
            aria-pressed={picked === i}
            disabled={right || tried.has(i)}
            className={`${ACTION} text-2xl ${right && i === step.correct ? '!border-green-deep !bg-green-deep !text-white' : ''}`}
            onClick={() => {
              setPicked(i)
              if (i === step.correct) {
                say('Isso mesmo!')
                onDone()
              } else {
                setTried(new Set(tried).add(i))
                say('Quase! Olha comigo.')
              }
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </Stage>
  )
}
