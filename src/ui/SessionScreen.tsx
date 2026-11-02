import { useEffect, useRef, useState } from 'react'
import type { SupportKind } from '@domain/ports/types'
import { playCorrect } from './audio'
import { Calu } from './components/Calu'
import { HintCard } from './components/HintCard'
import { QuestionView } from './components/QuestionView'
import { useServices } from './services'
import {
  SessionController,
  type Feedback,
  type Progress,
  type View,
} from './session/session-controller'

const CORRECT_LINES = ['Mandou bem!', 'Boa!', 'Isso mesmo!']
const AUTO_ADVANCE_MS = 900

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

export function SessionScreen({ onExit }: { onExit: () => void }) {
  const svc = useServices()
  const ctl = useRef<SessionController | null>(null)
  const started = useRef(false)
  const [view, setView] = useState<View | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [progress, setProgress] = useState<Progress>({ done: 0, total: 0 })

  useEffect(() => {
    if (started.current) return
    started.current = true
    void SessionController.open(svc).then(async (c) => {
      ctl.current = c
      show(await c.next())
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no início
  }, [])

  const show = (v: View) => {
    setFeedback(null)
    setView(v)
    if (v.type !== 'done') setProgress(v.progress)
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
      <main className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
        <Calu />
      </main>
    )
  }

  if (view.type === 'rest-offer') {
    return (
      <main className="mx-auto flex h-full max-w-[480px] flex-col items-center justify-center gap-6 p-4 text-center">
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
      </main>
    )
  }

  if (view.type === 'done') {
    return (
      <main className="mx-auto flex h-full max-w-[480px] flex-col items-center justify-center gap-6 p-4 text-center">
        <Calu size={120} />
        <p className="m-0 text-2xl font-extrabold">Você conseguiu. Amanhã tem mais!</p>
        <button type="button" className={`${BTN} w-full bg-green-deep text-white`} onClick={onExit}>
          Voltar ao início
        </button>
      </main>
    )
  }

  const q = view.question
  return (
    <main className="mx-auto flex h-full max-w-[480px] flex-col gap-3 p-4">
      <ProgressBar progress={progress} />
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
                {q.a} + {q.b} = {q.answer}
              </span>
            </p>
          ) : (
            <>
              <p className="m-0 text-2xl font-extrabold" role="status">
                Vamos ver juntos?
              </p>
              <HintCard a={q.a} b={q.b} />
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
        />
      )}
    </main>
  )
}
