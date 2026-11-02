/**
 * Sons por Web Audio (D18): só o de acerto, curto (< 1 s). Não existe som de fracasso.
 * O contexto nasce no primeiro toque, como os navegadores exigem; sem Web Audio, fica em silêncio.
 */
let ctx: AudioContext | null = null
const KEY = 'tv-som'

/** Preferência de som deste aparelho (nada sai dele). Sem armazenamento disponível, o som fica ligado. */
export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // sem armazenamento: vale só até recarregar
  }
}

export function playCorrect(): void {
  if (!isSoundOn()) return
  try {
    ctx ??= new AudioContext()
    const t = ctx.currentTime
    for (const [i, freq] of [523.25, 659.25].entries()) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.15, t + i * 0.12 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.25)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t + i * 0.12)
      osc.stop(t + i * 0.12 + 0.3)
    }
  } catch {
    // sem áudio disponível: o feedback visual basta
  }
}
