import { useState } from 'react'
import { isSoundOn, setSoundOn } from './audio'
import { Calu } from './components/Calu'
import { SessionScreen } from './SessionScreen'

export function App() {
  const [playing, setPlaying] = useState(false)
  const [sound, setSound] = useState(isSoundOn)
  if (playing) return <SessionScreen onExit={() => setPlaying(false)} />
  return (
    <main className="mx-auto flex h-full max-w-[480px] flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="m-0 text-3xl font-extrabold">Tabuada Viva</h1>
      <Calu size={140} />
      <p className="m-0">Oi! Eu sou o Calú. Bora ajudar o bairro hoje?</p>
      <button
        type="button"
        className="btn-primary w-full select-none touch-manipulation"
        onClick={() => setPlaying(true)}
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
