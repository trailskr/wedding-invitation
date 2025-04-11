import { objectEntries } from '@vueuse/core'

export type Group<T, Key extends number | string = number | string> = {
  key: Key
  items: T[]
}

export const objectGroupBy = <T, Key extends number | string = number | string>(
  arr: T[],
  groupKeyGetter: (item: T) => Key,
): Record<Key, T[]> => {
  const groupsMap: Record<Key, T[]> = {} as Record<Key, T[]>
  arr.forEach((item) => {
    const key = groupKeyGetter(item)
    const group = groupsMap[key] ?? (groupsMap[key] = [])
    group.push(item)
  })
  return groupsMap
}

export const groupBy = <T, Key extends number | string = number | string>(
  arr: T[],
  groupKeyGetter: (item: T) => Key,
): Group<T, Key>[] => {
  const groupsMap = objectGroupBy(arr, groupKeyGetter)
  return objectEntries(groupsMap).map(([key, items]) => ({ key, items }))
}
