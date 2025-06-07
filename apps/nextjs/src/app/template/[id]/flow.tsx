'use client'
import type { ColorMode } from '@xyflow/react'
import type { DragEvent } from 'react'

import { Button } from '@a/ui/button'
import { BackgroundVariant, Controls, MiniMap } from '@xyflow/react'
import { Background, Panel, ReactFlow, useReactFlow } from '@xyflow/react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

import type { FlowData } from '~/agent-examples'
import type { FlowNode } from '~/flowui/workflow'

import ThemeToggle from '~/components/theme-toggle'
import { ErrorIndicator } from '~/flowui/error-indicator'
import { GenerateTextNodeController } from '~/flowui/generate-text-node-controller'
import { PromptCrafterNodeController } from '~/flowui/prompt-crafter-node-controller'
import { StatusEdgeController } from '~/flowui/status-edge-controller'
import { TextInputNodeController } from '~/flowui/text-input-node-controller'
import { useWorkflow } from '~/flowui/use-workflow'
import { VisualizeTextNodeController } from '~/flowui/visualize-text-node-controller'

import { NodesPanel } from '../../agent/nodes-panel'

const Flow = ({ edges, nodes }: FlowData) => {
  const store = useWorkflow(
    s => ({
      createNode: s.createNode,
      edges: s.edges,
      initializeWorkflow: s.initializeWorkflow,
      nodes: s.nodes,
      onConnect: s.onConnect,
      onEdgesChange: s.onEdgesChange,
      onNodesChange: s.onNodesChange,
      startExecution: s.startExecution,
      workflowExecutionState: s.workflowExecutionState
    }),
    shallow
  )
  useEffect(() => store.initializeWorkflow(nodes, edges), [])

  const { screenToFlowPosition } = useReactFlow(),
    onDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    },
    onDrop = (e: DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow') as FlowNode['type']
      if (!type) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      store.createNode(type, position)
    },
    onStartExecution = async () => {
      const result = await store.startExecution()
      if (result.status === 'error') console.error(result.error)
    }

  return (
    <ReactFlow
      colorMode={useTheme().theme as ColorMode}
      edges={store.edges}
      edgeTypes={{ status: StatusEdgeController }}
      fitView
      nodes={store.nodes}
      nodeTypes={{
        'generate-text': GenerateTextNodeController,
        'prompt-crafter': PromptCrafterNodeController,
        'text-input': TextInputNodeController,
        'visualize-text': VisualizeTextNodeController
      }}
      onConnect={store.onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onEdgesChange={store.onEdgesChange}
      onNodesChange={store.onNodesChange}
      proOptions={{ hideAttribution: true }}>
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap className='-translate-3' position='top-left' />
      <Controls className='-translate-x-1 -translate-y-8' />
      <ThemeToggle className='absolute bottom-1 left-1 z-[4]' />
      <NodesPanel />
      <Panel className='flex items-center gap-2' position='top-right'>
        <ErrorIndicator errors={store.workflowExecutionState.errors} />
        <Button
          disabled={
            store.workflowExecutionState.errors.length > 0 ||
            store.workflowExecutionState.isRunning ||
            store.workflowExecutionState.timesRun > 1
          }
          onClick={onStartExecution}
          title={store.workflowExecutionState.timesRun > 1 ? 'Disabled for now' : 'Run the workflow'}>
          {store.workflowExecutionState.isRunning ? 'Running...' : 'Run Flow'}
        </Button>
      </Panel>
    </ReactFlow>
  )
}
export default Flow
