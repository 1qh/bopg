import type { HandleProps, Node } from '@xyflow/react'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Input } from '@a/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Textarea } from '@a/ui/textarea'
import { Handle, useNodeConnections, useOnSelectionChange } from '@xyflow/react'
import { Edit2, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface HandleEditorProps {
  children: ReactNode
  description?: string
  label?: string
  onCancel?: () => void
  onSave: (newLabel: string, newDescription?: string) => void
  showDescription?: boolean
  variant: 'create' | 'edit'
}

const EditableHandleDialog = ({
  children,
  description,
  label,
  onCancel,
  onSave,
  showDescription = true,
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
      onSave(trimmedLabel, localDescription?.trim())
      setIsOpen(false)
      if (variant === 'create') reset()
    },
    handleCancel = () => {
      setIsOpen(false)
      if (variant === 'create') reset()
      onCancel?.()
    }
  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='space-y-1 p-3 pt-2.5 text-sm'>
        <p>Label</p>
        <Input
          autoFocus
          className='h-8'
          id='label'
          onChange={e => setLocalLabel(e.target.value)}
          placeholder='Enter label'
          value={localLabel}
        />
        {showDescription ? (
          <>
            <p className='mt-2'>Description (optional)</p>
            <Textarea
              className='h-20'
              id='description'
              onChange={e => setLocalDescription(e.target.value)}
              placeholder='Enter description'
              value={localDescription}
            />
          </>
        ) : null}
        <div className='mt-3 flex justify-end gap-2'>
          <Button onClick={handleCancel} size='sm' variant='outline'>
            Cancel
          </Button>
          <Button onClick={handleSave} size='sm'>
            {variant === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type EditableHandleProps = HandleProps &
  HTMLAttributes<HTMLDivElement> & {
    description?: string
    handleId: string
    label: string
    nodeId: string
    onDelete: (handleId: string) => void
    onUpdateTool: (handleId: string, newName: string, newDescription?: string) => void
    showDescription?: boolean
  }

const EditableHandle = ({
  description,
  handleId,
  label,
  nodeId,
  onDelete,
  onUpdateTool,
  position,
  showDescription = true,
  ...props
}: EditableHandleProps) => {
  const connections = useNodeConnections({ handleId, handleType: props.type }),
    [isEditing, setIsEditing] = useState(label.length === 0),
    resetEditing = () => {
      if (label.length === 0) {
        onDelete(handleId)
        return
      }
      setIsEditing(false)
    },
    handleSelectionChange = ({ nodes }: { nodes: Node[] }) => {
      if (isEditing && !nodes.some(n => n.id === nodeId)) resetEditing()
    }
  useOnSelectionChange({ onChange: handleSelectionChange })
  const handleSave = (newLabel: string, newDescription?: string) => onUpdateTool(handleId, newLabel, newDescription)
  return (
    <>
      <Handle
        className={cn('size-3!', connections.length > 0 ? 'bg-green-400!' : 'border-muted-foreground! bg-background!')}
        data-no-dnd
        id={handleId}
        position={position}
        {...props}
      />
      <div className='grow -space-y-0.5'>
        <p>{label}</p>
        {showDescription && description ? (
          <p className='line-clamp-1 text-xs text-muted-foreground'>{description}</p>
        ) : null}
      </div>
      <EditableHandleDialog
        description={description}
        label={label}
        onCancel={resetEditing}
        onSave={handleSave}
        showDescription={showDescription}
        variant='edit'>
        <Edit2 className='size-0 min-w-0 cursor-pointer rounded-md stroke-1 px-1 text-muted-foreground transition-all duration-500 group-hover/handle:size-7 group-hover/handle:min-w-7 hover:scale-110 hover:bg-blue-100 active:scale-75 dark:hover:bg-blue-900' />
      </EditableHandleDialog>
      <Trash
        className='size-0 min-w-0 cursor-pointer rounded-md stroke-1 px-1 text-muted-foreground transition-all duration-500 group-hover/handle:size-7 group-hover/handle:min-w-7 hover:scale-110 hover:bg-destructive/20 hover:text-destructive active:scale-75'
        onClick={() => onDelete(handleId)}
      />
    </>
  )
}

export { EditableHandle, EditableHandleDialog }
