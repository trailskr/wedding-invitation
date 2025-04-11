import type { Ref } from 'vue'

export type PopoverElement = Ref<HTMLElement | null | undefined>

const allPopovers = ref<PopoverElement[]>([])

export const usePopover = (child: PopoverElement) => {
  allPopovers.value.push(child)
  onBeforeUnmount(() => {
    removeElementFromArray(allPopovers.value, child)
  })
  return computed(() => {
    const index = allPopovers.value.indexOf(child)
    return allPopovers.value.slice(index + 1)
  })
}
