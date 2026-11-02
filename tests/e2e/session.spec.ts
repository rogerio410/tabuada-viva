import { expect, test, type Page } from '@playwright/test'

const sum = async (page: Page) => {
  const text = await page.getByTestId('equation').innerText()
  const m = text.match(/(\d+)\s*\+\s*(\d+)/)!
  return Number(m[1]) + Number(m[2])
}

const typeNumber = async (page: Page, n: number) => {
  for (const d of String(n)) await page.getByRole('button', { name: d, exact: true }).tap()
}

const answer = async (page: Page, n: number) => {
  await typeNumber(page, n)
  await page.getByRole('button', { name: 'Confirmar' }).tap()
}

/** Acerta a conta atual e espera a próxima tela (pergunta, convite ou fim). */
const answerRight = async (page: Page) => {
  await answer(page, await sum(page))
  await expect(page.getByTestId('feedback')).toBeVisible()
  await expect(page.getByTestId('feedback')).toBeHidden()
}

const attemptsInDb = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ supportsUsed: string[]; timeMs: number; correct: boolean }[]>(
        (resolve, reject) => {
          const open = indexedDB.open('tabuada-viva')
          open.onerror = () => reject(open.error)
          open.onsuccess = () => {
            const get = open.result.transaction('attempts').objectStore('attempts').getAll()
            get.onsuccess = () => resolve(get.result)
          }
        },
      ),
  )

const expectTouchTargets = async (page: Page) => {
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => {
        const r = b.getBoundingClientRect()
        return {
          name: b.textContent || b.ariaLabel || '',
          x: r.x,
          y: r.y,
          w: r.width,
          h: r.height,
        }
      }),
  )
  expect(boxes.length).toBeGreaterThan(0)
  for (const b of boxes) {
    expect(b.h, `altura de "${b.name}"`).toBeGreaterThanOrEqual(56)
    expect(b.w, `largura de "${b.name}"`).toBeGreaterThanOrEqual(56)
    expect(b.y + b.h, `"${b.name}" cabe na tela`).toBeLessThanOrEqual(740)
  }
  for (const [i, a] of boxes.entries())
    for (const b of boxes.slice(i + 1)) {
      const dx = Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w))
      const dy = Math.max(0, a.y - (b.y + b.h), b.y - (a.y + a.h))
      expect(Math.hypot(dx, dy), `espaço entre "${a.name}" e "${b.name}"`).toBeGreaterThanOrEqual(
        11.5,
      )
    }
}

const startGame = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Jogar' }).tap()
  await expect(page.getByTestId('equation')).toBeVisible()
}

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
    await expect(page.getByTestId('equation')).toBeVisible()

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
    await expect(page.getByText(/Você conseguiu\./)).toBeVisible()
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
    await expect(page.getByTestId('equation')).toBeVisible()
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
    await expect(page.getByTestId('equation')).toBeVisible()
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
    await expect(page.getByText(/Você conseguiu\./)).toBeVisible()
    await expectTouchTargets(page)
  })

  test('Sair volta ao início sem perder o progresso', async ({ page }) => {
    await startGame(page)
    await answerRight(page)
    await page.getByRole('button', { name: 'Sair' }).tap()
    await expect(page.getByRole('heading', { name: 'Tabuada Viva' })).toBeVisible()
    await page.getByRole('button', { name: 'Jogar' }).tap()
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
