import { useEffect, useMemo, useRef, useState } from 'react'
import type { Lesson, LessonStep } from '@content/schema/lesson'
import { Calu } from '../components/Calu'
import {
  AskStep,
  ChooseStep,
  DominoStep,
  FamilyStep,
  JoinStep,
  MoveStep,
  NumlineStep,
  RemoveStep,
  ShowStep,
  SwapStep,
  TenFrameStep,
} from './steps'

/** Passos em que a criança precisa fazer algo antes de "Continuar". */
const NEEDS_ACTION: ReadonlySet<LessonStep['type']> = new Set([
  'join',
  'remove',
  'move',
  'tenframe',
  'numline',
  'swap',
  'family',
  'ask',
  'choose',
])

/** Fala do Calú para o balão: o texto do passo, ou a última fala/pergunta anterior. */
function bubbleFor(steps: readonly LessonStep[], index: number): string {
  for (let i = index; i >= 0; i--) {
    const s = steps[i]!
    if (s.type === 'say' || s.type === 'name') return s.text
    if ((s.type === 'ask' && s.prompt) || s.type === 'choose')
      return s.type === 'ask' ? s.prompt! : s.prompt
  }
  return ''
}

interface Props {
  lesson: Lesson
  /** "Ver de novo" (mapa ou ajuda): o botão final volta em vez de seguir para a prática. */
  replay?: boolean
  onDone: () => void
  /** Sair a qualquer momento, sem gravar nada (pausa sempre possível). */
  onExit: () => void
}

/**
 * Lição de uma fase (D27): o Calú ensina a estratégia com objetos do mundo da criança, que ela toca. Sem tempo e
 * sem nota. Nada aqui é gravado como resposta nem conta como apoio.
 */
export function LessonScreen({ lesson, replay = false, onDone, onExit }: Props) {
  const ref = useRef<HTMLElement>(null)
  const contRef = useRef<HTMLButtonElement>(null)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState<ReadonlySet<number>>(new Set())
  const [override, setOverride] = useState<string | null>(null)
  const step = lesson.steps[index]!
  const last = index === lesson.steps.length - 1
  const ready = !NEEDS_ACTION.has(step.type) || done.has(index)

  useEffect(() => ref.current?.focus(), [index])
  // passo concluído: o foco vai para "Continuar" (teclado e leitor de tela não ficam perdidos)
  useEffect(() => {
    if (ready && NEEDS_ACTION.has(step.type)) contRef.current?.focus()
  }, [ready, step.type])

  const groups = useMemo(() => {
    for (let i = index - 1; i >= 0; i--) {
      const s = lesson.steps[i]!
      if (s.type === 'show') return s.groups
    }
    return []
  }, [lesson, index])

  const finish = () => setDone((d) => new Set(d).add(index))
  const common = { onDone: finish, say: setOverride }
  const text = override ?? bubbleFor(lesson.steps, index)

  const next = () => {
    if (last) return onDone()
    setIndex(index + 1)
    setOverride(null)
  }

  return (
    <main
      ref={ref}
      tabIndex={-1}
      className="mx-auto flex h-full max-w-[480px] flex-col gap-3 p-4 outline-none"
      data-testid="lesson"
      aria-label={`Lição: ${lesson.strategy}`}
    >
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Passos da lição"
          aria-valuemin={0}
          aria-valuemax={lesson.steps.length}
          aria-valuenow={index + 1}
          aria-valuetext={`Passo ${index + 1} de ${lesson.steps.length}`}
          className="h-3 flex-1 overflow-hidden rounded-full bg-ink/20"
        >
          <div
            className="h-full rounded-full bg-poti-deep transition-[width]"
            style={{ width: `${((index + 1) / lesson.steps.length) * 100}%` }}
          />
        </div>
        <button
          type="button"
          data-testid="lesson-exit"
          className="min-h-[56px] min-w-[56px] rounded-2xl border-2 border-ink/70 bg-white px-4 text-lg font-extrabold text-ink select-none touch-manipulation"
          onClick={onExit}
        >
          Sair
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Calu size={64} />
        <p
          className="m-0 flex-1 rounded-2xl bg-white p-3 text-xl font-bold leading-snug"
          role="status"
          data-testid="bubble"
        >
          {text}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" key={index}>
        {step.type === 'show' && <ShowStep step={step} />}
        {step.type === 'domino' && <DominoStep step={step} />}
        {step.type === 'join' && <JoinStep step={step} groups={groups} {...common} />}
        {step.type === 'remove' && <RemoveStep step={step} {...common} />}
        {step.type === 'move' && <MoveStep step={step} {...common} />}
        {step.type === 'tenframe' && <TenFrameStep step={step} {...common} />}
        {step.type === 'numline' && <NumlineStep step={step} {...common} />}
        {step.type === 'swap' && <SwapStep step={step} {...common} />}
        {step.type === 'family' && <FamilyStep step={step} {...common} />}
        {step.type === 'ask' && <AskStep step={step} {...common} />}
        {step.type === 'choose' && <ChooseStep step={step} {...common} />}
      </div>

      <button
        type="button"
        ref={contRef}
        data-testid="continue"
        disabled={!ready}
        className="min-h-[56px] rounded-2xl bg-green-deep px-6 text-xl font-extrabold text-white select-none touch-manipulation disabled:bg-ink/15 disabled:text-[#5e5247]"
        onClick={next}
      >
        {last ? (replay ? 'Voltar' : 'Bora jogar!') : 'Continuar'}
      </button>
    </main>
  )
}
