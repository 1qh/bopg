'use client'

import type { NodeProps } from '@xyflow/react'

import { useCallback } from 'react'

import type { TextInputNodeType } from './text-input-node'
import type { NodeExecutionState } from './workflow-execution-engine'

import { TextInputNode } from './text-input-node'
import { useWorkflow } from './use-workflow'

export type TextInputNodeControllerType = Omit<TextInputNodeType, 'data'> & {
  data: Omit<TextInputNodeType['data'], 'status'> & { executionState?: NodeExecutionState }
  type: 'text-input'
}

export const TextInputNodeController = ({ data, id, ...props }: NodeProps<TextInputNodeControllerType>) => {
  const updateNode = useWorkflow(state => state.updateNode),
    deleteNode = useWorkflow(state => state.deleteNode),
    handleTextChange = useCallback(
      (value: string) => updateNode(id, 'text-input', { config: { value } }),
      [id, updateNode]
    ),
    handleDeleteNode = useCallback(() => deleteNode(id), [id, deleteNode])

  return (
    <TextInputNode
      data={{
        config: data.config as { value: string },
        status: data.executionState?.status
      }}
      id={id}
      {...props}
      onDeleteNode={handleDeleteNode}
      onTextChange={handleTextChange}
    />
  )
}
