import type { UIMessage } from 'ai'

import { convertToModelMessages, streamText } from 'ai'

import openai from '~/openai'
import { api } from '~/trpc/server'

const POST = async (request: Request) => {
  const { id, messages: uiMsg } = (await request.json()) as { id: string; messages: UIMessage[] }
  return streamText({
    messages: await convertToModelMessages(uiMsg),
    model: openai('qwen3-vl:4b-thinking')
  }).toUIMessageStreamResponse({
    onError: error => {
      console.error('[Stream Error]', error)
      return error instanceof Error ? error.message : 'An unexpected error occurred.'
    },
    onFinish: async ({ messages }) => {
      await api.conversation.update({ id, messages: [...uiMsg, ...messages] })
    }
  })
}

export { POST }
