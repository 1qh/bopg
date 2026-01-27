import type { Suggestion } from '@a/db/schema'
import type { InferUITool, UIMessage } from 'ai'
import type { AppUsage } from 'types'

import type createDocument from '~/ai/tools/create-document'
import type getWeather from '~/ai/tools/get-weather'
import type requestSuggestions from '~/ai/tools/request-suggestions'
import type updateDocument from '~/ai/tools/update-document'
import type { ArtifactKind } from '~/components/artifact'

interface Attachment {
  contentType: string
  name: string
  url: string
}
// @ts-expect-error - x
type ChatMessage = UIMessage<{ createdAt: string }, CustomUIDataTypes, ChatTools>
interface ChatTools {
  createDocument: createDocumentTool
  getWeather: weatherTool
  requestSuggestions: requestSuggestionsTool
  updateDocument: updateDocumentTool
}

type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>
interface CustomUIDataTypes {
  appendMessage: string
  'chat-title': string
  clear: null
  codeDelta: string
  finish: null
  id: string
  imageDelta: string
  kind: ArtifactKind
  sheetDelta: string
  suggestion: Suggestion
  textDelta: string
  title: string
  usage: AppUsage
}
type requestSuggestionsTool = InferUITool<ReturnType<typeof requestSuggestions>>
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>
type weatherTool = InferUITool<typeof getWeather>

export type { Attachment, ChatMessage, ChatTools, CustomUIDataTypes }
