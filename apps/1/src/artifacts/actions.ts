'use server'

import { getSuggestionsByDocumentId } from '~/lib/db'

export const getSuggestions = async ({ documentId }: { documentId: string }) => {
  const suggestions = await getSuggestionsByDocumentId({ documentId })
  return suggestions.length ? suggestions : []
}
