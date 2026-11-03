import { expect, type Page } from '@playwright/test'

/** Resultado da conta na tela (+ ou −). */
export const sum = async (page: Page) => {
  const text = await page.getByTestId('equation').innerText()
  const m = text.match(/(\d+)\s*([+−])\s*(\d+)/)!
  return m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3])
}

export const typeNumber = async (page: Page, n: number) => {
  for (const d of String(n)) await page.getByRole('button', { name: d, exact: true }).tap()
}

export const answer = async (page: Page, n: number) => {
  await typeNumber(page, n)
  await page.getByRole('button', { name: 'Confirmar' }).tap()
}

/** Acerta a conta atual e espera a próxima tela (pergunta, convite ou fim). */
export const answerRight = async (page: Page) => {
  await answer(page, await sum(page))
  await expect(page.getByTestId('feedback')).toBeVisible()
  await expect(page.getByTestId('feedback')).toBeHidden()
}

interface AttemptRow {
  supportsUsed: string[]
  timeMs: number
  correct: boolean
  kind: string
  factId: string
  phaseId: string | null
}

export const attemptsInDb = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<AttemptRow[]>((resolve, reject) => {
        const open = indexedDB.open('tabuada-viva')
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const get = open.result.transaction('attempts').objectStore('attempts').getAll()
          get.onsuccess = () => resolve(get.result)
        }
      }),
  )

/** `scroll`: tela rolável (mapa); o botão só precisa caber na tela se estiver na primeira dobra. */
export const expectTouchTargets = async (page: Page, { scroll = false } = {}) => {
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
    if (!scroll) expect(b.y + b.h, `"${b.name}" cabe na tela`).toBeLessThanOrEqual(740)
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

/** Do início ao mapa. */
export const openMap = async (page: Page) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Jogar' }).tap()
  await expect(page.getByRole('heading', { name: 'Mapa' })).toBeVisible()
}

/**
 * Atravessa a lição aberta: responde as perguntas guiadas, tenta os cartões até acertar, toca nas ações do passo
 * (juntar, tirar, pular, família...) e em "Continuar". `onStep` roda uma vez por passo; `stopAt: 'choose'` para
 * quando os cartões do padrão aparecem.
 */
export const finishLesson = async (
  page: Page,
  { onStep, stopAt }: { onStep?: (step: number) => Promise<void>; stopAt?: 'choose' } = {},
) => {
  const lesson = page.getByTestId('lesson')
  const cont = page.getByTestId('continue')
  await expect(lesson).toBeVisible()
  let lastStep = -1
  let taps = 0
  for (let guard = 0; guard < 120; guard++) {
    if (!(await lesson.isVisible())) return
    const step = Number(await page.getByRole('progressbar').first().getAttribute('aria-valuenow'))
    if (step !== lastStep) {
      lastStep = step
      taps = 0
      await onStep?.(step)
    }
    if (stopAt === 'choose' && (await page.getByTestId('choice').count()) > 0) return
    if (await cont.isEnabled()) {
      const final = /Bora jogar!|Voltar/.test((await cont.textContent()) ?? '')
      await cont.tap()
      if (final) {
        await expect(lesson).toBeHidden()
        return
      }
      continue
    }
    const expr = page.getByTestId('lesson-expr')
    if (await expr.isVisible()) {
      const text = (await expr.innerText()).trim()
      const missing = /^(\d+) \+ \? = (\d+)/.exec(text)
      const simple = /^(\d+) ([+−]) (\d+)/.exec(text)
      const value = missing
        ? Number(missing[2]) - Number(missing[1])
        : simple![2] === '+'
          ? Number(simple![1]) + Number(simple![3])
          : Number(simple![1]) - Number(simple![3])
      await answer(page, value)
      continue
    }
    const choices = page.getByTestId('choice')
    if ((await choices.count()) > 0) {
      for (let i = 0; i < (await choices.count()); i++)
        if (await choices.nth(i).isEnabled()) {
          await choices.nth(i).tap()
          break
        }
      continue
    }
    // em passos de alternar (quadro de dez, família) toca uma ação diferente a cada vez
    const actions = page.getByTestId('step-action').and(page.locator(':enabled'))
    const n = await actions.count()
    if (n > 0) await actions.nth(taps++ % n).tap()
  }
  const where = (await lesson.innerText().catch(() => '(sem lição)')).replace(/\s+/g, ' ')
  throw new Error(`a lição não terminou no passo ${lastStep}: ${where}`)
}

