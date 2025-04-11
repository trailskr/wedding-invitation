import type { UnknownRecord } from 'type-fest'

export type StringifyOptions = {
  /**
   * Indentation number of spaces
   */
  indent?: number
  /**
   * If true, objects and arrays items will be separated with space
   */
  spacing?: boolean
  /**
   * If true, objects keys delimiter (or key ending itself if not present) and value will be separated by space
   */
  keySpacing?: boolean
  /**
   * If true, objects and arrays will have space after beginning and before ending if not empty
   */
  boundarySpacing?: boolean
  /**
   * If true, objects and arrays will be opened and closed on the same line as first and last item respectively
   */
  compactBrackets?: boolean
  /**
   * The length at which an object's keys and array's items are split across multiple lines
   */
  breakLength?: number
  /**
   * Nesting depth to be indented, by default Infinity
   */
  indentDepth?: number
  /**
   * Symbols to wrap array data
   */
  arrayPair?: [string, string]
  /**
   * Symbols divide items in array
   */
  arrayDelimiter?: string
  /**
   * Symbols to wrap object data
   */
  objectPair?: [string, string]
  /**
   * Symbols divide keys in object
   */
  objectDelimiter?: string
  /**
   * Symbols to wrap object keys
   */
  objectKeyPair?: [string, string]
  /**
   * Symbol to divide object key and value
   */
  objectKeyValueDelimiter?: string
  /**
   * Symbols to wrap strings
   */
  stringPair?: [string, string]
  /**
   * Omit object key edging symbols if possible
   */
  omitObjectKeyPair?: boolean
  /**
   * Omit object value and key-value delimiter if value is strictly equals to true
   */
  omitObjectTrueValues?: boolean
  /**
   * Omit object key-value delimiter if value is string, array or object
   */
  omitObjectKeyValueDelimiter?: boolean
  /**
   * If object has function with that name, it will be used to stringify it.
   * Function should be of type CustomStringifyFn
   */
  customStringifyMethodName?: string
  /**
   * Custom regexp for identifiers, that can be without objectKeyValueDelimiter when omitObjectKeyPair is enabled
   */
  identifierOmitPairsTestRe?: RegExp
}

// Define type for custom stringify function result
export type CustomStringifyResult = {
  result: string
  indent: string
}

export type CustomStringifyFn = (indent: string, oneIndent: string) => string | CustomStringifyResult

const identifierRE = /^[a-z_]\w*$/i

const stringifyString = (val: string, stringEscapeRe: RegExp, stringPair: [string, string]): string => {
  return stringPair[0] + val
  // eslint-disable-next-line regexp/no-escape-backspace
    .replace(/[\\\t\n\r\b\f]/g, (a) => {
      switch (a) {
        case '\\': return '\\\\'
        case '\t': return '\\t'
        case '\n': return '\\n'
        case '\r': return '\\r'
        case '\b': return '\\b'
        case '\f': return '\\f'
      }
      return a
    })
    .replace(stringEscapeRe, '\\$&') + stringPair[1]
}

const stringifyArray = (
  val: unknown[],
  oArrayPair: [string, string],
  arrayPair: [string, string],
  arrayDelimiter: string,
  compactBrackets: boolean,
  breakLength: number,
  stringifyValue: (val: unknown, currentIndent: string) => string,
  oneIndent: string,
  currentIndent: string,
  indent: number,
): string => {
  if (val.length === 0) return oArrayPair[0] + oArrayPair[1]
  let start = arrayPair[0]
  let isBroken = false
  if (!compactBrackets && start.length > breakLength) {
    currentIndent += oneIndent
    start += '\n'
    isBroken = true
  }
  let middle = ''
  for (let i = 0, maxi = val.length, last = maxi - 1; i < maxi; i++) {
    const item = stringifyValue(val[i], currentIndent)
    if (i !== last) {
      middle += isBroken
        ? `${currentIndent}${item}${arrayDelimiter}\n`
        : `${item}${arrayDelimiter}`
    } else {
      if (isBroken) {
        middle += `${currentIndent}${item}\n`
        currentIndent = currentIndent.slice(0, -indent)
        middle += currentIndent
      } else {
        middle += item
      }
    }
  }
  return start + middle + arrayPair[1]
}

