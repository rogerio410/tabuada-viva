import { describe, expect, it } from 'vitest'
import { scanBuiltFile, scanChildUiSource } from './lib/tracker-rules.mjs'

const rules = (v: Array<{ rule: string }>) => v.map((x) => x.rule)

describe('scanBuiltFile', () => {
  it('reprova rastreadores, CDNs e fontes externas', () => {
    for (const bad of [
      'https://browser.sentry-cdn.com/x.js',
      'https://js.datadoghq.com/a.js',
      'https://unpkg.com/react',
      'https://fonts.googleapis.com/css',
      'x.adsbygoogle.push({})',
      'navigator.sendBeacon("/t")',
    ])
      expect(scanBuiltFile('dist/a.js', bad).length, bad).toBeGreaterThan(0)
  })

  it('reprova URL absoluta fora da allowlist', () => {
    expect(rules(scanBuiltFile('dist/a.js', 'fetch("https://api.exemplo.com/x")'))).toContain(
      'url-externa',
    )
  })

  it('aceita as URLs que só aparecem como texto (namespaces, React, Tailwind, Workbox)', () => {
    const ok = [
      'xmlns="http://www.w3.org/2000/svg"',
      'var t=`https://react.dev/errors/`+e',
      '/*! tailwindcss v4 | MIT License | https://tailwindcss.com */',
      'Learn more at https://bit.ly/wb-precache',
      'MissingAPI:`Please visit https://tinyurl.com/y2uuvskb`',
      'new Error(`See http://bit.ly/2kdckMn`)',
    ].join('\n')
    expect(scanBuiltFile('dist/a.js', ok)).toEqual([])
  })

  it('a exceção do Dexie vale só para as URLs exatas, não para o domínio', () => {
    expect(rules(scanBuiltFile('dist/a.js', 'https://tinyurl.com/outra'))).toContain('url-externa')
    expect(rules(scanBuiltFile('dist/a.js', 'http://bit.ly/outra'))).toContain('url-externa')
  })

  it('não confunde onDoubleClick do React com o domínio de anúncios', () => {
    expect(scanBuiltFile('dist/a.js', 'onDoubleClick:"dblclick"')).toEqual([])
    expect(scanBuiltFile('dist/a.js', 'https://ad.doubleclick.net/x').length).toBeGreaterThan(0)
  })

  it('pega domínio disfarçado, protocolo-relativo e WebSocket', () => {
    expect(rules(scanBuiltFile('dist/a.js', 'https://tailwindcss.com.evil.example/x'))).toContain(
      'url-externa',
    )
    expect(rules(scanBuiltFile('dist/a.js', 'src="//cdn.exemplo.com/a.js"'))).toContain(
      'url-externa',
    )
    expect(rules(scanBuiltFile('dist/a.js', 'new WebSocket("wss://x.exemplo.com")'))).toContain(
      'url-externa',
    )
  })

  it('pega analytics da hospedagem e de terceiros comuns', () => {
    for (const bad of [
      '/_vercel/insights/script.js',
      'plausible.io/js',
      'cdn.logrocket.io',
      'static.cloudflareinsights.com',
    ])
      expect(scanBuiltFile('dist/a.js', bad).length, bad).toBeGreaterThan(0)
  })

  it('passa em um HTML limpo', () => {
    expect(
      scanBuiltFile('index.html', '<script type="module" src="/assets/index.js"></script>'),
    ).toEqual([])
  })
})

describe('scanChildUiSource', () => {
  it('reprova link externo, nova aba, iframe, window.open e rede na UI', () => {
    expect(rules(scanChildUiSource('a.tsx', '<a href="https://exemplo.com">x</a>'))).toContain(
      'link-externo',
    )
    expect(rules(scanChildUiSource('a.tsx', '<a target="_blank">x</a>'))).toContain('nova-aba')
    expect(rules(scanChildUiSource('a.tsx', '<iframe src="/x" />'))).toContain('iframe')
    expect(rules(scanChildUiSource('a.tsx', 'window.open("/x")'))).toContain('window.open')
    expect(rules(scanChildUiSource('a.tsx', 'location.href = "/x"'))).toContain('navegacao-externa')
    expect(rules(scanChildUiSource('a.tsx', 'await fetch("/x")'))).toContain('rede-na-ui')
  })

  it('reprova mailto, tel, link protocolo-relativo, window.location e input de tipo dinâmico', () => {
    expect(rules(scanChildUiSource('a.tsx', '<a href="mailto:a@b.c">x</a>'))).toContain(
      'contato-externo',
    )
    expect(rules(scanChildUiSource('a.tsx', '<a href="tel:123">x</a>'))).toContain(
      'contato-externo',
    )
    expect(rules(scanChildUiSource('a.tsx', '<a href="//exemplo.com">x</a>'))).toContain(
      'link-externo',
    )
    expect(rules(scanChildUiSource('a.tsx', 'window.location = "/x"'))).toContain(
      'navegacao-externa',
    )
    expect(rules(scanChildUiSource('a.tsx', 'document.location = "/x"'))).toContain(
      'navegacao-externa',
    )
    expect(rules(scanChildUiSource('a.tsx', '<input type={tipo} />'))).toContain('texto-livre')
  })

  it('reprova texto livre: textarea e <input> de texto ou sem tipo', () => {
    expect(rules(scanChildUiSource('a.tsx', '<textarea />'))).toContain('texto-livre')
    expect(rules(scanChildUiSource('a.tsx', '<input />'))).toContain('texto-livre')
    expect(rules(scanChildUiSource('a.tsx', '<input type="text" />'))).toContain('texto-livre')
    expect(rules(scanChildUiSource('a.tsx', '<input type="number" />'))).toContain('texto-livre')
  })

  it('aceita botões, links internos e inputs que não recebem texto', () => {
    const ok =
      '<button>1</button><a href="/mapa">mapa</a><input type="checkbox" /><input type="range" />'
    expect(scanChildUiSource('a.tsx', ok)).toEqual([])
  })
})
