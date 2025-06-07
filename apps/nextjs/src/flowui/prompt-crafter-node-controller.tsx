/* eslint-disable max-statements */
'use client'

import type { NodeProps } from '@xyflow/react'

import { useCallback } from 'react'
import { toast } from 'sonner'

import type { PromptCrafterData, PromptCrafterNodeType } from './prompt-crafter-node'
import type { NodeExecutionState } from './workflow-execution-engine'

import { PromptCrafterNode } from './prompt-crafter-node'
import { useWorkflow } from './use-workflow'

export type PromptCrafterNodeControllerType = Omit<PromptCrafterNodeType, 'data'> & {
  data: Pick<PromptCrafterData, 'config' | 'dynamicHandles'> & { executionState?: NodeExecutionState }
  type: 'prompt-crafter'
}

export const PromptCrafterNodeController = ({ data, id, ...props }: NodeProps<PromptCrafterNodeControllerType>) => {
  const updateNode = useWorkflow(state => state.updateNode),
    addDynamicHandle = useWorkflow(state => state.addDynamicHandle),
    removeDynamicHandle = useWorkflow(state => state.removeDynamicHandle),
    deleteNode = useWorkflow(state => state.deleteNode),
    handlePromptTextChange = useCallback(
      (value: string) => updateNode(id, 'prompt-crafter', { config: { template: value } }),
      [id, updateNode]
    ),
    handleCreateInput = useCallback(
      (name: string) => {
        if (!name) {
          toast.error('Input name cannot be empty')
          return false
        }
        if (data.dynamicHandles['template-tags'].find(t => t.name === name)) {
          toast.error('Input name already exists')
          return false
        }
        addDynamicHandle(id, 'prompt-crafter', 'template-tags', { name })
        return true
      },
      [id, data.dynamicHandles, addDynamicHandle]
    ),
    handleRemoveInput = useCallback(
      (handleId: string) => removeDynamicHandle(id, 'prompt-crafter', 'template-tags', handleId),
      [id, removeDynamicHandle]
    ),
    handleUpdateInputName = useCallback(
      (handleId: string, newLabel: string): boolean => {
        const tags = data.dynamicHandles['template-tags']
        if (!newLabel) {
          toast.error('Input name cannot be empty')
          return false
        }
        if (tags.find(t => t.name === newLabel && t.id !== handleId)) {
          toast.error('Input name already exists')
          return false
        }
        const oldInput = tags.find(t => t.id === handleId)
        if (!oldInput) return false
        updateNode(id, 'prompt-crafter', {
          config: {
            ...data.config,
            template: (data.config.template || '').replace(new RegExp(`{{${oldInput.name}}}`, 'gu'), `{{${newLabel}}}`)
          },
          dynamicHandles: {
            ...data.dynamicHandles,
            'template-tags': tags.map(t => (t.id === handleId ? { ...t, name: newLabel } : t))
          }
        })
        return true
      },
      [id, data.dynamicHandles, data.config, updateNode]
    ),
    handleDeleteNode = useCallback(() => deleteNode(id), [id, deleteNode])

  return (
    <PromptCrafterNode
      data={{ ...data, status: data.executionState?.status }}
      id={id}
      {...props}
      onCreateInput={handleCreateInput}
      onDeleteNode={handleDeleteNode}
      onPromptTextChange={handlePromptTextChange}
      onRemoveInput={handleRemoveInput}
      onUpdateInputName={handleUpdateInputName}
    />
  )
}
