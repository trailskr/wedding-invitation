export const escapeRegExp = (str: string) => {
  return str.replace(/[-[\]{}()*+?.\\^$|]/g, '\\$&')
}

let lastQuery: string | undefined
let lastQueryRe: RegExp | undefined

const getMemoizedQueryRe = (query: string, queryLower: string): RegExp => {
  if (lastQuery === query) {
    return lastQueryRe!
  }
  const queryRe = new RegExp(
    queryLower
      .split('')
      .map((s) => escapeRegExp(s))
      .join('.?')
      .replace(/\s/g, '.* .*?'),
  )
  lastQuery = query
  lastQueryRe = queryRe
  return queryRe
}

export enum TextSearchResult {
  NotFound,
  Elastic,
  PartI,
  Part,
  BeginningI,
  Beginning,
  ExactI,
  Exact,
}

/**
 * Full-text string search
 * @param str - search string
 * @param query - query string
 * @param [elasticSearch] - whether to use an elastic search for sequence of characters
 * @returns the priority index is returned
 * The search priority is as follows:
 *   - exact match of the found string TextSearchResult.Exact (7)
 *   - exact match case-insensitive TextSearchResult.ExactI (6)
 *   - match of the beginning of the string case-sensitive TextSearchResult.Beginning (5)
 *   - match of the beginning of the string case-insensitive TextSearchResult.BeginningI (4)
 *   - found part of the string case-sensitive TextSearchResult.Part (3)
 *   - found part of the string case-insensitive TextSearchResult.PartI (2)
 *   - found a sequence of characters (elastic search) TextSearchResult.Elastic (1)
 *   - not found TextSearchResult.NotFound (0)
 */
export const fullTextSearch = (str: string, query: string, elasticSearch = true): number => {
  if (str === query) return TextSearchResult.Exact
  const queryLower = query.toLocaleLowerCase()
  const strLower = str.toLocaleLowerCase()
  if (strLower === queryLower) {
    return TextSearchResult.ExactI
  }
  const indexQueryInStr = str.indexOf(query)
  if (indexQueryInStr !== -1) {
    return indexQueryInStr === 0
      ? TextSearchResult.Beginning
      : TextSearchResult.Part
  }
  const indexQueryInStrLower = strLower.indexOf(queryLower)
  if (indexQueryInStrLower !== -1) {
    return indexQueryInStrLower === 0
      ? TextSearchResult.BeginningI
      : TextSearchResult.PartI
  }
  if (elasticSearch) {
    const queryRe = getMemoizedQueryRe(query, queryLower)
    if (queryRe.test(strLower)) {
      return TextSearchResult.Elastic
    }
  }
  return TextSearchResult.NotFound
}

export type SearchStructure = {
  [key: string]: SearchStructure | true
}

type CurrentSearchStructure = SearchStructure | boolean | undefined

export const getFullTextDeepSearchLevelRatio = (level: number) => {
  return 0.125 ** level
}

const handleArray = (
  data: unknown[],
  query: string,
  queryLower: string,
  queryRe: RegExp | undefined,
  level: number,
  maxLevels: number,
  currentStructure: CurrentSearchStructure,
) => {
  let result = TextSearchResult.NotFound
  const len = data.length
  for (let i = 0; i < len; i++) {
    // eslint-disable-next-line ts/no-use-before-define
    const itemResult = fullTextDeepSearchRecursive(data[i], query, queryLower, queryRe, level + 1, maxLevels, currentStructure)
    result = Math.max(result, itemResult)
  }
  return result
}

