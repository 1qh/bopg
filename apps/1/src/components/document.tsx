/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Spinner } from '@a/ui/spinner'
import { FileText, MessageCircle, Pencil } from 'lucide-react'
import { memo } from 'react'
import { toast } from 'sonner'

import { useArtifact } from '~/hooks/use-artifact'

import type { ArtifactKind } from './artifact'

const getActionText = (type: 'create' | 'request-suggestions' | 'update', tense: 'past' | 'present') => {
  switch (type) {
    case 'create':
      return tense === 'present' ? 'Creating' : 'Created'
    case 'request-suggestions':
      return tense === 'present' ? 'Adding suggestions' : 'Added suggestions to'
    case 'update':
      return tense === 'present' ? 'Updating' : 'Updated'
    default:
      return null
  }
}

interface DocumentToolResultProps {
  isReadonly: boolean
  result: { id: string; kind: ArtifactKind; title: string }
  type: 'create' | 'request-suggestions' | 'update'
}

const PureDocumentToolResult = ({ isReadonly, result, type }: DocumentToolResultProps) => {
  const { setArtifact } = useArtifact()
  return (
    <button
      className='mb-2 flex w-fit items-center gap-1 rounded-full border p-1 px-2 text-sm font-light tracking-tight text-muted-foreground transition-all duration-300 hover:scale-[102%] hover:bg-background hover:text-foreground [&>svg]:size-4 [&>svg]:stroke-1'
      onClick={e => {
        if (isReadonly) {
          toast.error('Viewing files in shared chats is currently not supported.')
          return
        }
        const rect = e.currentTarget.getBoundingClientRect(),
          boundingBox = { height: rect.height, left: rect.left, top: rect.top, width: rect.width }
        setArtifact(a => ({
          boundingBox,
          content: a.content,
          documentId: result.id,
          isVisible: true,
          kind: result.kind,
          status: 'idle',
          title: result.title
        }))
      }}
      type='button'>
      {type === 'create' ? (
        <FileText />
      ) : type === 'update' ? (
        <Pencil />
      ) : type === 'request-suggestions' ? (
        <MessageCircle />
      ) : null}
      {getActionText(type, 'past')}
      <span className='truncate font-semibold'>{result.title}</span>
    </button>
  )
}

interface DocumentToolCallProps {
  args:
    | {
        description: string
        id: string
      }
    | { documentId: string }
    | {
        kind: ArtifactKind
        title: string
      }
  isReadonly: boolean
  type: 'create' | 'request-suggestions' | 'update'
}

const PureDocumentToolCall = ({ args, isReadonly, type }: DocumentToolCallProps) => {
  const { setArtifact } = useArtifact()
  return (
    <button
      className='mb-2 flex w-fit items-center gap-1 rounded-full border bg-background p-1 px-2 text-sm font-light tracking-tight transition-all duration-300 hover:scale-[102%] [&>svg]:size-4 [&>svg]:stroke-1'
      onClick={e => {
        if (isReadonly) {
          toast.error('Viewing files in shared chats is currently not supported.')
          return
        }
        const rect = e.currentTarget.getBoundingClientRect(),
          boundingBox = { height: rect.height, left: rect.left, top: rect.top, width: rect.width }
        setArtifact(a => ({ ...a, boundingBox, isVisible: true }))
      }}
      type='button'>
      {type === 'create' ? (
        <FileText />
      ) : type === 'update' ? (
        <Pencil />
      ) : type === 'request-suggestions' ? (
        <MessageCircle />
      ) : null}
      {`${getActionText(type, 'present')} ${
        type === 'create' && 'title' in args && args.title
          ? `"${args.title}"`
          : type === 'update' && 'description' in args
            ? `"${args.description}"`
            : type === 'request-suggestions'
              ? 'for document'
              : ''
      }`}
      <Spinner />
    </button>
  )
}

export const DocumentToolResult = memo(PureDocumentToolResult, () => true),
  DocumentToolCall = memo(PureDocumentToolCall, () => true)
