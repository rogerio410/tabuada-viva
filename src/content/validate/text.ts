/** Verificações determinísticas de texto (checklist C, D, E). */

const norm = (s: string) => s.toLocaleLowerCase('pt-BR').normalize('NFC')

export const tokens = (text: string): string[] => (text.match(/[\p{L}]+/gu) ?? []).map(norm)

/** Frases terminadas em . ! ? (a última pode vir sem pontuação). */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean)
}

export const wordCount = (sentence: string): number => (sentence.match(/[\p{L}\d]+/gu) ?? []).length

const NUMBER_WORDS = new Set(
  'zero dois duas tres três quatro cinco seis sete oito nove dez onze doze treze catorze quatorze quinze dezesseis dezessete dezoito dezenove vinte trinta quarenta cinquenta cem'.split(
    ' ',
  ),
)

/** Números por extenso (a regra é algarismo; "um/uma" ficam de fora por serem artigos). */
export const numberWords = (text: string): string[] =>
  tokens(text).filter((t) => NUMBER_WORDS.has(t))

/** Palavras ou expressões proibidas, comparadas por palavra inteira. */
export function forbiddenHits(text: string, forbidden: string[]): string[] {
  const padded = ` ${tokens(text).join(' ')} `
  return forbidden.filter((f) => padded.includes(` ${tokens(f).join(' ')} `))
}

/** Palavras fora do vocabulário permitido (lista de 2º ano + personagens). */
export function unknownWords(text: string, allowed: Set<string>): string[] {
  return [...new Set(tokens(text).filter((t) => !allowed.has(t)))]
}

export const hasLinkOrContact = (text: string): boolean =>
  /https?:\/\/|www\.|\S+@\S+\.\S+|\b\d{4,}[-\s]?\d{4}\b|\.com\b|\.br\b/i.test(text)
