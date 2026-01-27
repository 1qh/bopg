import type { Suggestion } from '@a/db/schema'

import { DiffEditor } from '@monaco-editor/react'
import { Copy, History, Lightbulb, MessageCircle, PenTool, Redo, Undo } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { Artifact } from '~/components/create-artifact'
import { DocumentSkeleton } from '~/components/document-skeleton'
import { Editor } from '~/components/text-editor'

import { getSuggestions } from '../actions'

interface TextArtifactMetadata {
  suggestions: Suggestion[]
}
export default new Artifact<'text', TextArtifactMetadata>({
  actions: [
    {
      description: 'View changes',
      icon: <History />,
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
      onClick: ({ handleVersionChange }) => handleVersionChange('toggle')
    },
    {
      description: 'Previous version',
      icon: <Undo />,
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
      onClick: ({ handleVersionChange }) => handleVersionChange('prev')
    },
    {
      description: 'Next version',
      icon: <Redo />,
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
      onClick: ({ handleVersionChange }) => handleVersionChange('next')
    },
    {
      description: 'Copy to clipboard',
      icon: <Copy />,
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content)
        toast.success('Copied to clipboard!')
      }
    }
  ],
  content: ({ content, currentVersionIndex, getDocAt, isLoading, metadata, mode, onSaveContent, status }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { theme } = useTheme()
    if (isLoading) return <DocumentSkeleton artifactKind='text' />
    if (mode === 'diff')
      return (
        <DiffEditor
          modified={getDocAt(currentVersionIndex)}
          options={{ readOnly: true, renderSideBySide: false, wordWrap: 'on' }}
          original={getDocAt(0)}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
        />
      )
    return (
      <div className='flex px-10 py-8'>
        <Editor
          content={content}
          onSaveContent={onSaveContent}
          status={status}
          suggestions={metadata?.suggestions ?? []}
        />
        {metadata?.suggestions.length ? <div className='h-dvh w-12 shrink-0 md:hidden' /> : null}
      </div>
    )
  },
  description: 'Useful for text content, like drafting essays and emails.',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/strict-void-return
  initialize: async ({ documentId, setMetadata }) => {
    const suggestions = await getSuggestions({ documentId })
    setMetadata({ suggestions })
  },
  kind: 'text',
  onStreamPart: ({ setArtifact, setMetadata, streamPart }) => {
    if (streamPart.type === 'data-suggestion')
      setMetadata(metadata => ({
        suggestions: [...metadata.suggestions, streamPart.data]
      }))
    if (streamPart.type === 'data-textDelta')
      setArtifact(a => ({
        ...a,
        content: a.content + streamPart.data,
        isVisible: a.status === 'streaming' && a.content.length > 400 && a.content.length < 450 ? true : a.isVisible,
        status: 'streaming'
      }))
  },
  toolbar: [
    {
      description: 'Add final polish',
      icon: <PenTool />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          parts: [
            {
              text: 'Please add final polish and check for grammar, add section titles for better structure, and ensure everything reads smoothly.',
              type: 'text'
            }
          ],
          role: 'user'
        })
      }
    },
    {
      description: 'Adjust reading level',
      icon: <Lightbulb />,
      onClick: () => {
        //
      }
    },
    {
      description: 'Request suggestions',
      icon: <MessageCircle />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          parts: [
            {
              text: 'Please add suggestions you have that could improve the writing.',
              type: 'text'
            }
          ],
          role: 'user'
        })
      }
    }
  ]
})
