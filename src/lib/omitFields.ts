export const omitFields = <T extends object, Keys extends keyof T>(obj: T, fields: Keys[]): Omit<T, Keys> => {
  const omitted = { ...obj }

  fields.forEach((field) => {
    if (!(field in omitted)) return
    delete omitted[field]
  })

  return omitted as Omit<T, Keys>
}
