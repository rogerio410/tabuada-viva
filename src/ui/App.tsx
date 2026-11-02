import { useState } from 'react'
import { isSoundOn, setSoundOn } from './audio'
import { Calu } from './components/Calu'
import { MapScreen } from './MapScreen'
import { SessionScreen } from './SessionScreen'

type Screen = { name: 'home' } | { name: 'map' } | { name: 'play'; phaseId: string }

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [sound, setSound] = useState(isSoundOn)

  if (screen.name === 'play')
    return (
      <SessionScreen
        key={screen.phaseId}
        phaseId={screen.phaseId}
        onExit={() => setScreen({ name: 'map' })}
      />
    )
  if (screen.name === 'map')
    return (
      <MapScreen
        onPlay={(phaseId) => setScreen({ name: 'play', phaseId })}
        onBack={() => setScreen({ name: 'home' })}
      />
    )
  return (
    <main className="mx-auto flex h-full max-w-[480px] flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="m-0 text-3xl font-extrabold">Tabuada Viva</h1>
      <Calu size={140} />
      <p className="m-0">Oi! Eu sou o Calú. Bora ajudar o bairro hoje?</p>
      <button
        type="button"
        className="btn-primary w-full select-none touch-manipulation"
        onClick={() => setScreen({ name: 'map' })}
      >
        Jogar
      </button>
      <button
        type="button"
        className="min-h-[56px] w-full rounded-2xl border-2 border-ink/70 bg-white px-6 text-xl font-extrabold text-ink select-none touch-manipulation"
        aria-pressed={sound}
        onClick={() => {
          setSoundOn(!sound)
          setSound(!sound)
        }}
      >
        {sound ? 'Som ligado' : 'Som desligado'}
      </button>
    </main>
  )
}