const stringifyObject = (
  val: UnknownRecord,
  oObjectPair: [string, string],
  objectPair: [string, string],
  objectDelimiter: string,
  objectKeyPair: [string, string],
  objectKeyValueDelimiter: string,
  keySpacing: string,
  omitObjectKeyPair: boolean,
  omitObjectKeyValueDelimiter: boolean,
  omitObjectTrueValues: boolean,
  breakLength: number,
  compactBrackets: boolean,
  customStringifyMethodName: string | undefined,
  stringifyValue: (val: unknown, currentIndent: string) => string,
  identRe: RegExp,
  oneIndent: string,
  currentIndent: string,
  indent: number,
// eslint-disable-next-line sonarjs/cognitive-complexity
): string => {
  if (
    customStringifyMethodName
    && customStringifyMethodName in val
    && isFunction(val[customStringifyMethodName])
  ) {
    const fn = val[customStringifyMethodName] as CustomStringifyFn
    const res = fn(currentIndent, oneIndent)
    if (isString(res)) return res
    return res.result
  }

  const keys = Object.keys(val)
  if (keys.length === 0) return oObjectPair[0] + oObjectPair[1]
  let start = objectPair[0]
  let isBroken = false
  if (!compactBrackets && start.length > breakLength) {
    currentIndent += oneIndent
    start += '\n'
    isBroken = true
  }
  let middle = ''
  for (let i = 0, maxi = keys.length, last = maxi - 1; i < maxi; i++) {
    const key = keys[i]
    let item: string
    const keyStr = omitObjectKeyPair && identRe.test(key)
      ? key
      : `${objectKeyPair[0]}${key}${objectKeyPair[1]}`

    const value = val[key]
    if (omitObjectTrueValues && value === true) {
      item = keyStr
    } else if (omitObjectKeyValueDelimiter
      && value !== null
      && (typeof value === 'string' || typeof value === 'object')) {
      item = keyStr + keySpacing + stringifyValue(value, currentIndent)
    } else {
      item = keyStr + objectKeyValueDelimiter + stringifyValue(value, currentIndent)
    }

    if (i !== last) {
      middle += isBroken
        ? `${currentIndent}${item}${objectDelimiter}\n`
        : `${item}${objectDelimiter}`
    } else {
      if (isBroken) {
        middle += `${currentIndent}${item}\n`
        currentIndent = currentIndent.slice(0, -indent)
        middle += currentIndent
      } else {
        middle += item
      }
    }
  }
  return start + middle + objectPair[1]
}

/** Makes custom json-like data stringify function */
export const makeStringifier = (
  opts: StringifyOptions = {},
  startingIndent?: string,
): ((val: unknown) => string) => {
  const {
    indent = 2,
    breakLength = Infinity,
    arrayPair: oArrayPair = ['[', ']'],
    arrayDelimiter: oArrayDelimiter = ',',
    objectPair: oObjectPair = ['{', '}'],
    objectDelimiter: oObjectDelimiter = ',',
    objectKeyPair = ['"', '"'],
    objectKeyValueDelimiter: oObjectKeyValueDelimiter = ':',
    omitObjectKeyPair = false,
    omitObjectKeyValueDelimiter = false,
    omitObjectTrueValues = false,
    stringPair = ['"', '"'],
    identifierOmitPairsTestRe,
    spacing = false,
    keySpacing: oKeySpacing,
    compactBrackets = false,
    boundarySpacing = false,
    customStringifyMethodName = 'stringify',
  } = opts
  const identRe = identifierOmitPairsTestRe || identifierRE

  const arrayDelimiter = spacing ? `${oArrayDelimiter} ` : oArrayDelimiter
  const objectDelimiter = spacing ? `${oObjectDelimiter} ` : oObjectDelimiter
  const keySpacing = oKeySpacing ? ' ' : ''
  const objectKeyValueDelimiter = oKeySpacing ? `${oObjectKeyValueDelimiter} ` : oObjectKeyValueDelimiter
  const arrayPair = boundarySpacing ? [`${oArrayPair[0]} `, ` ${oArrayPair[1]}`] as [string, string] : oArrayPair
  const objectPair = boundarySpacing ? [`${oObjectPair[0]} `, ` ${oObjectPair[1]}`] as [string, string] : oObjectPair
  const stringEscapeRe = new RegExp(stringPair[1], 'g')

  const oneIndent = ' '.repeat(indent)

  const stringifyValue = (val: unknown, currentIndent = startingIndent ?? ''): string => {
    if (val === null || isNumber(val) || isBoolean(val)) return String(val)
    if (isString(val)) return stringifyString(val, stringEscapeRe, stringPair)
    if (isArray(val)) return stringifyArray(val, oArrayPair, arrayPair, arrayDelimiter, compactBrackets, breakLength, stringifyValue, oneIndent, currentIndent, indent)
    if (isObject(val)) return stringifyObject(val, oObjectPair, objectPair, objectDelimiter, objectKeyPair, objectKeyValueDelimiter, keySpacing, omitObjectKeyPair, omitObjectKeyValueDelimiter, omitObjectTrueValues, breakLength, compactBrackets, customStringifyMethodName, stringifyValue, identRe, oneIndent, currentIndent, indent)
    return String(val) // Fallback for unhandled types
  }
  return stringifyValue
}
