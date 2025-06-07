'use client'

import type { EditorView } from '@codemirror/view'
import type { Node } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'

import { cn } from '@a/ui'
import { Button } from '@a/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@a/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { StreamLanguage } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import CodeMirror from '@uiw/react-codemirror'
import { Position, useUpdateNodeInternals } from '@xyflow/react'
import { BetweenVerticalEnd, PencilRuler, Plus, Trash } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { BaseNode } from './base-node'
import { EditableHandle, EditableHandleDialog } from './editable-handle'
import { LabeledHandle } from './labeled-handle'
import { NodeHeader, NodeHeaderAction, NodeHeaderActions, NodeHeaderIcon, NodeHeaderTitle } from './node-header'
import { NodeHeaderStatus } from './node-header-status'

export interface PromptCrafterData extends Record<string, unknown> {
  config: { template: string }
  dynamicHandles: {
    'template-tags': {
      id: string
      name: string
    }[]
  }
  status: 'error' | 'idle' | 'processing' | 'success' | undefined
}

export type PromptCrafterNodeType = Node<PromptCrafterData, 'prompt-crafter'>

interface PromptCrafterProps extends NodeProps<PromptCrafterNodeType> {
  onCreateInput: (name: string) => boolean
  onDeleteNode: () => void
  onPromptTextChange: (value: string) => void
  onRemoveInput: (handleId: string) => void
  onUpdateInputName: (handleId: string, newLabel: string) => boolean
}

// Custom theme that matches your app's design
const promptTheme = createTheme({
    settings: {
      background: 'transparent',
      caret: 'black',
      foreground: 'hsl(var(--foreground))',
      lineHighlight: 'transparent',
      selection: '#88888855'
    },
    styles: [
      { color: '#10c43d', tag: t.variableName },
      { color: 'hsl(var(--foreground))', tag: t.string },
      { color: '#DC2626', tag: t.invalid }
    ],
    theme: 'dark'
  }),
  // Create a function to generate the language with the current inputs
  createPromptLanguage = (validInputs: string[] = []) =>
    StreamLanguage.define({
      token: stream => {
        // eslint-disable-next-line require-unicode-regexp
        if (stream.match(/{{[^}]*}}/)) {
          const match = stream.current(),
            inputName = match.slice(2, -2)
          if (validInputs.includes(inputName)) return 'variableName'
          return 'invalid'
        }
        stream.next()
        return null
      }
    })

export const PromptCrafterNode = ({
  data,
  deletable,
  id,
  onCreateInput,
  onDeleteNode,
  onPromptTextChange,
  onRemoveInput,
  onUpdateInputName,
  selected
}: PromptCrafterProps) => {
  const updateNodeInternals = useUpdateNodeInternals(),
    [isPopoverOpen, setIsPopoverOpen] = useState(false),
    editorViewRef = useRef<EditorView>(null),
    handleCreateInput = useCallback(
      (name: string) => {
        const result = onCreateInput(name)
        if (result) updateNodeInternals(id)

        return result
      },
      [onCreateInput, id, updateNodeInternals]
    ),
    handleRemoveInput = useCallback(
      (handleId: string) => {
        onRemoveInput(handleId)
        updateNodeInternals(id)
      },
      [onRemoveInput, id, updateNodeInternals]
    ),
    handleUpdateInputName = useCallback(
      (handleId: string, newLabel: string) => {
        const result = onUpdateInputName(handleId, newLabel)
        if (result) updateNodeInternals(id)

        return result
      },
      [onUpdateInputName, id, updateNodeInternals]
    ),
    insertInputAtCursor = useCallback((inputName: string) => {
      const view = editorViewRef.current
      if (!view) return

      const inputTag = `{{${inputName}}}`,
        { from } = view.state.selection.main
      view.dispatch({
        changes: { from, insert: inputTag },
        selection: { anchor: from + inputTag.length }
      })
      setIsPopoverOpen(false)
    }, []),
    // Create language with current inputs
    templateTags = data.dynamicHandles['template-tags'],
    extensions = useMemo(() => {
      const validLabels = templateTags.map(input => input.name)
      return [createPromptLanguage(validLabels)]
    }, [templateTags])

  return (
    <BaseNode
      className={cn('min-w-80', {
        'border-orange-500': data.status === 'processing',
        'border-red-500': data.status === 'error'
      })}
      selected={selected}>
      <NodeHeader className='m-0'>
        <NodeHeaderIcon>
          <PencilRuler />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Template</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderStatus status={data.status} />
          {deletable ? (
            <NodeHeaderAction label='Delete node' onClick={onDeleteNode} variant='ghost'>
              <Trash />
            </NodeHeaderAction>
          ) : null}
        </NodeHeaderActions>
      </NodeHeader>
      <Popover onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
        <PopoverTrigger asChild>
          <Button className='h-7 px-2' size='sm' variant='outline'>
            <BetweenVerticalEnd />
            Insert Input
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='p-0'>
          <Command>
            <CommandInput placeholder='Search inputs...' />
            <CommandList>
              <CommandEmpty>No inputs found.</CommandEmpty>
              <CommandGroup>
                {data.dynamicHandles['template-tags'].map(
                  input =>
                    input.name && (
                      <CommandItem className='text-base' key={input.id} onSelect={() => insertInputAtCursor(input.name)}>
                        {input.name}
                      </CommandItem>
                    )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <CodeMirror
        basicSetup={{
          foldGutter: false,
          lineNumbers: false
        }}
        className='nodrag nopan nowheel overflow-hidden rounded-md [&_.cm-content]:!cursor-text [&_.cm-line]:!cursor-text'
        extensions={extensions}
        onChange={onPromptTextChange}
        onCreateEditor={view => {
          editorViewRef.current = view
        }}
        placeholder='Craft your prompt here... Use {{input-name}} to reference inputs'
        theme={promptTheme}
        value={data.config.template || ''}
      />
      <div className='flex items-center justify-between rounded-lg bg-muted p-1 pl-3'>
        Inputs
        <EditableHandleDialog align='end' onSave={handleCreateInput} variant='create'>
          <Button size='sm' variant='outline'>
            <Plus />
            Add
          </Button>
        </EditableHandleDialog>
      </div>
      {data.dynamicHandles['template-tags'].map(input => (
        <EditableHandle
          handleId={input.id}
          key={input.id}
          name={input.name}
          nodeId={id}
          onDelete={handleRemoveInput}
          onUpdateTool={handleUpdateInputName}
          position={Position.Left}
          type='target'
          wrapperClassName='w-full'
        />
      ))}
      <LabeledHandle id='result' position={Position.Right} title='Result' type='source' />
    </BaseNode>
  )
}
