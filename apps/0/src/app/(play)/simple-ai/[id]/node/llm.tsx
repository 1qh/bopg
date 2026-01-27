import type { NodeProps } from '@xyflow/react'

import { Button } from '@a/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@a/ui/select'
import { Position, useUpdateNodeInternals } from '@xyflow/react'
import { Bot, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Item, List } from '~/components/dnd-list'
import { BaseNode } from '~/components/node'

import type { LlmNode, Model } from '../flowui/node-factory'
import type { NodeState } from '../flowui/types'

import { EditableHandle, EditableHandleDialog } from '../flowui/editable-handle'
import { LabeledHandle } from '../flowui/labeled-handle'
import { MODELS } from '../flowui/node-factory'
import useFlow from '../flowui/use-flow'

const Llm = ({ data, id, selected }: NodeProps<LlmNode & { state?: NodeState }>) => {
  const { addHandle, deleteHandle, deleteNode, updateNode } = useFlow(),
    refresh = useUpdateNodeInternals(),
    handleModelChange = (model: Model) => updateNode(id, 'LLM', { model }),
    handleCreateTool = (name: string, description?: string) => {
      if (!name) {
        toast.error('Tool name cannot be empty')
        return
      }
      if (data.tools.some(t => t.name === name)) {
        toast.error('Tool name already exists')
        return
      }
      addHandle(id, 'LLM', 'tools', { description, name })
      refresh(id)
    },
    handleRemoveTool = (handleId: string) => {
      deleteHandle(id, 'LLM', 'tools', handleId)
      refresh(id)
    },
    handleUpdateTool = (toolId: string, newName: string, newDescription?: string) => {
      const { tools } = data
      if (!newName) {
        toast.error('Tool name cannot be empty')
        return
      }
      if (tools.some(t => t.name === newName && t.id !== toolId)) {
        toast.error('Tool name already exists')
        return
      }
      updateNode(id, 'LLM', {
        tools: tools.map((t): LlmNode['data']['tools'][number] =>
          t.id === toolId ? { ...t, description: newDescription, name: newName } : t
        )
      })
      refresh(id)
    },
    setTools = (tools: LlmNode['data']['tools']) => {
      updateNode(id, 'LLM', { tools })
      refresh(id)
    }

  return (
    <BaseNode Icon={Bot} label='LLM' onDelete={() => deleteNode(id)} selected={selected}>
      <Select onValueChange={handleModelChange} value={data.model}>
        <SelectTrigger className='nodrag mb-2 w-full'>
          <SelectValue placeholder='Select model' />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map(model => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <LabeledHandle id='system' position={Position.Left} type='target' />
      <LabeledHandle id='prompt' position={Position.Left} type='target' />
      <LabeledHandle id='result' position={Position.Right} type='source' />
      <div className='mt-2 flex items-center justify-between gap-3 rounded-lg bg-muted p-1 pl-3 text-sm font-medium'>
        Tool outputs
        <EditableHandleDialog onSave={handleCreateTool} variant='create'>
          <Button size='sm' variant='outline'>
            <Plus />
            Add
          </Button>
        </EditableHandleDialog>
      </div>
      <List
        items={data.tools}
        renderItem={tool => (
          <Item className='nodrag group/handle relative -mx-1.5 my-1 flex min-h-7 items-center pr-2 pl-3' id={tool.id}>
            <EditableHandle
              description={tool.description}
              handleId={tool.id}
              label={tool.name}
              nodeId={id}
              onDelete={handleRemoveTool}
              onUpdateTool={handleUpdateTool}
              position={Position.Right}
              type='source'
            />
          </Item>
        )}
        setItems={setTools}
      />
    </BaseNode>
  )
}
export default Llm
