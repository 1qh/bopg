import type { Document, Session } from '@a/db/schema'
import type { UIMessageStreamWriter } from 'ai'

import type { ArtifactKind } from '~/components/artifact'
import type { ChatMessage } from '~/types'

import codeDocumentHandler from '~/artifacts/code/server'
import sheetDocumentHandler from '~/artifacts/sheet/server'
import textDocumentHandler from '~/artifacts/text/server'

import { saveDocument } from './db'

interface CreateDocumentCallbackProps {
  dataStream: UIMessageStreamWriter<ChatMessage>
  id: string
  session: Session
  title: string
}

interface DocumentHandler<T = ArtifactKind> {
  kind: T
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>
}

interface UpdateDocumentCallbackProps {
  dataStream: UIMessageStreamWriter<ChatMessage>
  description: string
  document: Document
  session: Session
}

// eslint-disable-next-line preferArrow/prefer-arrow-functions, func-style
function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        dataStream: args.dataStream,
        id: args.id,
        session: args.session,
        title: args.title
      })
      if (args.session.userId)
        await saveDocument({
          content: draftContent,
          id: args.id,
          kind: config.kind,
          title: args.title,
          userId: args.session.userId
        })
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        dataStream: args.dataStream,
        description: args.description,
        document: args.document,
        session: args.session
      })
      if (args.session.userId)
        await saveDocument({
          content: draftContent,
          id: args.document.id,
          kind: config.kind,
          title: args.document.title,
          userId: args.session.userId
        })
    }
  }
}

const documentHandlersByArtifactKind = [textDocumentHandler, codeDocumentHandler, sheetDocumentHandler],
  artifactKinds = ['text', 'code', 'sheet'] as const

export { artifactKinds, createDocumentHandler, documentHandlersByArtifactKind }
