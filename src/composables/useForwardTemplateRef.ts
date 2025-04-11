import type { MaybeElement, UnRefElementReturn } from '@vueuse/core'

export const useForwardTemplateRef = (onElementSet?: (el: UnRefElementReturn | undefined) => void) => {
  const element = ref<UnRefElementReturn>()

  const refFn = (el: MaybeElement) => {
    element.value = el ? unrefElement(el) : undefined
    onElementSet?.(element.value)
  }

  return { ref: element, refFn }
}
