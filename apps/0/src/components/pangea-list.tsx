import type { UniqueIdentifier } from '@dnd-kit/core'
import type { DropResult } from '@hello-pangea/dnd'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@a/ui'
import { arrayMove } from '@dnd-kit/sortable'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { Fragment } from 'react'

import type { BaseItem, ListProps } from './sortable'

const List = <T,>({
    items,
    renderItem,
    setItems,
    ...props
  }: ComponentProps<'div'> & ListProps<BaseItem & T> & { renderItem: (item: T, index: number) => ReactNode }) => (
    <DragDropContext
      onDragEnd={({ destination, source }: DropResult) => {
        if (!destination) return
        if (destination.index === source.index) return
        setItems(arrayMove(items, source.index, destination.index))
      }}>
      <Droppable droppableId='list'>
        {({ droppableProps, innerRef, placeholder }) => (
          <div ref={innerRef} {...droppableProps} {...props}>
            {items.map((item, i) => (
              <Fragment key={item.id}>{renderItem(item, i)}</Fragment>
            ))}
            {placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ),
  Item = ({
    children,
    className,
    id,
    index,
    ...props
  }: ComponentProps<'div'> & { id: UniqueIdentifier; index: number }) => (
    <Draggable draggableId={id} index={index}>
      {({ draggableProps, dragHandleProps, innerRef }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          {...dragHandleProps}
          {...props}
          className={cn('cursor-grab select-none', className)}>
          {children}
        </div>
      )}
    </Draggable>
  )

export { Item, List }
