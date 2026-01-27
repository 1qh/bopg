import type { Session } from '@a/db/schema'
import type { UIMessageStreamWriter } from 'ai'

import { tool } from 'ai'
import { object, string, enum as zenum } from 'zod/v4'

import type { ChatMessage } from '~/types'

import { artifactKinds, documentHandlersByArtifactKind } from '~/lib/artifact'
import { randomId } from '~/utils'

interface CreateDocumentProps {
  dataStream: UIMessageStreamWriter<ChatMessage>
  session: Session
}

const createDocument = ({ dataStream, session }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    execute: async ({ kind, title }) => {
      const id = randomId()
      dataStream.write({ data: kind, transient: true, type: 'data-kind' })
      dataStream.write({ data: id, transient: true, type: 'data-id' })
      dataStream.write({ data: title, transient: true, type: 'data-title' })
      dataStream.write({ data: null, transient: true, type: 'data-clear' })
      const handler = documentHandlersByArtifactKind.find(h => h.kind === kind)
      if (!handler) throw new Error(`No document handler found for kind: ${kind}`)
      await handler.onCreateDocument({ dataStream, id, session, title })
      dataStream.write({ data: null, transient: true, type: 'data-finish' })
      return { content: 'A document was created and is now visible to the user.', id, kind, title }
    },
    inputSchema: object({ kind: zenum(artifactKinds), title: string() })
  })

export default createDocument
