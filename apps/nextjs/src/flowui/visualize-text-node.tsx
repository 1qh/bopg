import type { Node, NodeProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { NodeResizer, Position } from '@xyflow/react'
import { Eye, Trash } from 'lucide-react'

import { BaseNode } from './base-node'
import { LabeledHandle } from './labeled-handle'
import { MarkdownContent } from './markdown-content'
import { NodeHeader, NodeHeaderAction, NodeHeaderActions, NodeHeaderIcon, NodeHeaderTitle } from './node-header'

export type VisualizeTextNodeType = Node<
  {
    input: string | undefined
    status: 'error' | 'idle' | 'processing' | 'success' | undefined
  },
  'visualize-text'
>

interface VisualizeTextProps extends NodeProps<VisualizeTextNodeType> {
  onDeleteNode?: () => void
}

export const VisualizeTextNode = ({ data, id, onDeleteNode, selected }: VisualizeTextProps) => (
  <BaseNode
    className={cn({
      'border-orange-500': data.status === 'processing',
      'border-red-500': data.status === 'error'
    })}
    selected={selected}>
    <NodeResizer isVisible={selected} />
    <NodeHeader className='m-0'>
      <NodeHeaderIcon>
        <Eye />
      </NodeHeaderIcon>
      <NodeHeaderTitle>Output</NodeHeaderTitle>
      <NodeHeaderActions>
        <NodeHeaderAction label='Delete node' onClick={onDeleteNode} variant='ghost'>
          <Trash />
        </NodeHeaderAction>
      </NodeHeaderActions>
    </NodeHeader>
    {data.input ? (
      <div className='nodrag nopan nowheel flex-1 cursor-auto overflow-auto rounded-md p-2 select-text'>
        <MarkdownContent content={data.input} id={id} />
      </div>
    ) : (
      <p className='p-3 text-muted-foreground/60'>Output will go here</p>
    )}
    <LabeledHandle id='input' position={Position.Left} title='Input' type='target' />
  </BaseNode>
)
