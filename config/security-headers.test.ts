import { describe, expect, it } from 'vitest'
import { CSP, CSP_META, SECURITY_HEADERS, vercelConfig } from './security-headers.mjs'

describe('security-headers', () => {
  it('CSP fecha tudo para o próprio domínio e nunca libera eval, http ou curinga', () => {
    expect(CSP).toContain("default-src 'self'")
    expect(CSP).toContain("script-src 'self';")
    expect(CSP).toContain("object-src 'none'")
    expect(CSP).toContain("frame-ancestors 'none'")
    for (const bad of ['unsafe-eval', 'http:', 'https:', '*']) expect(CSP, bad).not.toContain(bad)
    expect(CSP.match(/script-src[^;]*/)![0]).not.toContain('unsafe-inline')
  })

  it('a <meta> não tem frame-ancestors (o navegador ignora) e o resto é igual', () => {
    expect(CSP_META).not.toContain('frame-ancestors')
    expect(CSP_META).toContain("default-src 'self'")
  })

  it('desliga câmera, microfone e localização', () => {
    const p = SECURITY_HEADERS.find(([k]) => k === 'Permissions-Policy')![1]
    for (const f of ['camera=()', 'microphone=()', 'geolocation=()']) expect(p).toContain(f)
  })

  it('vercel.json cobre todas as rotas e o service worker', () => {
    const v = vercelConfig()
    expect(v.headers.map((h) => h.source)).toEqual(['/(.*)', '/sw.js'])
    expect(v.headers[0]!.headers.map((h) => h.key)).toContain('Content-Security-Policy')
  })
})
