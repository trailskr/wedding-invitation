export type EqualityFilterFn = (key: string | number, a: unknown, b: unknown) => boolean

export type IsEqualOptions = {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: EqualityFilterFn
}

export const isEqual = (a: unknown, b: unknown, options?: IsEqualOptions): boolean => {
  if (isArray(b)) {
    // eslint-disable-next-line ts/no-use-before-define
    return handleArray(a, b, options)
  }
  if (isObjectLike(b)) {
    // eslint-disable-next-line ts/no-use-before-define
    return handleObject(a, b, options)
  }
  return a === b
}

const handleArrayWithFilter = (a: unknown[], b: unknown[], filter: EqualityFilterFn, options: IsEqualOptions): boolean => {
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (!filter(i, a, b)) continue
    if (!isEqual(a[i], b[i], options)) return false
  }
  return true
}

const handleArrayWithoutFilter = (a: unknown[], b: unknown[], options?: IsEqualOptions): boolean => {
  if (a.length !== b.length) return false
  const len = b.length
  for (let i = 0; i < len; i++) {
    if (!isEqual(a[i], b[i], options)) return false
  }
  return true
}

const handleArray = (a: unknown, b: unknown[], options?: IsEqualOptions): boolean => {
  const filter = options?.filter
  if (!isArray(a)) return false
  if (filter) {
    return handleArrayWithFilter(a, b, filter, options)
  }
  return handleArrayWithoutFilter(a, b, options)
}

const handleObjectWithFilter = (a: Record<string, unknown>, b: Record<string, unknown>, filter: EqualityFilterFn, options: IsEqualOptions): boolean => {
  const checkedKeys = new Set<string>()
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  for (const key of keysB) {
    checkedKeys.add(key)
    if (!filter(key, a, b)) continue
    if (!isEqual(a[key], b[key], options)) return false
  }
  for (const key of keysA) {
    if (checkedKeys.has(key)) continue
    if (!filter(key, a, b)) continue
    if (!isEqual(a[key], b[key], options)) return false
  }
  return true
}

const handleObjectWithoutFilter = (a: Record<string, unknown>, b: Record<string, unknown>, options?: IsEqualOptions): boolean => {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysB) {
    if (!isEqual(a[key], b[key], options)) return false
  }
  return true
}

const handleObject = (a: unknown, b: Record<string, unknown>, options?: IsEqualOptions): boolean => {
  if (!a || !isObjectLike(a)) return false
  const filter = options?.filter
  if (filter) {
    return handleObjectWithFilter(a, b, filter, options)
  }
  return handleObjectWithoutFilter(a, b, options)
}
