import { expect, test } from '@playwright/test'
import {
  answerRight,
  attemptsInDb,
  expectTouchTargets,
  finishLesson,
  openMap,
  playPhase,
  seedProgress,
} from './helpers'

const W1 = ['W1-P01', 'W1-P02', 'W1-P03', 'W1-P04', 'W1-P05', 'W1-P06', 'W1-P07', 'W1-P08']

const noOverflow = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

test.describe('lições e prática guiada (360x740)', () => {
  test('a lição abre na 1ª vez, não grava resposta, e depois vem a prática guiada com a ajuda aberta', async ({
    page,
  }) => {
    await openMap(page)
    await page.getByTestId('phase-W1-P01').tap()
    await expect(page.getByTestId('lesson')).toBeVisible()
    await expect(page.getByTestId('bubble')).toContainText('Calú')
    await finishLesson(page)
    expect(await attemptsInDb(page)).toEqual([]) // nada da lição virou resposta
    await expect(page.getByTestId('tool-dedos')).toBeVisible() // guiada: a ferramenta já vem aberta
    await answerRight(page)
    const rows = await attemptsInDb(page)
    expect(rows.length).toBe(1)
    expect(rows[0]).toMatchObject({ kind: 'fact', phaseId: 'W1-P01' })
  })

  test('na 2ª vez a lição não abre sozinha e o mapa oferece "Lição" só nas fases liberadas', async ({
    page,
  }) => {
    await openMap(page)
    await playPhase(page)
    await answerRight(page)
    await page.getByRole('button', { name: 'Sair' }).tap()
    await expect(page.getByTestId('lesson-W1-P01')).toBeVisible()
    await expect(page.getByTestId('lesson-W1-P02')).toHaveCount(0) // bloqueada
    await page.getByTestId('phase-W1-P01').tap()
    await expect(page.getByTestId('equation')).toBeVisible() // direto às perguntas
    await expect(page.getByTestId('lesson')).toHaveCount(0)
  })

  test('"Lição" no mapa mostra de novo e volta ao mapa, sem gravar nada', async ({ page }) => {
    await openMap(page)
    await page.getByTestId('lesson-W1-P01').tap()
    await expect(page.getByTestId('lesson')).toBeVisible()
    await finishLesson(page)
    await expect(page.getByRole('heading', { name: 'Mapa' })).toBeVisible()
    expect(await attemptsInDb(page)).toEqual([])
  })

  test('padrão do dia: errar um cartão deixa tentar de novo; o certo completa a tira e o Calú nomeia', async ({
    page,
  }) => {
    await openMap(page)
    await page.getByTestId('phase-W1-P01').tap()
    await finishLesson(page, { stopAt: 'choose' })
    const choices = page.getByTestId('choice')
    await expect(page.getByTestId('strip')).toContainText('4 + 0 = ?')
    await choices.filter({ hasText: /^3$/ }).tap() // errado: tenta de novo, sem punição
    await expect(page.getByTestId('bubble')).toContainText('Quase')
    await expect(page.getByTestId('continue')).toBeDisabled()
    await expect(page.locator('main')).not.toContainText(/errad|fracasso|perdeu/i)
    await choices.filter({ hasText: /^4$/ }).tap()
    await expect(page.getByTestId('strip')).toContainText('4 + 0 = 4')
    await page.getByTestId('continue').tap()
    await expect(page.getByTestId('bubble')).toContainText('Somar 0 não muda nada')
  })

  test('todos os passos das 8 lições do Mundo 1 respeitam alvos, espaço, sem rolagem horizontal e sem cronômetro', async ({
    page,
  }) => {
    await openMap(page)
    await seedProgress(page, W1.slice(0, 7))
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    for (const id of W1) {
      await page.getByTestId(`lesson-${id}`).tap()
      await finishLesson(page, {
        onStep: async () => {
          await expectTouchTargets(page)
          expect(await noOverflow(page)).toBeLessThanOrEqual(0)
          await expect(page.getByTestId('lesson')).not.toContainText(
            /\d{1,2}:\d{2}|segundo|minuto/i,
          )
          await expect(page.locator('input, textarea, [contenteditable]')).toHaveCount(0)
        },
      })
    }
  })

  test('as lições de todo o Mundo 2 também cabem na tela (família, reta para trás, remover)', async ({
    page,
  }) => {
    await openMap(page)
    await seedProgress(page, [...W1, 'W2-P01', 'W2-P02', 'W2-P03', 'W2-P04', 'W2-P05'])
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    for (const id of ['W2-P01', 'W2-P02', 'W2-P03', 'W2-P04', 'W2-P05', 'W2-P06']) {
      await page.getByTestId(`lesson-${id}`).scrollIntoViewIfNeeded()
      await page.getByTestId(`lesson-${id}`).tap()
      await finishLesson(page, {
        onStep: async () => {
          await expectTouchTargets(page)
          expect(await noOverflow(page)).toBeLessThanOrEqual(0)
        },
      })
    }
  })

  test('"Ver o truque" abre a lição por cima da pergunta e volta sem perder o que foi digitado', async ({
    page,
  }) => {
    await openMap(page)
    await playPhase(page)
    await page.getByRole('button', { name: '7', exact: true }).tap()
    await page.getByTestId('truque').tap()
    await expect(page.getByTestId('lesson')).toBeVisible()
    await finishLesson(page)
    await expect(page.getByTestId('equation')).toBeVisible()
    await expect(page.getByTestId('answer')).toHaveText('7')
    expect(await attemptsInDb(page)).toEqual([])
  })

  test('a lição funciona offline', async ({ page, context }) => {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload()
    await context.setOffline(true)
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await page.getByTestId('phase-W1-P01').tap()
    await finishLesson(page)
    await expect(page.getByTestId('equation')).toBeVisible()
  })

  test('a prática guiada tira o apoio aos poucos: o último item abre sem ferramenta', async ({
    page,
  }) => {
    await openMap(page)
    await playPhase(page)
    const opened: boolean[] = []
    for (let i = 0; i < 8; i++) {
      if (!(await page.getByTestId('equation').isVisible())) break
      opened.push(await page.getByTestId('tools').isVisible())
      await answerRight(page)
    }
    expect(opened[0]).toBe(true)
    // depois do primeiro terço, a ferramenta não abre mais sozinha
    expect(opened.slice(3, 6).some((o) => o)).toBe(false)
  })
})
