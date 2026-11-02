import { createContext, useContext, type ReactNode } from 'react'
import type { Services } from './session/session-controller'

const ServicesContext = createContext<Services | null>(null)

/** Os repositórios concretos (Dexie) entram pelo `main.tsx`; a UI só conhece as interfaces do domínio. */
export function ServicesProvider({ value, children }: { value: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
}

export function useServices(): Services {
  const svc = useContext(ServicesContext)
  if (!svc) throw new Error('ServicesProvider ausente')
  return svc
}
