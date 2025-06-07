'use client'

import type { ColorMode } from '@xyflow/react'

import { Button } from '@a/ui/button'
import { BackgroundVariant, Controls, MiniMap } from '@xyflow/react'
import { Background, ReactFlow } from '@xyflow/react'
import { useTheme } from 'next-themes'
import { titleCase } from 'text-case'

import type { FlowData } from '~/agent-examples'

import ThemeToggle from '~/components/theme-toggle'
import { GenerateTextNodeController } from '~/flowui/generate-text-node-controller'
import { PromptCrafterNodeController } from '~/flowui/prompt-crafter-node-controller'
import { StatusEdgeController } from '~/flowui/status-edge-controller'
import { TextInputNodeController } from '~/flowui/text-input-node-controller'
import { VisualizeTextNodeController } from '~/flowui/visualize-text-node-controller'

const FlowPreview = ({ edges, id, nodes }: FlowData) => (
  <ReactFlow
    colorMode={useTheme().theme as ColorMode}
    edges={edges}
    edgeTypes={{ status: StatusEdgeController }}
    fitView
    nodes={nodes}
    nodeTypes={{
      'generate-text': GenerateTextNodeController,
      'prompt-crafter': PromptCrafterNodeController,
      'text-input': TextInputNodeController,
      'visualize-text': VisualizeTextNodeController
    }}
    proOptions={{ hideAttribution: true }}>
    <Background variant={BackgroundVariant.Dots} />
    <MiniMap className='-translate-3' position='top-left' />
    <Controls className='-translate-x-1 -translate-y-8' />
    <ThemeToggle className='absolute bottom-1 left-1 z-[4]' />
    <p className='absolute top-1 left-1/2 -translate-x-1/2 text-2xl font-light'>{titleCase(id)}</p>
    <Button className='absolute top-2 right-2'>Clone</Button>
  </ReactFlow>
)
export default FlowPreview
