import { getSession } from '~/auth/server'
import { getSuggestionsByDocumentId } from '~/lib/db'
import ChatSDKError from '~/lib/errors'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url),
    documentId = searchParams.get('documentId')
  if (!documentId) return new ChatSDKError('bad_request:api', 'Parameter documentId is required.').toResponse()
  const session = await getSession()
  if (!session?.user) return new ChatSDKError('unauthorized:suggestions').toResponse()
  const suggestions = await getSuggestionsByDocumentId({ documentId }),
    [suggestion] = suggestions
  if (!suggestion) return Response.json([], { status: 200 })
  if (suggestion.userId !== session.user.id) return new ChatSDKError('forbidden:api').toResponse()
  return Response.json(suggestions, { status: 200 })
}
