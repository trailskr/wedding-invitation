export const removeIndexFromArray = <T>(arr: T[], index: number): number => {
  if (index !== -1) arr.splice(index, 1)
  return index
}

export const removeElementFromArray = <T>(arr: T[], element: T): number => {
  return removeIndexFromArray(arr, arr.indexOf(element))
}

type FindIndexPredicate<T> = (value: T, index: number, obj: T[]) => unknown
export const removeFromArray = <T>(arr: T[], predicate: FindIndexPredicate<T>): number => {
  return removeIndexFromArray(arr, arr.findIndex(predicate))
}
