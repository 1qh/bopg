'use client'

import type { EdgeProps } from '@xyflow/react'

import type { StatusEdgeType } from './status-edge'
import type { EdgeExecutionState } from './workflow-execution-engine'

import { StatusEdge } from './status-edge'

export type StatusEdgeControllerType = Omit<StatusEdgeType, 'data'> & {
  data: {
    executionState?: EdgeExecutionState
  }
  type: 'status'
}

export const StatusEdgeController = ({ data, ...props }: EdgeProps<StatusEdgeControllerType>) => (
  <StatusEdge {...props} data={{ error: Boolean(data.executionState?.error) }} />
)
