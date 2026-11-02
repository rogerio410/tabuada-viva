import { expect, test } from '@playwright/test'

test.describe('privacidade e CSP (360x740)', () => {
  test('nenhuma requisição sai do domínio e a CSP não é violada', async ({ page, baseURL }) => {
    const external: string[] = []
    page.on('request', (r) => {
      if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url())
    })
    const consoleErrors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })
    await page.addInitScript(() => {
      ;(window as unknown as { __csp: string[] }).__csp = []
      document.addEventListener('securitypolicyviolation', (e) =>
        (window as unknown as { __csp: string[] }).__csp.push(
          `${e.violatedDirective} ${e.blockedURI}`,
        ),
      )
    })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Tabuada Viva' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(external).toEqual([])
    expect(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp)).toEqual([])
    expect(consoleErrors.filter((t) => /content security policy/i.test(t))).toEqual([])
  })

  test('responde com os cabeçalhos de segurança', async ({ request }) => {
    const res = await request.get('/')
    const h = res.headers()
    expect(h['content-security-policy']).toContain("default-src 'self'")
    expect(h['referrer-policy']).toBe('no-referrer')
    expect(h['permissions-policy']).toContain('camera=()')
    expect(h['x-content-type-options']).toBe('nosniff')
  })

  test('nenhum campo de texto livre, link externo ou iframe na tela da criança', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.locator('input, textarea, [contenteditable], iframe')).toHaveCount(0)
    await expect(page.locator('a[href^="http"], [target="_blank"]')).toHaveCount(0)
  })

  test('a CSP não quebra o service worker: o app abre offline', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    await page.reload() // o 2º carregamento já é controlado pelo SW
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Tabuada Viva' })).toBeVisible()
  })
})