/** Toca numa fase do mapa e chega à primeira pergunta (atravessando a lição, se for a primeira vez). */
export const playPhase = async (page: Page, phaseId = 'W1-P01') => {
  const phase = page.getByTestId(`phase-${phaseId}`)
  await phase.scrollIntoViewIfNeeded()
  await phase.tap()
  await expect(page.getByTestId('equation').or(page.getByTestId('lesson'))).toBeVisible()
  if (await page.getByTestId('lesson').isVisible()) await finishLesson(page)
  await expect(page.getByTestId('equation')).toBeVisible()
}

export const startGame = async (page: Page) => {
  await openMap(page)
  await playPhase(page)
}

/**
 * Encerra a sessão em andamento: avança o relógio além do convite de descanso, responde o que estiver na tela e
 * aceita descansar; responde o item de fechamento, se houver. Exige `page.clock.install()`.
 */
export const finishSession = async (page: Page) => {
  await page.clock.fastForward('11:00')
  await answer(page, await sum(page))
  await expect(page.getByText('Bora descansar? Amanhã tem mais!')).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: 'Descansar' }).tap()
  await finishAfterRest(page)
}

/** Depois de aceitar descansar: responde o item de fechamento, se vier, e espera a tela de resultado. */
export const finishAfterRest = async (page: Page) => {
  const back = page.getByRole('button', { name: 'Voltar ao mapa' })
  await expect(page.getByTestId('equation').or(back)).toBeVisible()
  if (await page.getByTestId('equation').isVisible()) await answerRight(page)
  await expect(back).toBeVisible()
}

/**
 * Semeia o IndexedDB como se a criança já tivesse concluído as fases dadas (3 sessões com 100% e 3 estrelas) e
 * dominasse as somas (Praticando), para abrir a subtração sem jogar dias seguidos. O app precisa ter aberto o
 * banco uma vez (abra o mapa); recarregue depois.
 */
export const seedProgress = (page: Page, donePhases: string[]) =>
  page.evaluate(
    (phases) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('tabuada-viva')
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const tx = open.result.transaction(['sessions', 'wallets', 'factStates'], 'readwrite')
          const child = 'perfil-local'
          const when = new Date(2026, 10, 1, 10, 0, 0)
          let n = 0
          for (const phaseId of phases)
            for (let i = 0; i < 3; i++)
              tx.objectStore('sessions').put({
                id: `seed-${n++}`,
                childId: child,
                phaseId,
                startedAt: when,
                endedAt: when,
                itemCount: 20,
                accuracy: 1,
              })
          tx.objectStore('wallets').put({
            childId: child,
            cajus: 0,
            piggyBank: 0,
            stars: Object.fromEntries(phases.map((p) => [p, 3])),
            stickers: [],
          })
          for (let a = 0; a <= 10; a++)
            for (let b = a; a + b <= 10; b++)
              tx.objectStore('factStates').put({
                childId: child,
                factId: `add:${a}+${b}`,
                status: 'praticando',
                nextReview: new Date(2030, 0, 1), // longe: sem revisões vencidas na frente do triângulo novo
                streak: 0,
                fastDays: [],
                correct: 5,
                wrong: 0,
                medianMs: 2000,
              })
          tx.oncomplete = () => resolve()
          tx.onerror = () => reject(tx.error)
        }
      }),
    donePhases,
  )
