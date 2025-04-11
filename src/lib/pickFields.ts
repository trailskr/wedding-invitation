export const pickFields = <T extends object, Keys extends keyof T>(obj: T, fields: Keys[]): Pick<T, Keys> => {
  const picked = {} as Pick<T, Keys>

  fields.forEach((field) => {
    picked[field] = obj[field]
  })

  return picked
}
