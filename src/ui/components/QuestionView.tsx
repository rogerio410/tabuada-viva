import { useRef, useState } from 'react'
import type { SupportKind } from '@domain/ports/types'
import { useServices } from '../services'
import type { Question } from '../session/session-controller'
import { NumberPad } from './NumberPad'
import { Fingers } from '../tools/Fingers'
import { NumberLine } from '../tools/NumberLine'
import { TenFrame } from '../tools/TenFrame'

type Tool = Extract<SupportKind, 'dedos' | 'quadro-de-dez' | 'reta'>
const TABS: { tool: Tool; label: string }[] = [
  { tool: 'dedos', label: 'Dedos' },
  { tool: 'quadro-de-dez', label: 'Quadro' },
  { tool: 'reta', label: 'Reta' },
]
const MAX_DIGITS = 2

interface Props {
  question: Question
  onAnswer: (given: number, firstTouchAt: Date, supportsUsed: SupportKind[]) => void
}

/**
 * Uma pergunta: conta e resposta no topo, ferramentas no meio, teclado embaixo. O primeiro toque de resposta
 * fixa o instante usado para `timeMs` (D2); nada de tempo aparece na tela.
 */
export function QuestionView({ question, onAnswer }: Props) {
  const { clock } = useServices()
  const [digits, setDigits] = useState('')
  const firstTouch = useRef<Date | null>(null)
  const [used, setUsed] = useState<ReadonlySet<Tool>>(new Set())
  const auto = question.autoSupports.find((s): s is Tool => s === 'dedos' || s === 'quadro-de-dez')
  const [panelOpen, setPanelOpen] = useState(auto !== undefined)
  const [tool, setTool] = useState<Tool>(auto ?? 'dedos')
  const [sent, setSent] = useState(false)

  const markUsed = (t: Tool) => setUsed((u) => (u.has(t) ? u : new Set(u).add(t)))
  const touch = () => (firstTouch.current ??= clock.now())

  const toggleHelp = () => {
    if (!panelOpen) markUsed(tool) // abrir pelo botão conta; fechar não
    setPanelOpen((o) => !o)
  }
  const pickTool = (t: Tool) => {
    setTool(t)
    markUsed(t)
  }

  const confirm = () => {
    if (digits === '' || sent) return
    setSent(true)
    onAnswer(Number(digits), firstTouch.current ?? clock.now(), [...used])
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-center gap-3 text-[56px] font-extrabold leading-none">
        <span data-testid="equation">
          {question.a} + {question.b} =
        </span>
        <span
          data-testid="answer"
          role="status"
          aria-label="Sua resposta"
          className="flex h-16 min-w-[84px] items-center justify-center rounded-2xl border-4 border-poti-deep bg-white px-3"
        >
          {digits === '' ? <span className="text-ink/30">?</span> : digits}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <button
          type="button"
          className="min-h-[56px] self-center rounded-2xl border-2 border-poti-deep bg-white px-6 text-xl font-extrabold text-poti-deep select-none touch-manipulation"
          aria-expanded={panelOpen}
          onClick={toggleHelp}
        >
          {panelOpen ? 'Fechar ajuda' : 'Ajuda'}
        </button>
        {panelOpen && (
          <div className="flex flex-col gap-3" data-testid="tools">
            <div
              className="grid grid-cols-3 gap-3"
              role="tablist"
              aria-label="Ferramentas de ajuda"
            >
              {TABS.map((t) => (
                <button
                  key={t.tool}
                  type="button"
                  role="tab"
                  aria-selected={tool === t.tool}
                  className={`min-h-[56px] rounded-2xl border-2 text-lg font-extrabold select-none touch-manipulation ${tool === t.tool ? 'border-poti-deep bg-poti-deep text-white' : 'border-ink/30 bg-white text-ink'}`}
                  onClick={() => pickTool(t.tool)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tool === 'dedos' && <Fingers onUse={() => markUsed('dedos')} />}
            {tool === 'quadro-de-dez' && <TenFrame onUse={() => markUsed('quadro-de-dez')} />}
            {tool === 'reta' && (
              <NumberLine start={Math.max(question.a, question.b)} onUse={() => markUsed('reta')} />
            )}
          </div>
        )}
      </div>

      <NumberPad
        canConfirm={digits !== ''}
        disabled={sent}
        onDigit={(d) => {
          touch()
          setDigits((v) => (v.length >= MAX_DIGITS ? v : v === '0' ? d : v + d))
        }}
        onBackspace={() => setDigits((v) => v.slice(0, -1))}
        onConfirm={confirm}
      />
    </div>
  )
}
