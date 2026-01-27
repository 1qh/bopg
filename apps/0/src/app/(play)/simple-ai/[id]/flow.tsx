'use client'
import type { ColorMode } from '@xyflow/react'
import type { DragEvent } from 'react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Background, BackgroundVariant, Controls, MiniMap, Panel, ReactFlow, useReactFlow } from '@xyflow/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { api } from '~/trpc/react'

import type { FlowEdge, FlowNode } from './flowui/types'

import CustomEdge from './flowui/edge'
import Errors from './flowui/errors'
import { NodesPanel } from './flowui/nodes-panel'
import useFlow from './flowui/use-flow'
import Llm from './node/llm'
import Prompt from './node/prompt'
import Response from './node/response'
import Template from './node/template'

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}
interface FlowProps {
  id: number
}
const Flow = ({ id }: FlowProps) => {
  const { simpleAi } = api(),
    { data: agent } = useSuspenseQuery(simpleAi.byId.queryOptions(id)),
    { createNode, edges, errors, init, nodes, onConnect, onEdgesChange, onNodesChange, saved, setSaved } = useFlow(),
    queryClient = useQueryClient(),
    { isPending, mutate } = useMutation(
      simpleAi.update.mutationOptions({
        onError: err => toast.error(err.data?.code === 'UNAUTHORIZED' ? 'Log in to update' : 'Failed to update'),
        onSuccess: async () => {
          await queryClient.invalidateQueries(simpleAi.pathFilter())
          setSaved()
          if (!agent?.content.template) toast.success('Agent updated')
        }
      })
    )

  useEffect(() => {
    if (agent?.content) init(agent.content.nodes as FlowNode[], agent.content.edges as FlowEdge[])
  }, [])

  const { screenToFlowPosition } = useReactFlow(),
    onDrop = (e: DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow') as FlowNode['type'],
        position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      createNode(type, position)
    },
    t = useTranslations()

  return (
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
      onConnect={onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
      proOptions={{ hideAttribution: true }}>
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap className='translate-4' position='bottom-right' />
      <Controls className='translate-y-4' orientation='horizontal' position='bottom-center' />
      <NodesPanel />
      <Panel className='flex items-center gap-2' position='top-right'>
        <Errors errors={errors} />
        <Button
          className={cn(
            'gap-0 rounded-full capitalize duration-700 active:scale-95',
            saved && 'pointer-events-none h-0 bg-transparent p-0 text-[0px] opacity-0'
          )}
          disabled={errors.length > 0 || isPending}
          onClick={() => mutate({ content: { edges, nodes }, id })}>
          <p
            className={cn(
              'size-0 animate-spin rounded-full border border-transparent transition-all duration-500',
              isPending ? 'mr-1.5 -ml-1.5 size-5 border-muted-foreground border-t-transparent' : '-mx-px'
            )}
          />
          {t('save')}
        </Button>
      </Panel>
    </ReactFlow>
  )
}
export default Flow
