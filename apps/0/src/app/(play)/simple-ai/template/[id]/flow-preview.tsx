'use client'

import type { ColorMode } from '@xyflow/react'

import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react'
import { startCase } from 'es-toolkit/string'
import { CopyPlus } from 'lucide-react'
import { useTheme } from 'next-themes'

import type { FlowData } from './flow-templates'

import CustomEdge from '../../[id]/flowui/edge'
import Llm from '../../[id]/node/llm'
import Prompt from '../../[id]/node/prompt'
import Response from '../../[id]/node/response'
import Template from '../../[id]/node/template'
import Create from '../../common/create'

const FlowPreview = ({ edges, nodes, template }: FlowData) => (
  <ReactFlow
    colorMode={useTheme().theme as ColorMode}
    edges={edges}
    edgeTypes={{ status: CustomEdge }}
    fitView
    nodes={nodes}
    nodeTypes={{
      LLM: Llm,
      prompt: Prompt,
      response: Response,
      template: Template
    }}
    proOptions={{ hideAttribution: true }}>
    <Background variant={BackgroundVariant.Dots} />
    <MiniMap className='translate-4' position='bottom-right' />
    <Controls className='translate-y-4' orientation='horizontal' position='bottom-center' />
    <p className='absolute top-1 left-1/2 -translate-x-1/2 text-2xl font-light'>{startCase(template)}</p>
    <Create buttonText='clone' className='z-4' clone={{ edges, nodes, template }} Icon={CopyPlus} />
  </ReactFlow>
)
export default FlowPreview
