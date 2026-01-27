import { Copy, LineChart, Redo, Sparkles, Undo } from 'lucide-react'
import { parse, unparse } from 'papaparse'
import { toast } from 'sonner'

import { Artifact } from '~/components/create-artifact'
import { SpreadsheetEditor } from '~/components/sheet-editor'

export default new Artifact<'sheet', unknown>({
  actions: [
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
      description: 'Copy as csv',
      icon: <Copy />,
      onClick: ({ content }) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true }),
          nonEmptyRows = parsed.data.filter(row => row.some(cell => cell.trim() !== '')),
          cleanedCsv = unparse(nonEmptyRows)
        navigator.clipboard.writeText(cleanedCsv)
        toast.success('Copied csv to clipboard!')
      }
    }
  ],
  content: ({ content, onSaveContent }) => <SpreadsheetEditor content={content} saveContent={onSaveContent} />,
  description: 'Useful for working with spreadsheets',
  initialize: () => {
    //
  },
  kind: 'sheet',
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'data-sheetDelta')
      setArtifact(a => ({
        ...a,
        content: streamPart.data,
        isVisible: true,
        status: 'streaming'
      }))
  },
  toolbar: [
    {
      description: 'Format and clean data',
      icon: <Sparkles />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          parts: [{ text: 'Can you please format and clean the data?', type: 'text' }],
          role: 'user'
        })
      }
    },
    {
      description: 'Analyze and visualize data',
      icon: <LineChart />,
      onClick: ({ sendMessage }) => {
        sendMessage({
          parts: [
            {
              text: 'Can you please analyze and visualize the data by creating a new code artifact in python?',
              type: 'text'
            }
          ],
          role: 'user'
        })
      }
    }
  ]
})
