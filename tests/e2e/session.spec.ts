import { expect, test } from '@playwright/test'
import {
  answer,
  answerRight,
  attemptsInDb,
  expectTouchTargets,
  finishSession,
  openMap,
  playPhase,
  startGame,
  sum,
  typeNumber,
} from './helpers'

test.describe('sessão de adição (360x740)', () => {
  test('joga offline usando dedos, quadro de dez e reta, e guarda tudo no aparelho', async ({
    page,
    context,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin
    const external: string[] = []
    context.on('request', (r) => {
      if (!r.url().startsWith('data:') && new URL(r.url()).origin !== origin) external.push(r.url())
    })

    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload()
    await context.setOffline(true)
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await playPhase(page)

    // Aprendendo: as Mãozinhas já vêm abertas.
    await expect(page.getByTestId('tool-dedos')).toBeVisible()
    await page.getByRole('button', { name: 'Dedo 1', exact: true }).tap()
    await answerRight(page)

    await page.getByRole('button', { name: 'Quadro', exact: true }).tap()
    await page.getByRole('button', { name: 'Casa 1', exact: true }).tap()
    await answerRight(page)

    await page.getByRole('button', { name: 'Reta', exact: true }).tap()
    await page.getByRole('button', { name: 'Pular +1' }).tap()
    await answerRight(page)

    // Erro: dica visual sem a palavra "errado" e sem som; a criança toca para seguir.
    await answer(page, (await sum(page)) + 1)
    await expect(page.getByTestId('hint')).toBeVisible()
    await expect(page.locator('main')).not.toContainText(/errad|erro|perdeu|fracasso/i)
    await page.getByRole('button', { name: 'Bora!' }).tap()
    await expect(page.getByTestId('equation')).toBeVisible()

    await expect(page.locator('input, textarea, [contenteditable]')).toHaveCount(0)
    expect(external).toEqual([])

    const rows = await attemptsInDb(page)
    expect(rows.length).toBe(4)
    expect(rows.flatMap((r) => r.supportsUsed)).toEqual(
      expect.arrayContaining(['dedos', 'quadro-de-dez', 'reta']),
    )
    expect(rows.filter((r) => !r.correct)).toHaveLength(1)
    expect(rows.every((r) => Number.isFinite(r.timeMs) && r.timeMs >= 0)).toBe(true)
  })

  test('alvos de toque ≥ 56 px, espaço ≥ 12 px, sem rolagem e sem cronômetro', async ({ page }) => {
    await startGame(page)
    await expect(page.getByTestId('tool-dedos')).toBeVisible()

    await expectTouchTargets(page)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await expect(page.locator('time, [role="timer"]')).toHaveCount(0)
    await expect(page.locator('main')).not.toContainText(/\d{1,2}:\d{2}|segundo|minuto/i)
  })

  test('o teclado aceita até 2 dígitos, apaga um por vez e só confirma com resposta', async ({
    page,
  }) => {
    await startGame(page)
    const confirm = page.getByRole('button', { name: 'Confirmar' })
    await expect(confirm).toBeDisabled()
    await typeNumber(page, 123)
    await expect(page.getByTestId('answer')).toHaveText('12')
    await page.getByRole('button', { name: 'Apagar' }).tap()
    await expect(page.getByTestId('answer')).toHaveText('1')
    await page.getByRole('button', { name: 'Apagar' }).tap()
    await expect(confirm).toBeDisabled()
  })

  test('depois de 10 min o Calú convida a descansar; descansar fecha com a voz do Calú, sem nota nem tempo', async ({
    page,
  }) => {
    await page.clock.install()
    await startGame(page)
    await answerRight(page)
    await page.clock.fastForward('11:00')
    await answer(page, await sum(page))
    await expect(page.getByText('Bora descansar? Amanhã tem mais!')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Descansar' }).tap()
    // no máximo um item de fechamento
    if (await page.getByTestId('equation').isVisible()) await answerRight(page)
    await expect(page.getByRole('button', { name: 'Voltar ao mapa' })).toBeVisible()
    await expect(page.getByTestId('stars')).toBeVisible()
    await expect(page.locator('main')).not.toContainText(/nota|pontos|\d{1,2}:\d{2}|%/i)
  })

  test('continuar depois do convite não tem punição', async ({ page }) => {
    await page.clock.install()
    await startGame(page)
    await answerRight(page)
    await page.clock.fastForward('11:00')
    await answer(page, await sum(page))
    await page.getByRole('button', { name: 'Continuar' }).tap({ timeout: 5000 })
    await expect(page.getByTestId('equation')).toBeVisible()
  })

  test('recarregar retoma a sessão e o progresso salvo', async ({ page }) => {
    await startGame(page)
    await answerRight(page)
    await answerRight(page)
    await page.reload()
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await playPhase(page)
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
    expect((await attemptsInDb(page)).length).toBe(2)
  })

  test('as telas de início, dica, convite e fim também respeitam alvos e espaços', async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto('/')
    await expectTouchTargets(page)
    await page.getByRole('button', { name: 'Jogar' }).tap()
    await expectTouchTargets(page, { scroll: true })
    await playPhase(page)
    for (const name of ['Quadro', 'Reta']) {
      await page.getByRole('button', { name, exact: true }).tap()
      await expectTouchTargets(page)
    }
    await answer(page, (await sum(page)) + 1)
    await expect(page.getByTestId('hint')).toBeVisible()
    await expectTouchTargets(page)
    await page.getByRole('button', { name: 'Bora!' }).tap()
    await expect(page.getByTestId('equation')).toBeVisible()
    await page.clock.fastForward('11:00')
    await answerRight(page)
    await expect(page.getByText('Bora descansar? Amanhã tem mais!')).toBeVisible({ timeout: 5000 })
    await expectTouchTargets(page)
    await page.getByRole('button', { name: 'Descansar' }).tap()
    if (await page.getByTestId('equation').isVisible()) await answerRight(page)
    await expect(page.getByRole('button', { name: 'Voltar ao mapa' })).toBeVisible()
    await expectTouchTargets(page)
  })

  test('Sair volta ao mapa sem perder o progresso', async ({ page }) => {
    await startGame(page)
    await answerRight(page)
    await page.getByRole('button', { name: 'Sair' }).tap()
    await expect(page.getByRole('heading', { name: 'Mapa' })).toBeVisible()
    await playPhase(page)
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
  })

  test('o foco acompanha a troca de tela', async ({ page }) => {
    await startGame(page)
    await answer(page, (await sum(page)) + 1)
    await expect(page.getByTestId('hint')).toBeVisible()
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('MAIN')
  })

  test('o som pode ser desligado na tela inicial e a escolha fica no aparelho', async ({
    page,
  }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: /^Som/ })
    await expect(toggle).toHaveText('Som ligado')
    await toggle.tap()
    await expect(toggle).toHaveText('Som desligado')
    await page.reload()
    await expect(page.getByRole('button', { name: /^Som/ })).toHaveText('Som desligado')
  })

  test('com "reduzir movimento" nenhuma transição passa de um instante', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await startGame(page)
    const ms = await page.evaluate(() => {
      const bar = document.querySelector('[role="progressbar"] > div')!
      return parseFloat(getComputedStyle(bar).transitionDuration) * 1000
    })
    expect(ms).toBeLessThan(5)
  })
})
