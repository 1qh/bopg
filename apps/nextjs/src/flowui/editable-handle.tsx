'use client'

import type { HandleProps, Node } from '@xyflow/react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Textarea } from '@a/ui/textarea'
import { Position, useOnSelectionChange } from '@xyflow/react'
import { Edit2, Trash } from 'lucide-react'
import React, { useState } from 'react'
import { useCallback } from 'react'
import { toast } from 'sonner'

import { BaseHandle } from './base-handle'

interface HandleEditorProps {
  align?: 'end' | 'start'
  children: React.ReactNode
  description?: string
  label?: string
  onCancel?: () => void
  onSave: (newLabel: string, newDescription?: string) => boolean
  showDescription?: boolean
  variant: 'create' | 'edit'
}

const EditableHandleDialog = ({
  align = 'start',
  children,
  description,
  label,
  onCancel,
  onSave,
  showDescription = false,
  variant
}: HandleEditorProps) => {
  const [isOpen, setIsOpen] = useState(false),
    [localLabel, setLocalLabel] = useState(label ?? ''),
    [localDescription, setLocalDescription] = useState(description),
    reset = () => {
      setLocalLabel('')
      setLocalDescription('')
    },
    handleSave = () => {
      const trimmedLabel = localLabel.trim()
      if (trimmedLabel.includes(' ')) {
        toast.error('Label cannot contain spaces')
        return
      }
      const success = onSave(trimmedLabel, localDescription?.trim())
      if (success) {
        setIsOpen(false)
        if (variant === 'create') reset()
      }
    },
    handleCancel = () => {
      setIsOpen(false)
      if (variant === 'create') reset()

      onCancel?.()
    }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className='w-80 p-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium' htmlFor='label'>
              Label
            </label>
            <Input
              autoFocus
              className='h-8'
              id='label'
              onChange={e => setLocalLabel(e.target.value)}
              placeholder='Enter label'
              value={localLabel}
            />
          </div>
          {showDescription ? (
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium' htmlFor='description'>
                Description (optional)
              </label>
              <Textarea
                className='h-20 resize-none'
                id='description'
                onChange={e => setLocalDescription(e.target.value)}
                placeholder='Enter description'
                value={localDescription}
              />
            </div>
          ) : null}
          <div className='flex justify-end gap-2'>
            <Button onClick={handleCancel} size='sm' variant='outline'>
              Cancel
            </Button>
            <Button onClick={handleSave} size='sm'>
              {variant === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

EditableHandleDialog.displayName = 'EditableHandleDialog'

type EditableHandleProps = HandleProps &
  React.HTMLAttributes<HTMLDivElement> & {
    description?: string
    handleClassName?: string
    handleId: string
    labelClassName?: string
    name: string
    nodeId: string
    onDelete: (handleId: string) => void
    onUpdateTool: (handleId: string, newName: string, newDescription?: string) => boolean
    showDescription?: boolean
    wrapperClassName?: string
  }

const EditableHandle = React.forwardRef<HTMLDivElement, EditableHandleProps>(
  (
    {
      description,
      handleClassName,
      handleId,
      labelClassName,
      name: label,
      nodeId,
      onDelete,
      onUpdateTool,
      position,
      showDescription = false,
      wrapperClassName,
      ...handleProps
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(label.length === 0),
      resetEditing = () => {
        if (label.length === 0) {
          onDelete(handleId)
          return
        }
        setIsEditing(false)
      },
      handleSelectionChange = useCallback(
        ({ nodes }: { nodes: Node[] }) => {
          if (isEditing && !nodes.some(n => n.id === nodeId)) resetEditing()
        },
        [isEditing, nodeId]
      )

    useOnSelectionChange({ onChange: handleSelectionChange })

    const handleSave = (newLabel: string, newDescription?: string) => onUpdateTool(handleId, newLabel, newDescription)

    return (
      <div className={cn('group relative mt-2', wrapperClassName)} ref={ref} title={label}>
        <BaseHandle className={handleClassName} id={handleId} position={position} {...handleProps} />
        <div
          className={cn('nodrag flex items-center gap-3 px-4', {
            'justify-end': position === Position.Right,
            'justify-start': position === Position.Left
          })}>
          <div className='flex min-w-0 flex-col'>
            <span className={cn('truncate whitespace-nowrap text-foreground', labelClassName)}>{label}</span>
            {showDescription && description ? (
              <p className='line-clamp-1 text-sm text-muted-foreground'>{description}</p>
            ) : null}
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <EditableHandleDialog
              align={position === Position.Left ? 'start' : 'end'}
              description={description}
              label={label}
              onCancel={resetEditing}
              onSave={handleSave}
              showDescription={showDescription}
              variant='edit'>
              <Button className='size-4 [&_svg]:size-3.5' size='icon' variant='ghost'>
                <Edit2 />
              </Button>
            </EditableHandleDialog>
            <Button className='size-4 [&_svg]:size-3.5' onClick={() => onDelete(handleId)} size='icon' variant='ghost'>
              <Trash />
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

EditableHandle.displayName = 'EditableHandle'

export { EditableHandle, EditableHandleDialog }
