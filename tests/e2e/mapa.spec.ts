import { expect, test } from '@playwright/test'
import {
  answer,
  answerRight,
  attemptsInDb,
  expectTouchTargets,
  finishSession,
  openMap,
  playPhase,
  seedProgress,
  sum,
} from './helpers'

const W1 = ['W1-P01', 'W1-P02', 'W1-P03', 'W1-P04', 'W1-P05', 'W1-P06', 'W1-P07', 'W1-P08']

test.describe('mapa, estrelas e subtração (360x740)', () => {
  test('perfil novo: só a primeira fase está liberada; as outras não respondem ao toque', async ({
    page,
  }) => {
    await openMap(page)
    await expect(page.getByTestId('phase-W1-P01')).toBeEnabled()
    await expect(page.getByTestId('phase-W1-P01')).toHaveAttribute('data-state', 'current')
    for (const id of ['W1-P02', 'W1-P08', 'W2-P01', 'W2-P07'])
      await expect(page.getByTestId(`phase-${id}`)).toBeDisabled()
    await expect(page.getByText('Mundos 3 e 4: em breve')).toBeVisible()
    await expect(page.getByText('Portão: em breve')).toBeVisible()
    await expect(page.locator('main')).not.toContainText(/crit[ée]rio|portão abre|o que falta/i)
    await expectTouchTargets(page, { scroll: true })
    await expect(page.getByTestId('phase-W1-P02')).toContainText('Bloqueada')
    await expect(page.getByTestId('phase-W1-P01')).toContainText('fase atual')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0)
    await expect(page.locator('input, textarea, [contenteditable]')).toHaveCount(0)
  })

  test('jogar a fase 3 vezes com acerto total dá 3 estrelas e abre a próxima; recarregar mantém', async ({
    page,
  }) => {
    await page.clock.install()
    await openMap(page)
    for (let i = 0; i < 3; i++) {
      await playPhase(page, 'W1-P01')
      await answerRight(page)
      await finishSession(page)
      await expect(page.getByTestId('stars')).toHaveAttribute('data-count', '3')
      await expect(page.getByRole('img', { name: '3 de 3 estrelas' })).toBeVisible()
      await page.getByRole('button', { name: 'Voltar ao mapa' }).tap()
      await expect(page.getByRole('heading', { name: 'Mapa' })).toBeVisible()
      if (i < 2) await expect(page.getByTestId('phase-W1-P02')).toBeDisabled()
    }
    await expect(page.getByTestId('phase-W1-P02')).toBeEnabled()
    await expect(page.getByTestId('phase-W1-P01').getByTestId('stars')).toHaveAttribute(
      'data-count',
      '3',
    )
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await expect(page.getByTestId('phase-W1-P02')).toBeEnabled()
    await expect(page.getByTestId('phase-W1-P01').getByTestId('stars')).toHaveAttribute(
      'data-count',
      '3',
    )
    const rows = await attemptsInDb(page)
    expect(rows.every((r) => r.phaseId === 'W1-P01')).toBe(true)
  })

  test('errar muito dá poucas estrelas e a fase não libera a próxima', async ({ page }) => {
    await page.clock.install()
    await openMap(page)
    await playPhase(page, 'W1-P01')
    for (let i = 0; i < 4; i++) {
      await answer(page, (await sum(page)) + 1)
      await expect(page.getByTestId('hint')).toBeVisible()
      await page.getByRole('button', { name: 'Bora!' }).tap()
    }
    await finishSession(page)
    const count = Number(await page.getByTestId('stars').getAttribute('data-count'))
    expect(count).toBeLessThanOrEqual(1)
    await expect(page.locator('main')).not.toContainText(/errad|fracasso|perdeu|n[ãa]o passou/i)
    await page.getByRole('button', { name: 'Voltar ao mapa' }).tap()
    await expect(page.getByTestId('phase-W1-P02')).toBeDisabled()
  })

  test('Mundo 2: subtração com sinal −, família do triângulo e dica pela adição inversa', async ({
    page,
  }) => {
    await openMap(page)
    await seedProgress(page, [...W1, 'W2-P01'])
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await expect(page.getByTestId('phase-W2-P02')).toHaveAttribute('data-state', 'current')
    await playPhase(page, 'W2-P02')

    // família do triângulo: a soma de origem e depois a subtração, em sequência
    let sawSub = false
    for (let i = 0; i < 6 && !sawSub; i++) {
      const text = await page.getByTestId('equation').innerText()
      if (text.includes('−')) {
        sawSub = true
        break
      }
      await answerRight(page)
    }
    expect(sawSub).toBe(true)
    // a família do triângulo aparece quando um triângulo ainda é novo (depois da prática guiada)
    for (let i = 0; i < 40; i++) {
      if (
        (await attemptsInDb(page)).some((r) => r.kind === 'family' && r.factId.startsWith('sub:'))
      )
        break
      await answerRight(page)
    }

    for (let i = 0; i < 20 && !(await page.getByTestId('equation').innerText()).includes('−'); i++)
      await answerRight(page)

    // erro em subtração: a dica é a adição inversa (b + r = a), sem frase nova
    const [, a, b] = (await page.getByTestId('equation').innerText()).match(/(\d+)\s*−\s*(\d+)/)!
    await answer(page, (await sum(page)) + 1)
    await expect(page.getByTestId('hint')).toContainText(`${b} + ${Number(a) - Number(b)} = ${a}`)
    await expect(page.locator('main')).not.toContainText(/errad|erro/i)
    await page.getByRole('button', { name: 'Bora!' }).tap()

    const rows = await attemptsInDb(page)
    expect(rows.some((r) => r.kind === 'family' && r.factId.startsWith('add:'))).toBe(true)
    expect(rows.some((r) => r.kind === 'family' && r.factId.startsWith('sub:'))).toBe(true)
    expect(rows.every((r) => r.phaseId === 'W2-P02')).toBe(true)
  })

  test('reta numérica pula para trás na subtração', async ({ page }) => {
    await openMap(page)
    await seedProgress(page, [...W1, 'W2-P01'])
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await playPhase(page, 'W2-P02')
    for (let i = 0; i < 6; i++) {
      if ((await page.getByTestId('equation').innerText()).includes('−')) break
      await answerRight(page)
    }
    await page.getByRole('button', { name: 'Reta', exact: true }).tap()
    await expect(page.getByRole('button', { name: 'Pular −1' })).toBeVisible()
    await expectTouchTargets(page)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0)
  })
})
