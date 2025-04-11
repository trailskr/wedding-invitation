export const addEventListener = (
  target: EventTarget,
  event: string,
  listener: EventListenerOrEventListenerObject,
): (() => void) => {
  target.addEventListener(event, listener)
  return () => {
    target.removeEventListener(event, listener)
  }
}

/**
 * Returns a function, which only invokes the passed function at most once per animation frame on a browser.
 * The function will be called with the arguments of the last call before frame accured.
 */
export const throttleRequestAnimationFrame = <TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
): [wrappedFn: (...args: TArgs) => void, clear: () => void] => {
  let requestId: number | undefined

  let lastArgs: TArgs

  const throttled = (...args: TArgs) => {
    lastArgs = args
    if (requestId == null) {
      requestId = requestAnimationFrame(() => {
        requestId = undefined
        fn(...lastArgs)
      })
    }
  }

  const clear = () => {
    if (requestId == null) return
    cancelAnimationFrame(requestId)
    requestId = undefined
  }

  return [throttled, clear]
}