const handleObject = (
  data: Record<PropertyKey, unknown>,
  query: string,
  queryLower: string,
  queryRe: RegExp | undefined,
  level: number,
  maxLevels: number,
  currentStructure: CurrentSearchStructure,
) => {
  let result = TextSearchResult.NotFound
  const allKeys = Object.keys(data)
  const keys = isObjectLike(currentStructure) ? allKeys.filter((key) => key in currentStructure) : allKeys
  const len = keys.length
  for (let i = 0; i < len; i++) {
    const key = keys[i]

    let childStructure: CurrentSearchStructure
    if (currentStructure != null) {
      childStructure = isObject(currentStructure)
        ? currentStructure[key] ?? false
        : false
    }

    // eslint-disable-next-line ts/no-use-before-define
    const localResult = fullTextDeepSearchRecursive(data[key], query, queryLower, queryRe, level + 1, maxLevels, childStructure)

    result = Math.max(result, localResult)
  }
  return result
}

const handleString = (
  data: string,
  query: string,
  queryLower: string,
  queryRe: RegExp | undefined,
): number => {
  if (data === query) return TextSearchResult.Exact
  const dataLower = data.toLocaleLowerCase()
  if (dataLower === queryLower) {
    return TextSearchResult.ExactI
  }
  const indexQueryInData = data.indexOf(query)
  if (indexQueryInData !== -1) {
    return indexQueryInData === 0
      ? TextSearchResult.Beginning
      : TextSearchResult.Part
  }
  const indexQueryInDataLower = dataLower.indexOf(queryLower)
  if (indexQueryInDataLower !== -1) {
    return indexQueryInDataLower === 0
      ? TextSearchResult.BeginningI
      : TextSearchResult.PartI
  }
  if (queryRe && queryRe.test(dataLower)) {
    return TextSearchResult.Elastic
  }
  return TextSearchResult.NotFound
}

const fullTextDeepSearchRecursive = (
  data: unknown,
  query: string,
  queryLower: string,
  queryRe: RegExp | undefined,
  level: number,
  maxLevels: number,
  currentStructure: CurrentSearchStructure,
): number => {
  if (level > maxLevels || currentStructure === false) return TextSearchResult.NotFound
  if (isArray(data)) {
    return handleArray(data, query, queryLower, queryRe, level, maxLevels, currentStructure)
  }
  if (isObjectLike(data)) {
    return handleObject(data, query, queryLower, queryRe, level, maxLevels, currentStructure)
  }
  if (isNumber(data)) {
    data = data.toString()
  }
  if (isString(data)) {
    return handleString(data, query, queryLower, queryRe) * getFullTextDeepSearchLevelRatio(level)
  }

  return TextSearchResult.NotFound
}

export type FullTextDeepSearchParams = {
  elasticSearch?: boolean
  maxLevels?: number
  structure?: SearchStructure
}

/**
 * Full-text deep object search
 * @param data - object to search
 * @param query - search string
 * @param [params] - search parameters
 * @param [params.elasticSearch] - whether to use an elastic search for sequence of characters
 * @param [params.maxLevels] - the maximum nesting level for the search, iterating through arrays increases the result by 1, but does not increase the level.
 *   The first level of data object or array item or primitive data is 0
 * If the search structure is not specified or is not declared in the arguments, the search will occur in all fields
 * @param [params.structure] - structure for search
 * @returns the priority index is returned
 *   the search priority is as follows:
 *     - level match (result / (10 ** level))
 *       - exact match of the found string (7)
 *       - exact match case-insensitive (6)
 *       - match of the beginning of the string case-sensitive (5)
 *       - match of the beginning of the string case-insensitive (4)
 *       - found part of the string case-sensitive (3)
 *       - found part of the string case-insensitive (2)
 *       - found a sequence of characters (elastic search) (1)
 *     - match at a deeper level (result / (10 ** level))
 */
export const fullTextDeepSearch = (data: unknown, query: string, params: FullTextDeepSearchParams = {}): number => {
  const { elasticSearch = false, maxLevels = Infinity, structure } = params
  const queryLower = query.toLocaleLowerCase()
  const queryRe = elasticSearch ? getMemoizedQueryRe(query, queryLower) : undefined
  const firstLevel = isObjectLike(data) ? -1 : 0

  return fullTextDeepSearchRecursive(data, query, queryLower, queryRe, firstLevel, maxLevels, structure)
}
