// Fonte única dos cabeçalhos de segurança (D23). Consumida por vite.config.ts (preview e <meta> do build)
// e por scripts/gen-vercel-headers.mjs (vercel.json). O jogo não fala com nenhum domínio externo:
// a URL do Supabase entra em `connect-src` no Sprint 4.

/**
 * Diretivas da CSP (D23). `style-src 'self'`, sem 'unsafe-inline': o React e o Framer Motion aplicam estilos
 * pelo CSSOM (`element.style`), que a CSP não bloqueia. Se algum componente precisar de <style> ou do atributo
 * style="" em HTML, prefira `style-src-attr 'unsafe-inline'` a reabrir `style-src`.
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'"],
  'frame-src': ["'none'"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
}

const serialize = (directives) =>
  Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ')

export const CSP = serialize(CSP_DIRECTIVES)

/** <meta http-equiv> não aceita `frame-ancestors`; o cabeçalho cobre. */
export const CSP_META = serialize(
  Object.fromEntries(Object.entries(CSP_DIRECTIVES).filter(([k]) => k !== 'frame-ancestors')),
)

const PERMISSIONS = [
  'camera',
  'microphone',
  'geolocation',
  'payment',
  'usb',
  'serial',
  'bluetooth',
  'browsing-topics',
  'display-capture',
  'accelerometer',
  'gyroscope',
  'magnetometer',
]
  .map((f) => `${f}=()`)
  .join(', ')

/** Cabeçalhos aplicados a todas as respostas. */
export const SECURITY_HEADERS = [
  ['Content-Security-Policy', CSP],
  ['Referrer-Policy', 'no-referrer'],
  ['Permissions-Policy', PERMISSIONS],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
]

/** O service worker nunca fica preso em cache: atualização do PWA depende disso. */
export const SW_HEADERS = [['Cache-Control', 'public, max-age=0, must-revalidate']]

/** Estrutura do vercel.json gerado. */
export function vercelConfig() {
  const toList = (h) => h.map(([key, value]) => ({ key, value }))
  return {
    headers: [
      { source: '/(.*)', headers: toList(SECURITY_HEADERS) },
      { source: '/sw.js', headers: toList(SW_HEADERS) },
    ],
  }
}
