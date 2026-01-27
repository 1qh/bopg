import type { ArtifactKind } from '~/components/artifact'

import { getSession } from '~/auth/server'
import { deleteDocumentsByIdAfterTimestamp, getDocumentsById, saveDocument } from '~/lib/db'
import ChatSDKError from '~/lib/errors'

export const DELETE = async (request: Request) => {
  const { searchParams } = new URL(request.url),
    id = searchParams.get('id'),
    timestamp = searchParams.get('timestamp')
  if (!id) return new ChatSDKError('bad_request:api', 'Parameter id is required.').toResponse()
  if (!timestamp) return new ChatSDKError('bad_request:api', 'Parameter timestamp is required.').toResponse()
  const session = await getSession()
  if (!session?.user) return new ChatSDKError('unauthorized:document').toResponse()
  const documents = await getDocumentsById({ id }),
    [document] = documents
  if (document?.userId !== session.user.id) return new ChatSDKError('forbidden:document').toResponse()
  const documentsDeleted = await deleteDocumentsByIdAfterTimestamp({ id, timestamp: new Date(timestamp) })
  return Response.json(documentsDeleted, { status: 200 })
}
export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url),
    id = searchParams.get('id')
  if (!id) return new ChatSDKError('bad_request:api', 'Parameter id is missing').toResponse()
  const session = await getSession()
  if (!session?.user) return new ChatSDKError('unauthorized:document').toResponse()
  const documents = await getDocumentsById({ id }),
    [document] = documents
  if (!document) return new ChatSDKError('not_found:document').toResponse()
  if (document.userId !== session.user.id) return new ChatSDKError('forbidden:document').toResponse()
  return Response.json(documents, { status: 200 })
}
export const POST = async (request: Request) => {
  const { searchParams } = new URL(request.url),
    id = searchParams.get('id')
  if (!id) return new ChatSDKError('bad_request:api', 'Parameter id is required.').toResponse()
  const session = await getSession()
  if (!session?.user) return new ChatSDKError('not_found:document').toResponse()
  const { content, kind, title } = (await request.json()) as { content: string; kind: ArtifactKind; title: string },
    documents = await getDocumentsById({ id })
  if (documents.length > 0) {
    const [doc] = documents
    if (doc?.userId !== session.user.id) return new ChatSDKError('forbidden:document').toResponse()
  }
  const document = await saveDocument({ content, id, kind, title, userId: session.user.id })
  return Response.json(document, { status: 200 })
}
