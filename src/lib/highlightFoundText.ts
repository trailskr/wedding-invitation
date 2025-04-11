export type HighlightFn = (data?: string | number) => string[]

/**
 * Создаёт функцию для выделения найденного текста.
 * Каждый второй элемент в результате нужно выделить.
 */
export const createFoundTextHighlightFn = (query?: string): HighlightFn => {
  const highlightRe = query ? new RegExp(escapeRegExp(query), 'i') : undefined

  return (data?: string | number): string[] => {
    if (data == null) return ['']
    const str = data.toString()
    if (!highlightRe) return [str]
    return str ? str.replace(highlightRe, '<*!*>$&<*!*>').split('<*!*>') : ['']
  }
}
