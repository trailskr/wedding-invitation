export const formatSize = (fileSize: string | number) => {
  const size = typeof fileSize === 'string' ? Number.parseInt(fileSize, 10) : fileSize
  if (size < 1024) {
    return `${size} bytes`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export const downloadFile = (url: string, name: string) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = name

  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    URL.revokeObjectURL(link.href)

    link.parentNode?.removeChild(link)
  }, 0)
}
