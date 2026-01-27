import type { LucideIcon } from 'lucide-react'
import type { DragEvent } from 'react'

import { Button } from '@a/ui/button'
import { Panel } from '@xyflow/react'
import { Bot, Eye, PencilRuler, PenLine } from 'lucide-react'

import type { FlowNode } from './types'

const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  },
  buttons: { icon: LucideIcon; type: FlowNode['type'] }[] = [
    {
      icon: Bot,
      type: 'LLM'
    },
    {
      icon: PencilRuler,
      type: 'template'
    },
    {
      icon: PenLine,
      type: 'prompt'
    },
    {
      icon: Eye,
      type: 'response'
    }
  ]

export const NodesPanel = () => (
  <Panel className='flex gap-2' position='top-center'>
    {buttons.map(nodeType => (
      <Button
        className='cursor-grab capitalize'
        draggable
        key={nodeType.type}
        onDragStart={e => onDragStart(e, nodeType.type)}
        size='sm'
        variant='outline'>
        <nodeType.icon />
        {nodeType.type}
      </Button>
    ))}
  </Panel>
)
