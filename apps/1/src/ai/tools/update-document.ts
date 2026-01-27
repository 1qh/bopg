import type { Session } from '@a/db/schema'
import type { UIMessageStreamWriter } from 'ai'

import { tool } from 'ai'
import { object, string } from 'zod/v4'

import type { ChatMessage } from '~/types'

import { documentHandlersByArtifactKind } from '~/lib/artifact'
import { getDocumentById } from '~/lib/db'

interface UpdateDocumentProps {
  dataStream: UIMessageStreamWriter<ChatMessage>
  session: Session
}

const updateDocument = ({ dataStream, session }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    execute: async ({ description, id }) => {
      const document = await getDocumentById({ id })
      if (!document) return { error: 'Document not found' }
      dataStream.write({ data: null, transient: true, type: 'data-clear' })
      const handler = documentHandlersByArtifactKind.find(h => h.kind === document.kind)
      if (!handler) throw new Error(`No document handler found for kind: ${document.kind}`)
      await handler.onUpdateDocument({ dataStream, description, document, session })
      dataStream.write({ data: null, transient: true, type: 'data-finish' })
      return { content: 'The document has been updated successfully.', id, kind: document.kind, title: document.title }
    },
    inputSchema: object({
      description: string().describe('The description of changes that need to be made'),
      id: string().describe('The ID of the document to update')
    })
  })

export default updateDocument
