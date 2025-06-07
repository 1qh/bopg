import type { Edge, EdgeProps } from '@xyflow/react'
import type { CSSProperties } from 'react'

import { BaseEdge as FlowBaseEdge, getBezierPath } from '@xyflow/react'

export type StatusEdgeType = Edge<{ error?: boolean }, 'status'> & {
  sourceHandle: string
  targetHandle: string
  type: 'status'
}

export const StatusEdge = ({
  data,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY
}: EdgeProps<StatusEdgeType>) => {
  const [edgePath] = getBezierPath({
      sourcePosition,
      sourceX,
      sourceY,
      targetPosition,
      targetX,
      targetY
    }),
    edgeStyle: CSSProperties = {
      stroke: data?.error ? '#ef4444' : selected ? '#3b82f6' : '#b1b1b7',
      strokeWidth: selected ? 3 : 2,
      transition: 'stroke 0.2s, stroke-width 0.2s'
    }

  return <FlowBaseEdge path={edgePath} style={edgeStyle} />
}
