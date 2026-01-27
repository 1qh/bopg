'use client'

import type { ColorMode, Connection, OnConnectEnd, ReactFlowJsonObject, XYPosition } from '@xyflow/react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@a/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Slider } from '@a/ui/slider'
import { Spinner } from '@a/ui/spinner'
import { useLayoutContext } from '@jalez/react-flow-automated-layout'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { addEdge, Panel, ReactFlow, useEdgesState, useNodesState, useReactFlow, useViewport } from '@xyflow/react'
import { Check, LayoutDashboard, Maximize } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import equal from 'react-fast-compare'
import { toast } from 'sonner'
import { ulid } from 'ulid'
import { useDebounceCallback } from 'usehooks-ts'

import { nodeIcons } from '~/constant'
import { api } from '~/trpc/react'

import base from './base'

const removeKeys = <T,>(obj: T, keysToRemove: string[]): T => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map((item: unknown) => removeKeys(item, keysToRemove)) as T
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj))
      if (!keysToRemove.includes(key)) result[key] = removeKeys(value, keysToRemove)
    return result as T
  }
  return obj
}

interface NewNode {
  position: XYPosition
  source: string
  sourceHandle?: string
}

const Flow = () => {
  const queryClient = useQueryClient(),
    { id } = useParams<{ id: string }>(),
    { flow } = api(),
    { data } = useSuspenseQuery(flow.byId.queryOptions(id, { enabled: typeof id === 'string' })),
    { isPending, mutate } = useMutation(
      flow.update.mutationOptions({
        onError: err => toast.error(err.data?.code === 'UNAUTHORIZED' ? 'Log in to update' : 'Failed to update'),
        onSuccess: async () => {
          await queryClient.invalidateQueries(flow.pathFilter())
        }
      })
    ),
    { zoom } = useViewport(),
    { fitView, screenToFlowPosition, toObject, zoomTo } = useReactFlow(),
    [lastSave, setLastSave] = useState<null | Omit<ReactFlowJsonObject, 'viewport'>>(null),
    save = useDebounceCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { viewport: _, ...content } = removeKeys(toObject(), ['animated', 'selected', 'dragging', 'measured', 'type'])
      if (lastSave && equal(lastSave, content)) return
      setLastSave(content)
      mutate({ ...content, id })
    }, 2000),
    [edges, setEdges, onEdgesChange] = useEdgesState(data?.edges ?? []),
    [nodes, setNodes, onNodesChange] = useNodesState(data?.nodes.map(n => ({ ...n, type: ' ' })) ?? []),
    [menu, setMenu] = useState<(NewNode & { screen: XYPosition }) | null>(null),
    onConnect = (params: Connection) => setEdges(eds => addEdge(params, eds)),
    addNode = ({ position, source, sourceHandle, t }: NewNode & { t: string }) => {
      const newId = ulid(),
        newNode = { data: { items: [], t }, id: newId, position, type: ' ' },
        newEdge = { id: newId, source, sourceHandle, target: newId }
      setNodes(ns => [...ns, newNode])
      setEdges(es => [...es, newEdge])
      setMenu(null)
    },
    onConnectEnd: OnConnectEnd = (e, connection) => {
      if (connection.isValid || !connection.fromNode) return
      const ev = 'changedTouches' in e ? e.changedTouches[0] : e
      if (!ev) return
      const { clientX: x, clientY: y } = ev,
        position = screenToFlowPosition({ x, y }),
        { fromHandle, fromNode } = connection,
        { data: node, id: source } = fromNode
      if (['end-call', 'new-call'].includes(source)) addNode({ position, source, t: 'task' })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      else if (node?.t && node.t === 'orchestrator') addNode({ position, source, t: 'agent' })
      else setMenu({ position, screen: { x, y }, source, sourceHandle: fromHandle?.id ?? undefined })
    },
    nodeFromMenu = (t: string) => {
      if (!menu) return
      addNode({ ...menu, t })
    }

  useEffect(() => save(), [nodes, edges])
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      save.flush()
      if (isPending) {
        e.preventDefault()
        return ''
      }
    }
    // eslint-disable-next-line @typescript-eslint/strict-void-return
    globalThis.addEventListener('beforeunload', beforeUnload)
    return () => {
      // eslint-disable-next-line @typescript-eslint/strict-void-return
      globalThis.removeEventListener('beforeunload', beforeUnload)
      save.flush()
    }
  }, [save])

  const { resolvedTheme } = useTheme(),
    { nodeSpacing, setAutoLayout, setDirection, setLayerSpacing, setNodeSpacing } = useLayoutContext()
  setDirection('RIGHT')
  setAutoLayout(false)
  return (
    <>
      <ReactFlow
        colorMode={resolvedTheme as ColorMode}
        defaultEdgeOptions={{
          animated: true,
          style: {
            stroke: resolvedTheme === 'dark' ? '#fff' : '#000',
            strokeWidth: 0.7
          }
        }}
        edges={edges}
        edgesFocusable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0 }}
        nodes={nodes}
        nodesFocusable={false}
        nodeTypes={{ ' ': base }}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        proOptions={{ hideAttribution: true }}
        selectNodesOnDrag={false}
        style={{ backgroundImage: resolvedTheme === 'dark' ? 'none' : 'url(/noise.svg)' }}>
        <Panel className='-bottom-3! flex items-center gap-1' position='bottom-center'>
          <Button
            className='group'
            onClick={() => {
              fitView({ duration: 1000 })
            }}
            size='sm'
            variant='ghost'>
            <span className='hidden group-hover:block'>Fit</span>
            <Maximize className='hidden group-hover:block' />
            <span className='block w-9.5 text-lg font-light tracking-tighter group-hover:hidden'>
              {(zoom * 100).toFixed(0)}%
            </span>
          </Button>
          <Slider
            className='w-64 cursor-pointer'
            max={2}
            min={0.5}
            onValueChange={([v]) => {
              if (v) zoomTo(v)
            }}
            step={0.01}
            value={[zoom]}
          />
          <Popover>
            <PopoverTrigger asChild>
              <LayoutDashboard className='size-10 cursor-pointer rounded-lg stroke-1 p-1.5 transition-all duration-200 hover:bg-muted hover:stroke-2' />
            </PopoverTrigger>
            <PopoverContent className='pt-2 text-center text-sm tracking-tight text-muted-foreground'>
              Auto Arrange
              <Slider
                className='mt-2.5 cursor-pointer'
                max={200}
                min={20}
                onValueChange={([v]) => {
                  if (!v) return
                  setAutoLayout(true)
                  setNodeSpacing(v)
                  setLayerSpacing(v)
                }}
                step={1}
                value={[nodeSpacing]}
              />
            </PopoverContent>
          </Popover>
        </Panel>
        <p
          className={cn(
            'absolute top-1.5 left-2 flex items-center gap-1 font-light capitalize [&>svg]:stroke-1',
            !isPending && 'animate-[fadeOut_2s_forwards]'
          )}>
          {isPending ? <Spinner /> : <Check />}
          {isPending ? 'saving' : 'saved'}
        </p>
      </ReactFlow>
      {menu ? (
        <DropdownMenu onOpenChange={() => setMenu(null)} open>
          <DropdownMenuTrigger
            style={{
              height: 1,
              left: menu.screen.x,
              pointerEvents: 'none',
              position: 'fixed',
              top: menu.screen.y,
              width: 1
            }}
          />
          <DropdownMenuContent>
            {['agent', 'orchestrator', 'task'].map(t => {
              const Icon = t in nodeIcons ? nodeIcons[t as keyof typeof nodeIcons] : 'p'
              return (
                <DropdownMenuItem className='capitalize' key={t} onClick={() => nodeFromMenu(t)}>
                  <Icon />
                  {t}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  )
}

export default Flow
