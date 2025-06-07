import type { Node, NodeProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { Textarea } from '@a/ui/textarea'
import { NodeResizer, Position } from '@xyflow/react'
import { PenLine, Trash } from 'lucide-react'

import { BaseNode } from './base-node'
import { LabeledHandle } from './labeled-handle'
import { NodeHeader, NodeHeaderAction, NodeHeaderActions, NodeHeaderIcon, NodeHeaderTitle } from './node-header'

export interface TextInputData {
  [key: string]: unknown
  config: { value: string }
  status: 'error' | 'idle' | 'processing' | 'success' | undefined
}

export type TextInputNodeType = Node<TextInputData, 'text-input'>

export interface TextInputProps extends NodeProps<TextInputNodeType> {
  onDeleteNode?: () => void
  onTextChange?: (value: string) => void
}

export const TextInputNode = ({ data, deletable, id, onDeleteNode, onTextChange, selected }: TextInputProps) => (
  <BaseNode
    className={cn('flex flex-col', {
      'border-orange-500': data.status === 'processing',
      'border-red-500': data.status === 'error'
    })}
    id={id}
    selected={selected}>
    <NodeResizer isVisible={selected} />
    <NodeHeader>
      <NodeHeaderIcon>
        <PenLine />
      </NodeHeaderIcon>
      <NodeHeaderTitle>Prompt</NodeHeaderTitle>
      <NodeHeaderActions>
        {deletable ? (
          <NodeHeaderAction label='Delete node' onClick={onDeleteNode} variant='ghost'>
            <Trash />
          </NodeHeaderAction>
        ) : null}
      </NodeHeaderActions>
    </NodeHeader>
    <Textarea
      className='nodrag nopan nowheel max-h-56'
      onChange={e => onTextChange?.(e.target.value)}
      placeholder='Enter your text here...'
      value={data.config.value || ''}
    />
    <LabeledHandle id='result' position={Position.Right} title='Result' type='source' />
  </BaseNode>
)
