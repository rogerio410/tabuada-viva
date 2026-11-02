import { expect, test } from '@playwright/test'

test('abre o app em 360x740 sem rolagem horizontal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tabuada Viva' })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(overflow).toBe(false)
})

test('declara manifest PWA em pt-BR', async ({ page }) => {
  await page.goto('/')
  const href = await page.locator('link[rel=manifest]').getAttribute('href')
  const res = await page.request.get(href!)
  const m = await res.json()
  expect(m.lang).toBe('pt-BR')
  expect(m.display).toBe('standalone')
})
