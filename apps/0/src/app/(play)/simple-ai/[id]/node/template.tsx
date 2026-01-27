/* eslint-disable max-statements */
import type { EditorView } from '@codemirror/view'
import type { NodeProps } from '@xyflow/react'

import { Button } from '@a/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@a/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@a/ui/popover'
import { StreamLanguage } from '@codemirror/language'
import { tags as hl } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import CodeMirror from '@uiw/react-codemirror'
import { Position, useUpdateNodeInternals } from '@xyflow/react'
import { BetweenVerticalEnd, PencilRuler, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Item, List } from '~/components/dnd-list'
import { BaseNode } from '~/components/node'

import type { TemplateNode } from '../flowui/node-factory'
import type { NodeState } from '../flowui/types'

import { EditableHandle, EditableHandleDialog } from '../flowui/editable-handle'
import { LabeledHandle } from '../flowui/labeled-handle'
import useFlow from '../flowui/use-flow'

const promptTheme = createTheme({
    settings: {
      background: 'transparent',
      caret: 'black',
      foreground: 'hsl(var(--foreground))',
      lineHighlight: 'transparent',
      selection: '#88888855'
    },
    styles: [
      { color: '#10c43d', tag: hl.variableName },
      { color: 'hsl(var(--foreground))', tag: hl.string },
      { color: '#DC2626', tag: hl.invalid }
    ],
    theme: 'dark'
  }),
  // eslint-disable-next-line require-unicode-regexp
  BRACE_REGEX = /{{[^}]*}}/,
  createPromptLanguage = (tags: string[]) =>
    StreamLanguage.define({
      token: stream => {
        /* oxlint-disable unicorn/prefer-regexp-test */
        if (stream.match(BRACE_REGEX)) {
          const match = stream.current()
          if (tags.includes(match.slice(2, -2))) return 'variableName'
          return 'invalid'
        }
        stream.next()
        return null
      }
    })

type TemplateProps = NodeProps<TemplateNode & { state?: NodeState }>

const Template = ({ data: { tags, text }, id, selected }: TemplateProps) => {
  const { addHandle, deleteHandle, deleteNode, updateNode } = useFlow(),
    refresh = useUpdateNodeInternals(),
    onPromptTextChange = (t: string) => updateNode(id, 'template', { text: t }),
    createTag = (tag: string) => {
      if (!tag) {
        toast.error('Tag cannot be empty')
        return
      }
      if (tags.some(t => t.tag === tag)) {
        toast.error('Tag already exists')
        return
      }
      addHandle(id, 'template', 'tags', { tag })
      refresh(id)
    },
    removeTag = (handleId: string) => {
      deleteHandle(id, 'template', 'tags', handleId)
      refresh(id)
    },
    updateTag = (handleId: string, newTag: string) => {
      if (!newTag) {
        toast.error('Tag cannot be empty')
        return
      }
      if (tags.some(t => t.tag === newTag && t.id !== handleId)) {
        toast.error('Tag already exists')
        return
      }
      const old = tags.find(t => t.id === handleId)
      if (!old) return
      const newText = text.replaceAll(`{{${old.tag}}}`, `{{${newTag}}}`)
      updateNode(id, 'template', {
        tags: tags.map((t): TemplateNode['data']['tags'][number] => (t.id === handleId ? { ...t, tag: newTag } : t)),
        text: newText
      })
      refresh(id)
    },
    setTags = (newTags: TemplateNode['data']['tags']) => {
      updateNode(id, 'template', { tags: newTags })
      refresh(id)
    },
    [popOpen, setPopOpen] = useState(false),
    editorViewRef = useRef<EditorView>(null),
    insertInputAtCursor = (tag: string) => {
      const view = editorViewRef.current
      if (!view) return
      const insert = `{{${tag}}}`,
        { from } = view.state.selection.main
      view.dispatch({ changes: { from, insert }, selection: { anchor: from + insert.length } })
      setPopOpen(false)
    }

  return (
    <BaseNode
      className='flex min-w-80 flex-col'
      Icon={PencilRuler}
      label='Template'
      onDelete={() => deleteNode(id)}
      selected={selected}>
      <Popover onOpenChange={setPopOpen} open={popOpen}>
        <PopoverTrigger asChild>
          <Button className='ml-auto h-7 px-2' size='sm' variant='outline'>
            <BetweenVerticalEnd />
            Insert Input
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='p-0'>
          <Command>
            <CommandInput placeholder='Search tags...' />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags.map(
                  t =>
                    t.tag && (
                      <CommandItem className='text-base' key={t.id} onSelect={() => insertInputAtCursor(t.tag)}>
                        {t.tag}
                      </CommandItem>
                    )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <CodeMirror
        basicSetup={{ foldGutter: false, lineNumbers: false }}
        className='nodrag nopan nowheel overflow-hidden rounded-md [&_.cm-content]:cursor-text! [&_.cm-line]:cursor-text!'
        extensions={[createPromptLanguage(tags.map(t => t.tag))]}
        onChange={onPromptTextChange}
        onCreateEditor={view => {
          editorViewRef.current = view
        }}
        placeholder='Use {{tag-name}} to reference tags'
        theme={promptTheme}
        value={text}
      />
      <div className='flex items-center justify-between rounded-lg bg-muted p-1 pl-3 text-sm font-medium'>
        Tags
        <EditableHandleDialog onSave={createTag} showDescription={false} variant='create'>
          <Button size='sm' variant='outline'>
            <Plus />
            Add
          </Button>
        </EditableHandleDialog>
      </div>
      <List
        items={tags}
        renderItem={t => (
          <Item className='nodrag group/handle relative -mx-1.5 mt-1 flex min-h-7 items-center pr-2 pl-3' id={t.id}>
            <EditableHandle
              handleId={t.id}
              label={t.tag}
              nodeId={id}
              onDelete={removeTag}
              onUpdateTool={updateTag}
              position={Position.Left}
              showDescription={false}
              type='target'
            />
          </Item>
        )}
        setItems={setTags}
      />
      <LabeledHandle className='mt-1' id='result' position={Position.Right} type='source' />
    </BaseNode>
  )
}

export default Template
