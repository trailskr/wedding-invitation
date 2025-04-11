import type { ConditionalKeys } from 'type-fest'

export const compareFnByNumber = <T>(getter: (item: T) => number) => {
  return (a: T, b: T): number => getter(a) - getter(b)
}

export const compareFnByString = <T>(getter: (item: T) => string) => {
  return (a: T, b: T): number => getter(a).localeCompare(getter(b))
}

export const compareFnByNumberKey = <T, K extends ConditionalKeys<T, number>>(key: K) => {
  return (a: T, b: T): number => (a[key] as number) - (b[key] as number)
}

export const compareFnByStringKey = <T, K extends ConditionalKeys<T, string>>(key: K) => {
  return (a: T, b: T): number => (a[key] as string).localeCompare(b[key] as string)
}
