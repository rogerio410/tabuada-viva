import { useEffect, useRef, useState } from 'react'
import { phaseStatuses, type PhaseStatus } from '@domain/progress/phase-progress'
import { Stars } from './components/Stars'
import { useServices } from './services'
import { lessonFor } from './session/lessons'
import { GAME_PHASES, PHASE_ORDER } from './session/phases'
import { loadProgress } from './session/progress'

const WORLD_NAMES: Record<number, string> = { 1: 'Casa do Calú', 2: 'Praça do Bairro' }

function Lock() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="#5e5247" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#5e5247" strokeWidth="2.5" />
    </svg>
  )
}

/**
 * Mapa dos Mundos 1 e 2: fases em ordem fixa; as bloqueadas não respondem ao toque. Mundos 3 e 4 e o Portão
 * aparecem só como "em breve", sem critérios nem contagem do que falta.
 */
export function MapScreen({
  onPlay,
  onLesson,
  onBack,
}: {
  onPlay: (phaseId: string) => void
  onLesson: (phaseId: string) => void
  onBack: () => void
}) {
  const svc = useServices()
  const ref = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<PhaseStatus[] | null>(null)

  useEffect(() => {
    // sem progresso legível (ex.: erro no banco), cai no começo: só a primeira fase liberada
    void loadProgress(svc)
      .catch(() => phaseStatuses(PHASE_ORDER, [], {}))
      .then(setStatus)
  }, [svc])
  useEffect(() => {
    // volta do jogo: leva a fase atual para o meio da tela
    if (status)
      ref.current?.querySelector('[data-state="current"]')?.scrollIntoView({ block: 'center' })
  }, [status])
  useEffect(() => ref.current?.focus(), [])

  const byId = new Map(status?.map((s) => [s.id, s]))
  return (
    <main
      ref={ref}
      tabIndex={-1}
      className="mx-auto flex h-full max-w-[480px] flex-col gap-3 overflow-y-auto p-4 outline-none"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 text-3xl font-extrabold">Mapa</h1>
        <button
          type="button"
          className="min-h-[56px] min-w-[56px] rounded-2xl border-2 border-ink/70 bg-white px-4 text-lg font-extrabold text-ink select-none touch-manipulation"
          onClick={onBack}
        >
          Início
        </button>
      </div>
      {!status && <p className="m-0 text-center">Carregando…</p>}
      {status &&
        [1, 2].map((world) => (
          <section key={world} className="flex flex-col gap-3" aria-labelledby={`mundo-${world}`}>
            <h2 id={`mundo-${world}`} className="m-0 text-2xl font-extrabold">
              {WORLD_NAMES[world]}
            </h2>
            {GAME_PHASES.filter((p) => p.world === world).map((phase) => {
              const s = byId.get(phase.id) ?? {
                id: phase.id,
                state: 'locked' as const,
                stars: 0 as const,
              }
              const locked = s.state === 'locked'
              return (
                <div key={phase.id} className="flex gap-3">
                  <button
                    type="button"
                    data-testid={`phase-${phase.id}`}
                    data-state={s.state}
                    disabled={locked}
                    className={`flex min-h-[64px] flex-1 items-center justify-between gap-3 rounded-2xl border-2 px-4 text-left text-xl font-extrabold select-none touch-manipulation ${
                      s.state === 'current'
                        ? 'border-green-deep bg-green-deep text-white'
                        : locked
                          ? 'border-ink/40 bg-ink/10 text-ink/70'
                          : 'border-ink/70 bg-white text-ink'
                    }`}
                    onClick={() => onPlay(phase.id)}
                  >
                    <span>
                      {phase.name.replace(/^GD:\s*/, 'Grande Desafio: ')}
                      {s.state === 'current' && <span className="sr-only"> (fase atual)</span>}
                    </span>
                    {locked ? (
                      <>
                        <Lock />
                        <span className="sr-only">Bloqueada</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
                        {s.state === 'current' && (
                          <span
                            aria-hidden="true"
                            className="text-lg font-extrabold text-green-deep"
                          >
                            ▶
                          </span>
                        )}
                        <Stars count={s.stars} size={24} />
                      </span>
                    )}
                  </button>
                  {!locked && lessonFor(phase.id) && (
                    <button
                      type="button"
                      data-testid={`lesson-${phase.id}`}
                      aria-label={`Ver a lição: ${phase.name.replace(/^GD:\s*/, 'Grande Desafio: ')}`}
                      className="min-h-[64px] min-w-[72px] rounded-2xl border-2 border-poti-deep bg-white px-3 text-lg font-extrabold text-poti-deep select-none touch-manipulation"
                      onClick={() => onLesson(phase.id)}
                    >
                      Lição
                    </button>
                  )}
                </div>
              )
            })}
          </section>
        ))}
      <section className="flex flex-col gap-3" aria-label="Em breve">
        <p className="m-0 rounded-2xl bg-ink/10 p-4 text-xl font-bold text-ink/80">
          Mundos 3 e 4: em breve
        </p>
        <p className="m-0 rounded-2xl bg-ink/10 p-4 text-xl font-bold text-ink/80">
          Portão: em breve
        </p>
      </section>
    </main>
  )
}
