import type { Active, DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core'
import type { ComponentProps, MouseEvent, ReactNode } from 'react'

import { cn } from '@a/ui'
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createContext, Fragment, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useIsClient } from 'usehooks-ts'

import type { BaseItem, ListProps } from './sortable'

const IGNORE_TAGS = new Set(['BUTTON']),
  customHandleEvent = (element: HTMLElement | null) => {
    let cur = element
    while (cur) {
      if (IGNORE_TAGS.has(cur.tagName) || cur.dataset.noDnd) return false
      cur = cur.parentElement
    }
    return true
  }

MouseSensor.activators = [
  {
    eventName: 'onMouseDown',
    handler: ({ nativeEvent: event }: MouseEvent) => customHandleEvent(event.target as HTMLElement)
  }
]

const List = <T,>({
    items,
    renderItem,
    setItems
  }: ListProps<BaseItem & T> & {
    renderItem: (item: T, index: number) => ReactNode
  }) => {
    const [grab, setGrab] = useState<Active | null>(null),
      grabItem = items.find(i => i.id === grab?.id),
      isClient = useIsClient(),
      sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 2 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
      )
    return (
      <DndContext
        onDragCancel={() => setGrab(null)}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            const activeIndex = items.findIndex(({ id }) => id === active.id),
              overIndex = items.findIndex(({ id }) => id === over.id)
            setItems(arrayMove(items, activeIndex, overIndex))
          }
          setGrab(null)
        }}
        onDragStart={({ active }) => setGrab(active)}
        sensors={sensors}>
        <SortableContext items={items}>
          {items.map((item, index) => (
            <Fragment key={item.id}>{renderItem(item, index)}</Fragment>
          ))}
        </SortableContext>
        {isClient
          ? createPortal(<DragOverlay>{grabItem ? renderItem(grabItem, -1) : null}</DragOverlay>, document.body)
          : null}
      </DndContext>
    )
  },
  ItemContext = createContext<{
    attributes: object
    listeners: DraggableSyntheticListeners
    ref?: (node: HTMLElement) => void
  }>({ attributes: {}, listeners: undefined }),
  Item = ({ children, className, id, ...props }: ComponentProps<'div'> & { id: UniqueIdentifier }) => {
    const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
        id,
        transition: { duration: 369, easing: 'ease' }
      }),
      context = useMemo(
        () => ({ attributes, listeners, ref: setActivatorNodeRef }),
        [attributes, listeners, setActivatorNodeRef]
      )
    return (
      <ItemContext value={context}>
        <div
          {...attributes}
          {...listeners}
          {...props}
          className={cn('cursor-grab select-none', isDragging && 'opacity-0', className)}
          ref={setNodeRef}
          style={{
            transform: CSS.Translate.toString(transform),
            transition
          }}>
          {children}
        </div>
      </ItemContext>
    )
  }

export { Item, List }
