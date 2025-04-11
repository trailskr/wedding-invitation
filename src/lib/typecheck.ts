export const isNumber = (v: unknown): v is number => {
  return typeof v === 'number'
}
export const isString = (v: unknown): v is string => {
  return typeof v === 'string'
}
export const isBoolean = (v: unknown): v is boolean => {
  return typeof v === 'boolean'
}
export const isVoid = (v: unknown): v is null | undefined => {
  return v == null
}
// eslint-disable-next-line ts/no-unsafe-function-type
export const isFunction = <T extends Function>(v: unknown): v is T => {
  return typeof v === 'function'
}
export const isObject = <K extends PropertyKey = string, T = unknown>(v: unknown): v is Record<K, T> => {
  return Object.prototype.toString.call(v) === '[object Object]'
}
export const isObjectLike = <K extends PropertyKey = string, T = unknown>(v: unknown): v is Record<K, T> => {
  return typeof v === 'object' && v !== null
}
export const isArray = <T = unknown>(v: unknown): v is T[] => {
  return Array.isArray(v)
}
export const isPromise = <T = unknown>(v: unknown): v is Promise<T> => {
  return isObjectLike(v) && typeof v.then === 'function' && typeof v.catch === 'function' && typeof v.finally === 'function'
}
