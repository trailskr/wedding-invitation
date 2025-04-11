import { isObjectLike } from './typecheck'

export type DeepCloneOptions = {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: (key: PropertyKey, from: unknown, copy: unknown) => boolean
  /**
   * Sort keys in the result object alphabetically
   */
  sortKeys?: boolean
}

/**
 * Deeply clones all the object's own fields into a new one
 * @param from - Source
 * @return Source clone
 */
export const deepClone = <T>(from: T, options: DeepCloneOptions = {}): T => {
  if (!isObjectLike(from)) return from

  if (isArray(from)) {
    const copy: unknown[] = []
    from.forEach((item, i) => {
      copy[i] = deepClone(item, options)
    })
    return copy as T
  }

  const copy = Object.create(Object.getPrototypeOf(from))
  const keys = Object.keys(from)
  if (options.sortKeys) keys.sort((a, b) => a < b ? -1 : 1)
  keys.forEach((k) => {
    if (options.filter && options.filter(k, from, copy) === false) return
    copy[k] = deepClone(from[k], options)
  })
  return copy
}
