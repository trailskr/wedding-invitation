import type { MergeDeep, UnknownRecord } from 'type-fest'
import { isArray, isObjectLike } from './typecheck'

export type InnerDeepMergeFilterFn = (key: PropertyKey, from: unknown, to: unknown) => boolean

export type DeepMergeOptions = {
  /**
   * Optional filter function which will be executed for each key
   */
  filter?: InnerDeepMergeFilterFn
  /**
   * If true, arrays of the same level will be connected
   */
  concatArrays?: boolean
}

const deepMergeRecursive = <T extends unknown[] | UnknownRecord>(
  to: T,
  from: T,
  key: keyof T,
  options: DeepMergeOptions,
): void => {
  if (options.filter?.(key, from, to) === false) return

  const fromField = from[key]
  const toField = to[key]

  if (fromField === undefined) {
    if (!(key in to)) {
      to[key] = fromField
    }
    return
  }
  if (!isObjectLike(fromField)) {
    to[key] = fromField
    return
  }

  if (isArray(fromField)) {
    if (!isArray(toField)) {
      to[key] = [] as T[keyof T]
    }
    if (options.concatArrays) {
      to[key] = [...fromField, ...toField as unknown[]] as T[keyof T]
    } else {
      for (let i = 0; i < fromField.length; i++) {
        deepMergeRecursive(toField as unknown[], fromField, i, options)
      }
    }
    return
  }

  if (!to[key] || !isObjectLike(to[key])) {
    to[key] = Object.create(Object.getPrototypeOf(fromField))
  }
  Object.keys(fromField).forEach((k) => {
    deepMergeRecursive(to[key] as Record<PropertyKey, unknown>, fromField, k, options)
  })
}

/**
 * Deeply mixes all the object's own fields into another, keeping
 * upper-level data, if it already exists in the source object.
 * Copies undefined fields if there are none, but does not overwrite existing ones.
 */
export const deepMerge = <TTo, TFrom>(to: TTo, from: TFrom, options: DeepMergeOptions = {}): MergeDeep<TTo, TFrom> => {
  if (!isObjectLike(from)) {
    return to as MergeDeep<TTo, TFrom>
  }

  if (isArray(from) && isArray(to)) {
    let newTo = to as unknown[]
    if (options.concatArrays) {
      newTo = [...from, ...to]
    } else {
      from.forEach((_item, i) => {
        deepMergeRecursive(newTo, from, i, options)
      })
    }
    return newTo as MergeDeep<TTo, TFrom>
  }

  if (isObjectLike(from) && isObjectLike(to)) {
    const keys = Object.keys(from)
    keys.forEach((k) => {
      deepMergeRecursive(to as Record<string, unknown>, from, k, options)
    })
  }

  return to as MergeDeep<TTo, TFrom>
}
