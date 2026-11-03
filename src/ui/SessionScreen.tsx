import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { SupportKind } from '@domain/ports/types'
import { playCorrect, playPhaseEnd } from './audio'
import { Calu } from './components/Calu'
import { HintCard } from './components/HintCard'
import { Stars } from './components/Stars'
import { QuestionView } from './components/QuestionView'
import { LessonScreen } from './lesson/LessonScreen'
import { useServices } from './services'
import { PHASE_ORDER } from './session/phases'
import {
  SessionController,
  type Feedback,
  type PhaseResult,
  type Progress,
  type View,
} from './session/session-controller'

const CORRECT_LINES = ['Mandou bem!', 'Boa!', 'Isso mesmo!']
const AUTO_ADVANCE_MS = 900
const SYMBOL = { add: '+', sub: '−' } as const

/** Fala do Calú no fim da fase (voz-do-calu.md): nunca "não passou", sem nota nem tempo. */
function resultLine(r: PhaseResult): string {
  if (r.passed) {
    const isLast = PHASE_ORDER.indexOf(r.phaseId) === PHASE_ORDER.length - 1
    return isLast ? 'Muito bem! Mais mundos em breve.' : 'Muito bem! A próxima fase abriu.'
  }
  if (r.stars >= 2) return 'Muito bem! Bora jogar mais uma?'
  return 'Boa! Vamos treinar mais um pouquinho com o Calú?'
}

const BTN = 'min-h-[56px] rounded-2xl px-6 text-xl font-extrabold select-none touch-manipulation'

function correctLine(fb: Feedback, n: number): string {
  if (fb.supportsUsed.includes('dedos')) return 'Boa! Contar nos dedos ajuda mesmo.'
  if (fb.supportsUsed.includes('quadro-de-dez')) return 'Você usou o quadro de dez. Muito bem!'
  return CORRECT_LINES[n % CORRECT_LINES.length]!
}

function ProgressBar({ progress }: { progress: Progress }) {
  const pct = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100)
  return (
    <div
      role="progressbar"
      aria-label="Itens da sessão"
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-valuenow={progress.done}
      className="h-3 w-full overflow-hidden rounded-full bg-ink/15"
    >
      <div
        className="h-full rounded-full bg-green-deep transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/** Cada troca de tela leva o foco ao contêiner (teclado e leitor de tela não ficam perdidos no <body>). */
function Screen({
  focusKey,
  className,
  inert,
  children,
}: {
  focusKey: string
  className: string
  /** Escondida para o teclado e o leitor de tela (outra tela está por cima). */
  inert?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => ref.current?.focus(), [focusKey])
  return (
    <main ref={ref} tabIndex={-1} className={inert ? 'hidden' : `${className} outline-none`}>
      {children}
    </main>
  )
}

export function SessionScreen({ phaseId, onExit }: { phaseId: string; onExit: () => void }) {
  const svc = useServices()
  const ctl = useRef<SessionController | null>(null)
  const started = useRef(false)
  const [view, setView] = useState<View | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [progress, setProgress] = useState<Progress>({ done: 0, total: 0 })
  const [truque, setTruque] = useState(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    void SessionController.open(svc, phaseId).then(async (c) => {
      ctl.current = c
      show(await c.next())
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no início
  }, [])

  const show = (v: View) => {
    setFeedback(null)
    setView(v)
    if (v.type === 'question' || v.type === 'rest-offer') setProgress(v.progress)
    else if (v.type === 'done' && v.result.stars > 0) playPhaseEnd()
  }
  const advance = async (to?: Promise<View>) => show(await (to ?? ctl.current!.next()))

  const onAnswer = async (given: number, at: Date, supports: SupportKind[]) => {
    const fb = await ctl.current!.answer(given, at, supports)
    setProgress(ctl.current!.progress)
    if (fb.correct) playCorrect()
    setFeedback(fb)
  }

  // Acerto passa sozinho em < 1 s; a dica depois de um erro espera o toque da criança.
  const autoAdvance = feedback?.correct === true
  useEffect(() => {
    if (!autoAdvance) return
    const id = setTimeout(() => void advance(), AUTO_ADVANCE_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `advance` só lê refs
  }, [autoAdvance, feedback])

  if (!view) {
    return (
      <Screen
        focusKey="loading"
        className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center"
      >
        <Calu />
      </Screen>
    )
  }

  if (view.type === 'lesson') {
    return (
      <LessonScreen lesson={view.lesson} onDone={() => void advance(ctl.current!.lessonDone())} />
    )
  }

  if (view.type === 'rest-offer') {
    return (
      <Screen
        focusKey="rest"
        className="mx-auto flex h-full max-w-[480px] flex-col items-center justify-center gap-6 p-4 text-center"
      >
        <Calu size={120} />
        <p className="m-0 text-2xl font-extrabold">Bora descansar? Amanhã tem mais!</p>
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            className={`${BTN} bg-green-deep text-white`}
            onClick={() => void advance(ctl.current!.rest())}
          >
            Descansar
          </button>
          <button
            type="button"
            className={`${BTN} border-2 border-ink/70 bg-white text-ink`}
            onClick={() => void advance(ctl.current!.keepGoing())}
          >
            Continuar
          </button>
        </div>
      </Screen>
    )
  }

  if (view.type === 'done') {
    return (
      <Screen
        focusKey="done"
        className="mx-auto flex h-full max-w-[480px] flex-col items-center justify-center gap-6 p-4 text-center"
      >
        <Calu size={120} />
        <Stars count={view.result.stars} size={44} />
        <p className="m-0 text-2xl font-extrabold">{resultLine(view.result)}</p>
        <button type="button" className={`${BTN} w-full bg-green-deep text-white`} onClick={onExit}>
          Voltar ao mapa
        </button>
      </Screen>
    )
  }

  const q = view.question
  const lesson = ctl.current?.phaseLesson ?? null
  return (
    <>
      <Screen
        focusKey={`${q.itemId}-${feedback ? 'fb' : 'q'}`}
        className="mx-auto flex h-full max-w-[480px] flex-col gap-3 p-4"
        inert={truque}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar progress={progress} />
          </div>
          <button
            type="button"
            className="min-h-[56px] min-w-[56px] rounded-2xl border-2 border-ink/70 bg-white px-4 text-lg font-extrabold text-ink select-none touch-manipulation"
            onClick={onExit}
          >
            Sair
          </button>
        </div>
        {feedback ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-6 text-center"
            data-testid="feedback"
          >
            <Calu size={96} />
            {feedback.correct ? (
              <p className="m-0 text-3xl font-extrabold" role="status">
                {correctLine(feedback, progress.done)}
                <span className="mt-2 block text-[40px]">
                  {q.a} {SYMBOL[q.op]} {q.b} = {q.answer}
                </span>
              </p>
            ) : (
              <>
                <p className="m-0 text-2xl font-extrabold" role="status">
                  Vamos ver juntos?
                </p>
                <HintCard op={q.op} a={q.a} b={q.b} />
                <button
                  type="button"
                  className={`${BTN} w-full bg-green-deep text-white`}
                  onClick={() => void advance()}
                >
                  Bora!
                </button>
              </>
            )}
          </div>
        ) : (
          <QuestionView
            key={q.itemId}
            question={q}
            onAnswer={(g, at, s) => void onAnswer(g, at, s)}
            onTruque={lesson ? () => setTruque(true) : undefined}
          />
        )}
      </Screen>
      {truque && lesson && (
        <div className="fixed inset-0 z-50 bg-cream">
          <LessonScreen lesson={lesson} replay onDone={() => setTruque(false)} />
        </div>
      )}
    </>
  )
}
