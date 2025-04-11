/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 */
export const debounce = <TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  timeout: number,
): [wrappedFn: (...args: TArgs) => void, clear: () => void] => {
  let timeoutId: number | undefined
  return [
    (...args: TArgs): void => {
      const later = () => {
        timeoutId = undefined
        func(...args)
      }
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(later, timeout)
    },
    () => {
      return clearTimeout(timeoutId)
    },
  ]
}

/**
 * Returns a function, that will be triggered, and then, as long as it continues to be invoked,
 * will not be triggered. The function can be triggered again after it stops being called for
 * N milliseconds.
 */
export const throttle = <TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  timeout: number,
): [wrappedFn: (...args: TArgs) => void, clear: () => void] => {
  let timeoutId: number | undefined
  return [
    (...args: TArgs): void => {
      const later = () => {
        timeoutId = undefined
      }
      const callNow = !timeout
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(later, timeout)
      if (callNow) func(...args)
    },
    () => {
      return clearTimeout(timeoutId)
    },
  ]
}
