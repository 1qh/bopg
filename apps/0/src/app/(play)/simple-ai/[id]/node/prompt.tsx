import type { NodeProps } from '@xyflow/react'

import { Textarea } from '@a/ui/textarea'
import { Position } from '@xyflow/react'
import { PenLine } from 'lucide-react'

import { BaseNode } from '~/components/node'

import type { PromptNode } from '../flowui/node-factory'
import type { NodeState } from '../flowui/types'

import { LabeledHandle } from '../flowui/labeled-handle'
import useFlow from '../flowui/use-flow'

const Prompt = ({ data: { text }, id, selected }: NodeProps<PromptNode & { state?: NodeState }>) => {
  const { deleteNode, updateNode } = useFlow(),
    onChange = (t: string) => updateNode(id, 'prompt', { text: t })
  return (
    <BaseNode Icon={PenLine} id={id} label='Prompt' onDelete={() => deleteNode(id)} selected={selected}>
      <Textarea
        className='nodrag nopan nowheel mb-1.5 max-h-56 max-w-72'
        onChange={e => onChange(e.target.value)}
        placeholder='Enter your text here...'
        value={text}
      />
      <LabeledHandle id='result' position={Position.Right} type='source' />
    </BaseNode>
  )
}

export default Prompt
