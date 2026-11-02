// Regras puras da barreira de privacidade (LGPD art. 14, CLAUDE.md). Usadas por check-no-trackers.mjs e testadas em Vitest.

/** Rastreadores, anúncios e fontes/CDNs externos proibidos no build e no HTML. */
export const BANNED = [
  /google-analytics/i,
  /googletagmanager/i,
  /gtag\(/,
  /fbevents/i,
  /connect\.facebook\.net/i,
  /analytics\.tiktok/i,
  /hotjar/i,
  /mixpanel/i,
  /segment\.(com|io)/i,
  /posthog/i,
  /amplitude\.com/i,
  /sentry\.io/i,
  /browser\.sentry-cdn/i,
  /datadoghq/i,
  /clarity\.ms/i,
  /fullstory/i,
  /intercom/i,
  /crisp\.chat/i,
  /adsbygoogle/i,
  /doubleclick\.net/i,
  /googlesyndication/i,
  /youtube\.com\/embed/i,
  /youtube-nocookie/i,
  /maps\.googleapis/i,
  /fonts\.googleapis/i,
  /fonts\.gstatic/i,
  /cdn\.jsdelivr/i,
  /unpkg\.com/i,
  /cdnjs\.cloudflare/i,
  /navigator\.sendBeacon/,
]

/**
 * URLs absolutas que aparecem como texto no build mas nunca são requisitadas:
 * namespaces SVG/XML, mensagens de erro do React, comentário de licença do Tailwind, aviso do Workbox.
 * A URL do Supabase entra aqui no Sprint 4 (junto com `connect-src` da CSP).
 */
export const ALLOWED_URL_PREFIXES = [
  'http://www.w3.org/',
  'https://www.w3.org/',
  'https://react.dev/errors/',
  'https://tailwindcss.com',
  'https://bit.ly/wb-',
]

const URL_RE = /https?:\/\/[^\s"'`)<>\\]+/g

/** Verifica um arquivo do build (js, css, html, webmanifest). */
export function scanBuiltFile(file, text) {
  const out = []
  for (const re of BANNED)
    if (re.test(text)) out.push({ file, rule: 'tracker', detail: String(re) })
  for (const url of text.match(URL_RE) ?? [])
    if (!ALLOWED_URL_PREFIXES.some((p) => url.startsWith(p)))
      out.push({ file, rule: 'url-externa', detail: url })
  return out
}

const CHILD_UI_RULES = [
  ['link-externo', /href\s*=\s*[{"'`\s]*https?:/i],
  ['nova-aba', /target\s*=\s*[{"'`\s]*_blank/i],
  ['window.open', /window\.open\s*\(/],
  ['navegacao-externa', /location\.(href|assign|replace)\s*[=(]/],
  ['iframe', /<iframe/i],
  ['texto-livre', /<textarea|contenteditable/i],
  ['rede-na-ui', /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b\s*[(]?/],
]

/** Verifica código da área da criança (src/ui). O painel do adulto (src/dashboard) fica fora. */
export function scanChildUiSource(file, text) {
  const out = []
  for (const [rule, re] of CHILD_UI_RULES)
    if (re.test(text)) out.push({ file, rule, detail: String(re) })
  // <input> só para tipos que não recebem texto livre
  for (const m of text.matchAll(/<input\b[^>]*>/gi)) {
    const type = /type\s*=\s*["'{]*\s*["']?(\w+)/i.exec(m[0])?.[1]?.toLowerCase()
    if (!type || ['text', 'search', 'email', 'tel', 'url', 'password', 'number'].includes(type))
      out.push({ file, rule: 'texto-livre', detail: m[0] })
  }
  return out
}
