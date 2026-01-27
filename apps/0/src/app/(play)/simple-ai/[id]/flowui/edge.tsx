import type { EdgeProps } from '@xyflow/react'

import { BaseEdge, getBezierPath } from '@xyflow/react'

import type { FlowEdge } from './types'

const CustomEdge = ({ data, selected, ...props }: EdgeProps<FlowEdge>) => (
  <BaseEdge
    path={getBezierPath(props)[0]}
    style={{
      stroke: data?.error ? '#ef4444' : selected ? '#3b82f6' : '#b1b1b7',
      strokeWidth: selected ? 4 : 2,
      transition: 'stroke 0.5s, stroke-width 0.5s'
    }}
  />
)

export default CustomEdge
