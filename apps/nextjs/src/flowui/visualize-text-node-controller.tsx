'use client'

import type { NodeProps } from '@xyflow/react'

import { useCallback } from 'react'

import type { VisualizeTextNodeType } from './visualize-text-node'
import type { NodeExecutionState } from './workflow-execution-engine'

import { useWorkflow } from './use-workflow'
import { VisualizeTextNode } from './visualize-text-node'

export type VisualizeTextNodeControllerType = Omit<VisualizeTextNodeType, 'data'> & {
  data: {
    executionState?: NodeExecutionState
  }
  type: 'visualize-text'
}

export const VisualizeTextNodeController = ({ data, id, ...props }: NodeProps<VisualizeTextNodeControllerType>) => {
  const deleteNode = useWorkflow(state => state.deleteNode),
    handleDeleteNode = useCallback(() => deleteNode(id), [id, deleteNode])

  return (
    <VisualizeTextNode
      data={{
        input: data.executionState?.targets?.input,
        status: data.executionState?.status
      }}
      id={id}
      onDeleteNode={handleDeleteNode}
      {...props}
    />
  )
}
