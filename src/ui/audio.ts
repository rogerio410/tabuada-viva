/**
 * Sons por Web Audio (D18): só o de acerto, curto (< 1 s). Não existe som de fracasso.
 * O contexto nasce no primeiro toque, como os navegadores exigem; sem Web Audio, fica em silêncio.
 */
let ctx: AudioContext | null = null

export function playCorrect(): void {
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
