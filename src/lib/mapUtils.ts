export const getOrDefault = <Key, Val>(map: Map<Key, Val>, key: Key, getDefault: () => Val, addDefaultToMap = true) => {
  if (map.has(key)) {
    return map.get(key)!
  } else {
    const defaultValue = getDefault()
    if (addDefaultToMap) {
      map.set(key, defaultValue)
    }
    return defaultValue
  }
}
