import type React from 'react'

import { Button } from '@a/ui/button'
import { Panel } from '@xyflow/react'
import { Bot, Eye, PencilRuler, PenLine } from 'lucide-react'

const buttons = [
  {
    icon: Bot,
    label: 'LLM',
    type: 'generate-text'
  },
  {
    icon: PencilRuler,
    label: 'Template',
    type: 'prompt-crafter'
  },
  {
    icon: PenLine,
    label: 'Prompt',
    type: 'text-input'
  },
  {
    icon: Eye,
    label: 'Output',
    type: 'visualize-text'
  }
]

export const NodesPanel = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  return (
    <Panel className='flex gap-2' position='top-center'>
      {buttons.map(nodeType => (
        <Button
          className='cursor-grab'
          draggable
          key={nodeType.type}
          onDragStart={e => onDragStart(e, nodeType.type)}
          variant='outline'>
          <nodeType.icon />
          {nodeType.label}
        </Button>
      ))}
    </Panel>
  )
}
