import type { ZuiDropSection } from '@/components/DragAndDrop'
import type { MaybeRef, MaybeRefOrGetter } from 'vue'

export type AfterDropData<DragModel> = {
  src: DragModel
  trg: DragModel
  srcIndex: number
  trgIndex: number
  srcItems: DragModel[]
  trgItems: DragModel[]
  isDroppedAfter: boolean
  isDroppedBefore: boolean
}

export type DropEffectHandler<DragModel> = (data: AfterDropData<DragModel>) => void

export type CanDrop<DragModel> = (srcModel: DragModel, trgModel: DragModel, dropSection: ZuiDropSection) => boolean
export type OnDrop<DragModel> = (srcModel: DragModel, trgModel: DragModel, dropSection: ZuiDropSection) => void
export type UseDragAndDropHandlersResult<DragModel> = {
  canDrop: CanDrop<DragModel>
  onDrop: OnDrop<DragModel>
}

export type UseDragAndDropHandlersOptions<DragModel> = {
  isEnabled?: MaybeRef<boolean | undefined>
  keyGetter?: (model: DragModel) => string | number | undefined
  /** Handler to react on drag-and-drop */
  dropEffect?: DropEffectHandler<DragModel>
  /** Handler to react after dropEffect */
  afterDrop?: DropEffectHandler<DragModel>
}

export const useDragAndDropHandlers = <DragModel>(
  itemsOrItemsGetter: MaybeRefOrGetter<DragModel[]>,
  options: UseDragAndDropHandlersOptions<DragModel> = {},
): UseDragAndDropHandlersResult<DragModel> => {
  const {
    isEnabled: maybeRefIsEnabled = true,
    keyGetter = (model) => {
      return isObject(model) && 'id' in model && (isString(model.id) || isNumber(model.id)) ? model.id : undefined
    },
    dropEffect = ({ src, srcIndex, trgIndex, srcItems, trgItems, isDroppedAfter }) => {
      if (srcItems === trgItems) {
        srcItems.splice(srcIndex, 1)
        if (srcIndex < trgIndex) trgIndex -= 1
        if (isDroppedAfter) trgIndex += 1
        trgItems.splice(trgIndex, 0, src)
      } else {
        srcItems.splice(srcIndex, 1)
        trgItems.splice(trgIndex, 0, src)
      }
    },
    afterDrop,
  } = options

  const canDrop = (srcModel: DragModel, trgModel: DragModel, dropSection: ZuiDropSection) => {
    const isEnabled = unref(maybeRefIsEnabled)
    if (!isEnabled) return false
    const [srcId, trgId] = [keyGetter(srcModel), keyGetter(trgModel)]
    if (srcId === trgId) return false
    const [srcItems, trgItems] = [toValue(itemsOrItemsGetter), toValue(itemsOrItemsGetter)]
    const srcIndex = srcItems.findIndex((item) => keyGetter(item) === srcId)
    const trgIndex = trgItems.findIndex((item) => keyGetter(item) === trgId)
    return srcItems !== trgItems || srcIndex !== trgIndex + (dropSection.isAtBottom ? 1 : -1)
  }

  const onDrop = (srcModel: DragModel, trgModel: DragModel, dropSection: ZuiDropSection) => {
    const isEnabled = unref(maybeRefIsEnabled)
    if (!isEnabled) return false
    const [srcId, trgId] = [keyGetter(srcModel), keyGetter(trgModel)]
    const [srcItems, trgItems] = [toValue(itemsOrItemsGetter), toValue(itemsOrItemsGetter)]
    const srcIndex = srcItems.findIndex((item) => keyGetter(item) === srcId)
    const trgIndex = Math.max(
      0,
      trgItems.findIndex((item) => keyGetter(item) === trgId),
    )
    const src = srcItems[srcIndex]
    const trg = trgItems[trgIndex]
    const isDroppedAfter = dropSection.isAtBottom === true
    const data = {
      src,
      trg,
      srcIndex,
      trgIndex,
      srcItems,
      trgItems,
      isDroppedAfter,
      isDroppedBefore: !isDroppedAfter,
    }
    if (dropEffect) dropEffect(data)
    if (afterDrop) afterDrop(data)
    return undefined
  }

  return { canDrop, onDrop }
}
