/* eslint-disable complexity */
import { cn } from '@a/ui'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@a/ui/context-menu'
import { Drawer, DrawerContent, DrawerTrigger } from '@a/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { Handle, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'
import { startCase } from 'es-toolkit/string'
import { Copy, GripVertical, Pencil, Plus, Split, Trash, Wrench } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ulid } from 'ulid'

import type { NodeType } from '~/constant'

import { Item as DragItem, List as DragList } from '~/components/dnd-list'
import Tutip from '~/components/tutip'
import { nodeIcons, startNodes } from '~/constant'

import { Agent, AgentDetail } from './form/agent'
import PathForm from './form/path'
import TaskForm from './form/task'
import Hand from './source-hand'

interface BaseProps {
  data: {
    items: Item[]
    t: string
  }
  id: string
}

interface Item {
  id: string
  name: string
  t: string
}

const Base = ({ data: { items, t }, id }: BaseProps) => {
  const { addNodes, deleteElements, getNode, setNodes } = useReactFlow(),
    refresh = useUpdateNodeInternals(),
    [open, setOpen] = useState(false),
    [activeItem, setActiveItem] = useState<null | string>(null)
  if (startNodes.has(id as NodeType)) {
    const Icon = nodeIcons[id as NodeType]
    return (
      <div
        className={cn(
          'group flex w-48 items-center gap-3 rounded-3xl border border-transparent bg-background p-3.5 text-xl font-medium tracking-tight text-foreground/70 transition-all duration-300 hover:scale-[103%] hover:border-border hover:text-foreground hover:drop-shadow-2xl active:scale-90'
        )}>
        <Hand className='translate-x-0' />
        <Icon
          className={cn(
            'size-11 rounded-xl p-3',
            id === 'new-turn'
              ? 'bg-emerald-500/20'
              : id === 'new-call'
                ? 'bg-amber-500/20'
                : id === 'end-call'
                  ? 'bg-red-500/20'
                  : ''
          )}
        />
        {startCase(id)}
      </div>
    )
  }
  const Icon = t in nodeIcons ? nodeIcons[t as keyof typeof nodeIcons] : 'p',
    deleteNode = () => {
      deleteElements({ nodes: [{ id }] })
    },
    duplicate = () => {
      const node = getNode(id)
      if (!node) return
      const position = {
        x: node.position.x,
        y: node.position.y + 50
      }
      addNodes({ ...node, dragging: false, id: ulid(), position, selected: false })
    },
    addItem = (ty: string) => {
      const newItem = { id: ulid(), name: '', t: ty }
      setNodes(ns =>
        ns.map(n => {
          if (n.id === id) return { ...n, data: { ...n.data, items: [...(n.data.items as unknown[]), newItem] } }
          return n
        })
      )
    },
    setItems = (newItems: Item[]) => {
      setNodes(ns =>
        ns.map(n => {
          if (n.id === id) return { ...n, data: { ...n.data, items: newItems } }
          return n
        })
      )
      refresh(id)
    },
    nodePreview = (
      <div
        className={cn(
          'group w-56 rounded-3xl border border-transparent bg-background p-4 text-foreground/70 transition-all duration-300 hover:scale-[103%] hover:border-border hover:text-foreground hover:drop-shadow-2xl',
          activeItem && 'bg-muted-foreground'
        )}>
        <Handle className='border-none! bg-transparent!' position={Position.Left} type='target' />
        <div
          className={cn(
            'relative flex items-center gap-3 text-xl font-medium tracking-tight capitalize',
            items.length && 'mb-3.5'
          )}>
          <Icon
            className={cn(
              'size-11 rounded-xl p-3',
              t === 'orchestrator'
                ? 'bg-indigo-500/20'
                : t === 'agent'
                  ? 'bg-cyan-500/20'
                  : t === 'task'
                    ? 'bg-lime-500/20'
                    : ''
            )}
          />
          <span className='mt-0.5'>{t}</span>
          {t === 'orchestrator' ? <Hand /> : null}
        </div>
        {items.map(item => {
          const ItemIcon = item.t in nodeIcons ? nodeIcons[item.t as keyof typeof nodeIcons] : 'p'
          return (
            <div
              className={cn(
                'relative mt-2.5 flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-sm font-semibold text-muted-foreground transition-all duration-300',
                activeItem &&
                  (activeItem === item.id
                    ? 'scale-125 text-foreground ring-3 ring-ring'
                    : 'bg-muted-foreground text-foreground/60')
              )}
              key={item.id}>
              <ItemIcon className='size-4' />
              {item.t}
              <p className='grow' />
              <span className={cn('text-xs font-light', !item.name.length && 'font-mono')}>
                {item.name.length ? item.name : item.id.slice(-3)}
              </span>
              <Hand id={item.id} />
            </div>
          )
        })}
      </div>
    )
  return (
    <Drawer direction='right' onOpenChange={setOpen} open={open}>
      <ContextMenu>
        <ContextMenuTrigger>
          <DrawerTrigger asChild className={cn(open && 'opacity-40', activeItem && 'opacity-0')}>
            {nodePreview}
          </DrawerTrigger>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger className='gap-2'>
              <Plus />
              New
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => addItem('path')}>
                <Split />
                Path
              </ContextMenuItem>
              {t === 'task' ? (
                <ContextMenuSub>
                  <ContextMenuSubTrigger className='gap-2'>
                    <Wrench />
                    Tool
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>talk</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
              ) : null}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={duplicate}>
            <Copy />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem onClick={deleteNode} variant='destructive'>
            <Trash />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <DrawerContent className='right-3! my-3 min-w-xl overflow-hidden rounded-xl'>
        {open && typeof document !== 'undefined'
          ? createPortal(
              <div className='pointer-events-none fixed inset-0 z-60 flex w-[calc(100%-576px)] scale-200 items-center justify-center'>
                {nodePreview}
              </div>,
              document.body
            )
          : null}
        <div className='mb-4 flex items-center gap-2 border-b border-dashed p-2 pl-4'>
          <p className='text-xl font-semibold capitalize'>{t}</p>
          {t === 'agent' ? (
            <Popover>
              <PopoverTrigger>
                <Tutip side='right' tooltip='Edit'>
                  <Pencil className='size-8 rounded-lg stroke-1 p-1.5 transition-all duration-200 hover:bg-muted hover:stroke-2' />
                </Tutip>
              </PopoverTrigger>
              <PopoverContent className='min-w-lg'>
                <Agent id={id} />
              </PopoverContent>
            </Popover>
          ) : null}
          <p className='grow' />
          <Tutip side='left' tooltip='Delete'>
            <Trash
              className='size-8 rounded-lg stroke-1 p-1.5 transition-all duration-200 hover:bg-destructive/10 hover:stroke-2 hover:text-destructive'
              onClick={deleteNode}
            />
          </Tutip>
        </div>
        {items.length ? (
          <>
            {items.length > 1 ? (
              <p className='-mt-1 mb-1 text-center text-sm text-muted-foreground'>
                {items.length} {t} children (drag to reorder)
              </p>
            ) : null}
            <DragList
              items={items}
              renderItem={item => {
                const ItemIcon = item.t in nodeIcons ? nodeIcons[item.t as keyof typeof nodeIcons] : 'p'
                return (
                  <Drawer
                    direction='right'
                    onOpenChange={() => setActiveItem(activeItem === item.id ? null : item.id)}
                    open={activeItem === item.id}>
                    <DrawerTrigger asChild>
                      <DragItem
                        className='mx-4 mt-1 mb-2 flex items-center gap-2 rounded-lg bg-muted p-2 pl-3'
                        id={item.id}>
                        <ItemIcon className='size-4' />
                        {item.t}
                        <span className={cn('ml-auto text-xs font-light', !item.name.length && 'font-mono')}>
                          {item.name.length ? item.name : item.id.slice(-3)}
                        </span>
                        <GripVertical className='text-muted-foreground' />
                      </DragItem>
                    </DrawerTrigger>
                    <DrawerContent className='right-5! my-5 min-w-140 overflow-hidden rounded-lg'>
                      <div className='mb-4 flex items-center gap-2 border-b border-dashed p-2 pl-4'>
                        <p className='text-xl font-semibold capitalize'>{item.t}</p>
                        <p className='grow' />
                        <Tutip side='left' tooltip='Delete'>
                          <Trash
                            className='size-8 rounded-lg stroke-1 p-1.5 transition-all duration-200 hover:bg-destructive/10 hover:stroke-2 hover:text-destructive'
                            onClick={() => {
                              setItems(items.filter(i => i.id !== item.id))
                              setActiveItem(null)
                            }}
                          />
                        </Tutip>
                      </div>
                      {item.t === 'path' ? <PathForm nodeId={id} pathId={item.id} /> : null}
                    </DrawerContent>
                  </Drawer>
                )
              }}
              setItems={setItems}
            />
            <p className='mt-2 mb-5 border-t border-dashed' />
          </>
        ) : null}
        {t === 'task' ? <TaskForm id={id} /> : t === 'agent' ? <AgentDetail id={id} /> : null}
      </DrawerContent>
    </Drawer>
  )
}

export default Base

export type { Item }
