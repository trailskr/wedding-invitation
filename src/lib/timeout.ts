export const timeout = (offset: number) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, offset)
  })
}
