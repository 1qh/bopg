import type { DBMessage, Document } from '@a/db/schema'
import type { UIMessagePart } from 'ai'

import { formatISO } from 'date-fns'

import type { ChatMessage, ChatTools, CustomUIDataTypes } from '~/types'

import ChatSDKError from '~/lib/errors'

interface CauseCode {
  cause: string
  code: `${ChatSDKError['type']}:${ChatSDKError['surface']}`
}

export const fetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      const { cause, code } = (await response.json()) as CauseCode
      throw new ChatSDKError(code, cause)
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.json()
  },
  convertToUIMessages = (messages: DBMessage[]): ChatMessage[] =>
    messages.map(m => ({
      id: m.id,
      metadata: { createdAt: formatISO(m.createdAt) },
      // @ts-expect-error - x
      parts: m.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
      role: m.role as 'assistant' | 'system' | 'user'
    })),
  fetchWithErrorHandlers = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const response = await fetch(input, init)
      if (!response.ok) {
        const { cause, code } = (await response.json()) as CauseCode
        throw new ChatSDKError(code, cause)
      }
      return response
    } catch (error: unknown) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) throw new ChatSDKError('offline:chat')
      throw error
    }
  },
  randomId = (): string => crypto.randomUUID(),
  getDocumentTimestampByIndex = (documents: Document[], index: number) => documents[index]?.createdAt ?? new Date(),
  sanitizeText = (text: string) => text.replace('<has_function_call>', '')
