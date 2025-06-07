import type { Node, NodeProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Position, useUpdateNodeInternals } from '@xyflow/react'
import { Bot, Plus, Trash } from 'lucide-react'
import { useCallback } from 'react'

import type { Model } from './model-selector'

import { BaseNode } from './base-node'
import { EditableHandle, EditableHandleDialog } from './editable-handle'
import { LabeledHandle } from './labeled-handle'
import { ModelSelector } from './model-selector'
import { NodeHeader, NodeHeaderAction, NodeHeaderActions, NodeHeaderIcon, NodeHeaderTitle } from './node-header'
import { NodeHeaderStatus } from './node-header-status'

export interface GenerateTextData {
  config: {
    model: Model
  }
  dynamicHandles: {
    tools: {
      description?: string
      id: string
      name: string
    }[]
  }
  status: 'error' | 'idle' | 'processing' | 'success' | undefined
}

export type GenerateTextNodeType = Node<GenerateTextData & Record<string, unknown>, 'generate-text'>

interface GenerateTextNodeProps extends NodeProps<GenerateTextNodeType> {
  disableModelSelector?: boolean
  onCreateTool: (name: string, description?: string) => boolean
  onDeleteNode: () => void
  onModelChange: (model: Model) => void
  onRemoveTool: (handleId: string) => void
  onUpdateTool: (toolId: string, newName: string, newDescription?: string) => boolean
}

export const GenerateTextNode = ({
  data,
  deletable,
  disableModelSelector,
  id,
  onCreateTool,
  onDeleteNode,
  onModelChange,
  onRemoveTool,
  onUpdateTool,
  selected
}: GenerateTextNodeProps) => {
  const updateNodeInternals = useUpdateNodeInternals(),
    handleModelChange = useCallback((value: string) => onModelChange(value as Model), [onModelChange]),
    handleCreateTool = useCallback(
      (name: string, description?: string) => {
        const result = onCreateTool(name, description)
        if (result) updateNodeInternals(id)
        return result
      },
      [onCreateTool, id, updateNodeInternals]
    ),
    removeHandle = useCallback(
      (handleId: string) => {
        onRemoveTool(handleId)
        updateNodeInternals(id)
      },
      [onRemoveTool, id, updateNodeInternals]
    )

  return (
    <BaseNode
      className={cn({
        'border-orange-500': data.status === 'processing',
        'border-red-500': data.status === 'error'
      })}
      selected={selected}>
      <NodeHeader className='m-0'>
        <NodeHeaderIcon>
          <Bot />
        </NodeHeaderIcon>
        <NodeHeaderTitle>LLM</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderStatus status={data.status} />
          {deletable ? (
            <NodeHeaderAction label='Delete node' onClick={onDeleteNode} variant='ghost'>
              <Trash />
            </NodeHeaderAction>
          ) : null}
        </NodeHeaderActions>
      </NodeHeader>
      <div className='flex flex-col gap-4 p-4'>
        <ModelSelector
          disabled={disableModelSelector}
          disabledModels={['gpt-4o', 'gpt-4o-mini', 'deepseek-r1-distill-llama-70b']}
          onChange={handleModelChange}
          value={data.config.model}
        />
      </div>
      <div className='grid grid-cols-[2fr,1fr] gap-2 pt-2 text-sm'>
        <div className='flex min-w-0 flex-col gap-2'>
          <LabeledHandle id='system' position={Position.Left} title='System' type='target' />
          <LabeledHandle className='col-span-2' id='prompt' position={Position.Left} title='Prompt' type='target' />
        </div>
        <div className='justify-self-end'>
          <LabeledHandle id='result' position={Position.Right} title='Result' type='source' />
        </div>
      </div>
      <div className='mt-2 flex items-center justify-between rounded-lg bg-muted p-2 pl-4'>
        <span className='text-sm font-medium'>Tool outputs</span>
        <EditableHandleDialog onSave={handleCreateTool} showDescription variant='create'>
          <Button size='sm' variant='outline'>
            <Plus />
            Add
          </Button>
        </EditableHandleDialog>
      </div>
      {data.dynamicHandles.tools.map(tool => (
        <EditableHandle
          description={tool.description}
          handleId={tool.id}
          key={tool.id}
          name={tool.name}
          nodeId={id}
          onDelete={removeHandle}
          onUpdateTool={onUpdateTool}
          position={Position.Right}
          showDescription
          type='source'
          wrapperClassName='w-full'
        />
      ))}
    </BaseNode>
  )
}
