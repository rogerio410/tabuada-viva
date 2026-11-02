import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@ui/App'
import { ServicesProvider } from '@ui/services'
import type { Services } from '@ui/session/session-controller'
import { TabuadaDb } from '@data/local/db'
import { DexieAttemptRepo, DexieFactStateRepo, DexieSessionRepo } from '@data/local/repos'

// Raiz de composição: único lugar que liga a UI aos repositórios concretos (Dexie, no aparelho).
// Sprint 2: um perfil local fixo, sem apelido nem tela de criação (nenhum dado pessoal novo).
const db = new TabuadaDb()
const services: Services = {
  childId: 'perfil-local',
  facts: new DexieFactStateRepo(db),
  attempts: new DexieAttemptRepo(db),
  sessions: new DexieSessionRepo(db),
  clock: { now: () => new Date() },
  rng: { next: () => Math.random() },
  newId: () => crypto.randomUUID(),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider value={services}>
      <App />
    </ServicesProvider>
  </StrictMode>,
)
