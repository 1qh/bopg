import type { NodeProps } from '@xyflow/react'

import { Position } from '@xyflow/react'
import { Eye } from 'lucide-react'
import { Streamdown } from 'streamdown'

import { BaseNode } from '~/components/node'

import type { ResponseNode } from '../flowui/node-factory'
import type { NodeState } from '../flowui/types'

import { LabeledHandle } from '../flowui/labeled-handle'
import useFlow from '../flowui/use-flow'

const Response = ({ data: { text }, id, selected }: NodeProps<ResponseNode & { state?: NodeState }>) => {
  const { deleteNode } = useFlow()
  return (
    <BaseNode Icon={Eye} label='Response' onDelete={() => deleteNode(id)} selected={selected}>
      {text ? (
        <Streamdown className='nodrag nopan nowheel flex-1 cursor-auto overflow-auto rounded-md p-2 select-text'>
          {text}
        </Streamdown>
      ) : (
        <p className='px-3 py-2 text-muted-foreground/60'>output will go here</p>
      )}
      <LabeledHandle id='text' position={Position.Left} type='target' />
    </BaseNode>
  )
}

export default Response
